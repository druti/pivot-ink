var branch = DEPNES.namespace('lib.collections.branchPosts'),
    c = DEPNES.namespace('lib.collections'),
    editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    posts = DEPNES.namespace('client.helpers.posts'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.ReplacementPostSubmit.onCreated(function () {
  // clear possible errors from previous session
  Session.set('ReplacementPostSubmitErrors', {});

  var self = this;
  self.autorun(function () {
    self.subscribe('paths');
    self.subscribe('branchPosts');
  });
});

Template.ReplacementPostSubmit.helpers({
  errorMessage: function (field) {
    return Session.get('ReplacementPostSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('ReplacementPostSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.ReplacementPostSubmit.events({
  'submit form': function (e) {
    util.preventDefault(e);

    var pathId = FlowRouter.getParam('path_id'),
        path = c.Paths.findOne(pathId),
        startIndex = FlowRouter.getParam('start_index'),
        endIndex = FlowRouter.getParam('end_index'),
        replacementIdStack = path.idStack.slice(startIndex, endIndex),
        errors;

    var replacementPost = {
      content: posts.intactToFormatted(editor.quill.getHTML())
    },
    replacementPostCopy = {
      content: util.stripHTML(editor.quill.getText())
    };

    //validate replacementPost
    errors = branch.validate(replacementPostCopy);
    if (errors.content) {
      return Session.set('ReplacementPostSubmitErrors', errors);
    }

    Meteor.call('/post/replacement/insert', replacementPost, replacementIdStack, pathId,
    function (err, result) {
      if (err) {
        clientHelpers.callout('alert', err.reason);
      } else {
        FlowRouter.go('PostPage', {_id: result.rootId}, {'path_id': result.pathId});
      }
    });
  }
});
