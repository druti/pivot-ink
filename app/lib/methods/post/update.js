var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts'),
    r = DEPNES.namespace('lib.collections.rootPosts'),
    b = DEPNES.namespace('lib.collections.branchPosts');

Meteor.methods({
  '/post/update': function (editedPost, editedGroupId, currentPathId) {
    //////////////////
    // arguments check
    check(Meteor.userId(), String);
    check(editedPost, {
      title: Match.Optional(String),
      content: [String]
    });
    check(editedGroupId, String);
    check(currentPathId, String);
    //////////////////

    if (rootIncluded) {
      r.serverValidate(editedPost);
    } else {
      b.serverValidate(editedPost);
    }

    var oldBranchPosts = c.BranchPosts.find({groupId: editedGroupId}, {sort: {timestamp: 1}}).fetch(),
        ownsPost = Meteor.userId() === oldBranchPosts[0].userId,
        branchCount = oldBranchPosts.length,
        rootCount = c.RootPosts.find({groupId: editedGroupId}).count(),
        rootIncluded = rootCount > 0 ? true : false,
        oldContentLength = rootIncluded ? rootCount + branchCount : branchCount,
        editedContent = editedPost.content,
        drasticChange = editedContent.length !== oldContentLength ? true : false,
        rootId = oldBranchPosts[0].rootId,
        pathId,
        tmpPath;

    if (!ownsPost) {
      return {
        notOwned: true
      };
    }

    if (drasticChange) {
    console.log('drastic edit');

      var areDependents = function () {
        var currentSlide = Session.get(this[0].branchContainerId + '_currentSlide'),
            groupId = this[currentSlide].groupId,
            branchPosts = c.BranchPosts.find({groupId: groupId}).fetch(),
            max = branchPosts.length,
            i = 0;

        for (; i < max; i += 1) {
          var currentBranchPostId = branchPosts[i]._id,
              dependents = !!c.BranchPosts.find({parentIds: currentBranchPostId, groupId: {$not: groupId}}).fetch().length;
          if (dependents) {
            return true;
          }
        }
        return false;
      };

      if (areDependents) {
        console.error('No drastic changes with dependents.');
        return {
          drasticChange: true
        };
      }

      var lastId = oldBranchPosts[branchCount-1]._id;
      pathId = c.Paths.findOne({idStack: lastId})._id;

      if (rootIncluded) {
      console.log('root included');
      // it is a drastic change and the root is included

        p.removeLeadingLineBreak(editedContent);
        p.appendLineBreak(editedContent);

        c.IntactContents.remove({groupId: editedGroupId});
        p.insertIntactContent({content: editedContent, groupId: editedGroupId});

        p.populateNew(editedPost, 'root');
        editedPost.groupId = editedGroupId;

        c.BranchPosts.remove({groupId: editedGroupId});

        var rootContent = editedPost.content.splice(0, 1)[0];

        try {
          b.insert(editedPost, {
            parentId: rootId,
            from: 'root',
            rootId: rootId
          });

          tmpPath = result;
        } catch (err) {
          // TODO remove rootPost that was created.
          // TODO perform cleanup
          p.throwCreationError(err);
        }

        c.Paths.update(pathId, {$set: {idStack: tmpPath.idStack}});
        c.Paths.remove(tmpPath._id);

        // insert root post with only the first paragraph as the content
        editedPost.content = rootContent;
        c.RootPosts.update(rootId, editedPost);

        return {
          _id: rootId,
          pathId: pathId
        };
      } else {
      console.log('root NOT included');
      // it is a drastic change and the root is NOT included
        var parentId = oldBranchPosts[0].parentIds[0];

        try {
          b.insert(editedPost, {
            parentId: parentId,
            from: 'branch',
            rootId: rootId,
            pathId: currentPathId
          });

          tmpPath = result;
        } catch (err) {
          // TODO perform cleanup
          p.throwCreationError(err);
        }

        c.IntactContents.remove({groupId: editedGroupId});
        c.BranchPosts.remove({groupId: editedGroupId});

        c.Paths.remove(tmpPath._id);
        c.Paths.update(pathId, {$set: {idStack: tmpPath.idStack}});

        return {
          _id: rootId,
          pathId: pathId
        };
      }
    } else {
    console.log('NOT a drastic edit');
      if (rootIncluded) {
      console.log('root included');
      // it is NOT a drastic change and the root is included
        // if story starts with a line break, remove it and repeat until it
        // doesn't
        p.removeLeadingLineBreak(editedContent);
        p.appendLineBreak(editedContent);

        c.IntactContents.update({groupId: editedGroupId}, {
          $set: {content: editedContent}
        });
        c.RootPosts.update({groupId: editedGroupId}, {
          $set: {
            title: editedPost.title,
            content: editedContent[0]
          }
        });

        try {
          b.update({
            content: editedContent.splice(1), // remove first paragraph (root)
            groupId: editedGroupId
          });
        } catch (err) {
          // TODO perform cleanup
          p.throwCreationError(err);
        }

        return {
          _id: rootId,
          pathId: currentPathId
        };
      } else {
      console.log('root NOT included');
      // it is NOT a drastic change the root is NOT included
        // if story starts with a line break, remove it and repeat until it
        // doesn't
        p.removeLeadingLineBreak(editedContent);
        p.appendLineBreak(editedContent);

        c.IntactContents.update({groupId: editedGroupId}, {
          $set: {content: editedContent}
        });

        try {
          b.update({
            content: editedContent,
            groupId: editedGroupId
          });
        } catch (err) {
          // TODO perform cleanup
          p.throwCreationError(err);
        }

        return {
          _id: rootId,
          pathId: currentPathId
        };
      }
    }
  }
});
