var b = DEPNES.namespace('lib.collections.branchPosts'),
    editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    posts = DEPNES.namespace('client.helpers.posts'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.ContinuationPostSubmit.onCreated(function () {
  // clear possible errors from previous session
  Session.set('ContinuationPostSubmitErrors', {});

  var self = this;
  self.autorun(function () {
    self.subscribe('paths');
    self.subscribe('branchPosts');
  });
});

Template.ContinuationPostSubmit.helpers({
  errorMessage: function (field) {
    return Session.get('ContinuationPostSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('ContinuationPostSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.ContinuationPostSubmit.events({
  'submit form': function (e) {
    util.preventDefault(e);

    var rootId = FlowRouter.getParam('r_id'),
        pathId = FlowRouter.getParam('p_id'),
        parentId = FlowRouter.getParam('parent_id'),
        errors;

    var continuationPost = {
      content: posts.intactToFormatted(editor.quill.getHTML())
    },
    continuationPostCopy = {
      content: util.stripHTML(editor.quill.getText())
    };


    //validate continuationPost
    errors = b.validate(continuationPostCopy);
    if (errors.content) {
      return Session.set('ContinuationPostSubmitErrors', errors);
    }

    Meteor.call('/post/branch/insert', continuationPost, {
      parentId: parentId,
      from: 'continuation',
      rootId: rootId,
      pathId: pathId
    },
    function (err, result) {
      if(err) {
        clientHelpers.callout('alert', err.reason);
      } else {
        FlowRouter.go('PostPage', {_id: rootId}, {'path_id': result._id});
      }
    });
  }
});
