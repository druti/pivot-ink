var root = DEPNES.namespace('lib.collections.rootPosts'),
    editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    posts = DEPNES.namespace('client.helpers.posts'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.RootPostSubmit.onCreated(function () {
  // clear possible errors from previous session
  Session.set('RootPostSubmitErrors', {});
});

Template.RootPostSubmit.helpers({
  errorMessage: function (field) {
    return Session.get('RootPostSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('RootPostSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.RootPostSubmit.events({
  'submit form': function (e, tmpl) {
    util.preventDefault(e);

    var rootPost = {
      title: tmpl.$('[name=title]').val(),
      content: posts.intactToFormatted(editor.quill.getHTML())
    },
    rootPostCopy = {
      title: rootPost.title,
      content: util.stripHTML(editor.quill.getText())
    };

    var errors = root.validate(rootPostCopy);
    if (errors.title || errors.content) {
      return Session.set('RootPostSubmitErrors', errors);
    }

    Meteor.call('/post/root/insert', rootPost, function (err, result) {
      if(err) {
        clientHelpers.callout('alert', err.reason);
      } else if(result.rootPostExists) {
        clientHelpers.callout('alert', 'Post with this title has already been created.');
      } else {
        FlowRouter.go('PostPage', {_id: result._id});
      }
    });
  }
});
