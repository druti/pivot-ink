var c = DEPNES.namespace('lib.collections');

Template.PostsList.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('rootPosts');
  });
});

Template.PostsList.helpers({
  posts: function () {
    return c.RootPosts.find({}, {sort: {createdAt: -1}});
  }
});
