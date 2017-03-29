var c = DEPNES.namespace('lib.collections');

Meteor.methods({
  '/post/remove': function (groupId) {
    check(Meteor.userId(), String);
    check(groupId, String);

    var userId = Meteor.userId();

    if (userId === c.BranchPosts.findOne({groupId: groupId}).userId) {
      c.BranchPosts.remove({groupId: groupId});
      c.RootPosts.remove({groupId: groupId});
      c.IntactContents.remove({groupId: groupId});
    }
  }
});
