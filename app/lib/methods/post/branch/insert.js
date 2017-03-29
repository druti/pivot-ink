var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts'),
    b = DEPNES.namespace('lib.collections.branchPosts'),
    n = DEPNES.namespace('lib.collections.notifications');

Meteor.methods({
  '/post/branch/insert': function (postAttributes, spec) {
    return b.insert(postAttributes, spec);
  }
});

b.insert = function (postAttributes, spec) {
  check(Meteor.userId(), String);
  // TODO: be more strict/explicit in postAttributes argument check
  check(postAttributes, {
    content: [String],
    _id: Match.Optional(String),
    title: Match.Optional(String),
    userId: Match.Optional(String),
    author: Match.Optional(String),
    username: Match.Optional(String),
    createdAt: Match.Optional(Date),
    groupId: Match.Optional(String),
    timestamp: Match.Optional(Number),
    commentCount: Match.Optional(Number)
  });
  check(spec, {
    parentId: String,
    from: String,
    rootId: String,
    pathId: Match.Optional(String)
  });

  b.serverValidate(postAttributes, spec.from);

  var parentId = spec.parentId,
      from = spec.from,
      rootId = spec.rootId,
      currentPathId = spec.pathId,
      newIdStack,
      pathId;

  if (from === 'root') {
    // remove irrelevant properties
    delete postAttributes._id;
    delete postAttributes.title;
    // add reference to the rootPost
    postAttributes.rootId = rootId;

    newIdStack = b.insertPosts(postAttributes, parentId);

    pathId = b.insertPath(newIdStack, rootId, postAttributes.createdAt);

    return {
      _id: pathId,
      idStack: newIdStack
    };

  } else if (from === 'branch' || 'continuation') {
    if (typeof currentPathId === undefined) {
      throw new Meteor.Error('if calling from branch or continuation provide a pathId');
    }
    p.populateNew(postAttributes, 'branch', rootId);

    // if story starts with a line break, remove it and repeat until it
    // doesn't
    p.removeLeadingLineBreak(postAttributes.content);

    // if story doesn't end with a line break, add a single line break
    p.appendLineBreak(postAttributes.content);

    // store complete content before it's split into individual posts
    p.insertIntactContent(postAttributes);

    // cache the original parentId before it's overwritten
    var originalParentId = parentId;

    // loop through paragraphs inserting a BranchPost with a parentId of the
    // previous for each one.  Simultaneously create the new newIdStack.
    newIdStack = b.insertPosts(postAttributes, parentId);

    var currentIdStack,
        newCompleteIdStack;

    //////
    //// if method is being invoked to create a branch from an already
    // existing root story
    if (from === 'branch') {
      var iO;
      currentIdStack = c.Paths.findOne(currentPathId).idStack;
      iO = currentIdStack.indexOf(originalParentId);
      // remove every element from after the branch point onwards
      currentIdStack.splice(iO+1);
      // merge the new id stack (bottom half) with an id stack cut after the
      // branch point (top half) creating a new complete path
      newCompleteIdStack = _.union(currentIdStack, newIdStack);

      pathId = b.insertPath(newCompleteIdStack, rootId, postAttributes.createdAt);

      n.insertBranchNotif(rootId, pathId, originalParentId, postAttributes.author, postAttributes.userId);

      return {
        _id: pathId,
        idStack: newCompleteIdStack
      };

    //////
    ////
    // if method is being invoked to continue an existing story
    } else if (from === 'continuation') {
      var currentPath = c.Paths.findOne(currentPathId);
      currentIdStack = currentPath.idStack;
      // add stack of newly created post ids to a copy of the already existing
      // path who this branches off
      newCompleteIdStack = _.union(currentIdStack, newIdStack);

      c.Paths.update({idStack: currentIdStack}, {$set: {idStack: newCompleteIdStack}});

      n.insertContinuationNotif(rootId, currentPath._id, originalParentId, postAttributes.author, postAttributes.userId);

      return {
        _id: currentPath._id
      };
    }
  }
}
