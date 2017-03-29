var c = DEPNES.namespace('lib.collections'),
    n = DEPNES.namespace('lib.collections.notifications');

Meteor.methods({
  '/post/comment/insert': function (commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      rootId: String,
      body: String
    });

    var user = Meteor.user(),
        rootPost = c.RootPosts.findOne(commentAttributes.rootId),
        comment;

    if (!rootPost) {
      throw new Meteor.Error('invalid-comment', 'You must comment on a post');
    }

    comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.displayName,
      submitted: new Date()
    });

    // update the RootPost with the number of comments --- this causes postPage
    // to scroll to top because it updates the rootPost TODO fix
    c.RootPosts.update(comment.rootId, {$inc: {commentCount: 1}});

    comment._id = c.Comments.insert(comment);

    n.insertCommentNotif(comment);

    return comment._id;
  }
});
