var c = DEPNES.namespace('lib.collections'),
    n = DEPNES.namespace('lib.collections.notifications'),
    util = DEPNES.namespace('lib.helpers.utilities');

c.Notifications = new Mongo.Collection('notifications');

c.Notifications.allow({
  insert: function () {
    return true;
  },
  update: function (userId, doc, fieldNames) {
    return util.ownsDocument(userId, doc) &&
      fieldNames.length === 1 && fieldNames[0] === 'read';
  }
});

n.insertCommentNotif = function (comment) {
  var rootPost = c.RootPosts.findOne(comment.rootId);
  if (comment.userId !== rootPost.userId) {
    c.Notifications.insert({
      userId: rootPost.userId,
      rootId: rootPost._id,
      commentId: comment._id,
      author: comment.author,
      timestamp: Date.now(),
      read: false,
      type: 'comment'
    });
  }
};

n.insertContinuationNotif = function (rootId, pathId, parentId, notifierDisplayName, notifierUserId) {
  var parent = c.BranchPosts.findOne(parentId);

  if (notifierUserId !== parent.userId) {
    c.Notifications.insert({
      userId: parent.userId,
      rootId: rootId,
      pathId: pathId,
      parentId: parentId,
      author: notifierDisplayName,
      timestamp: Date.now(),
      read: false,
      type: 'continuation'
    });
  }
};

n.insertBranchNotif = function (rootId, pathId, parentId, notifierDisplayName, notifierUserId) {
  var parent = c.BranchPosts.findOne(parentId);

  if (notifierUserId !== parent.userId) {
    c.Notifications.insert({
      userId: parent.userId,
      rootId: rootId,
      pathId: pathId,
      parentId: parentId,
      author: notifierDisplayName,
      timestamp: Date.now(),
      read: false,
      type: 'branch'
    });
  }
};
