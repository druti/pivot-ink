var c = DEPNES.namespace('lib.collections');

Meteor.publish('rootPosts', function () {
  return c.RootPosts.find();
});

Meteor.publish('branchPosts', function () {
  return c.BranchPosts.find();
});

Meteor.publish('intactContents', function () {
  return c.IntactContents.find();
});

Meteor.publish('paths', function () {
  return c.Paths.find();
});

Meteor.publish('comments', function (rootId) {
  check(rootId, String);
  return c.Comments.find({rootId: rootId});
});

Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId}, {fields: {'displayName': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish('notifications', function (options) {
  check(options, {read: Boolean});
  return c.Notifications.find({userId: this.userId, read: options.read}, {sort: {timestamp: -1}});
});
