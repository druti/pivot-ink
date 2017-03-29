var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts'),
    b = DEPNES.namespace('lib.collections.branchPosts'),
    n = DEPNES.namespace('lib.collections.notifications');

Meteor.methods({
  '/post/replacement/insert': function (postAttributes, replacedIdStack, pathId) {
    check(postAttributes, {
      content: [String]
    });
    check(replacedIdStack, [String]);
    check(pathId, String);

    var firstReplacedPost = c.BranchPosts.findOne(replacedIdStack[0]),
        rootId = firstReplacedPost.rootId,
        currentPathIdStack = c.Paths.findOne(pathId).idStack,
        start = currentPathIdStack.indexOf(replacedIdStack[0]);

    b.serverValidate(postAttributes);
    p.populateNew(postAttributes, 'branch', rootId);

    // if story starts with a line break, remove it and repeat until it
    // doesn't
    p.removeLeadingLineBreak(postAttributes.content);

    // not appending line break because replacement selection can't end or start
    // with a line break.

    // store complete content before it's split into individual posts
    p.insertIntactContent(postAttributes);

    // loop through paragraphs inserting a BranchPost with a parentId of the
    // previous for each one.  Simultaneously create the new newIdStack.
    newIdStack = b.insertPosts(postAttributes, 1);

    // parentIds of first replaced post transfered over to first replacement
    // post
    c.BranchPosts.update(newIdStack[0], {$set: {parentIds: firstReplacedPost.parentIds}});

    // find all posts with the last replaced id as a parent and push last new id
    // to their parentIds array
    c.BranchPosts.update({
      parentIds: replacedIdStack[replacedIdStack.length-1]
    }, {
      $push: {
        parentIds: newIdStack[newIdStack.length-1]
      }
    }, {multi: true});

    // cache id of parent of first replaced post
    var iO = currentPathIdStack.indexOf(replacedIdStack[0]),
        parentId = currentPathIdStack[iO-1];

    var createdAt = c.BranchPosts.findOne(newIdStack[0]).createdAt,
        args = [start, replacedIdStack.length].concat(newIdStack);

    Array.prototype.splice.apply(currentPathIdStack, args);

    pathId = b.insertPath(currentPathIdStack, rootId, createdAt);

    // send branch notification
    n.insertBranchNotif(rootId, pathId, parentId, postAttributes.author, postAttributes.userId);

    return {
      rootId,
      pathId
    };
  }
});
