var branch = DEPNES.namespace('lib.collections.branchPosts'),
    editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    posts = DEPNES.namespace('client.helpers.posts'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.BranchPostSubmit.onCreated(function () {
  // clear possible errors from previous session
  Session.set('BranchPostSubmitErrors', {});

  var self = this;
  self.autorun(function () {
    self.subscribe('paths');
    self.subscribe('branchPosts');
    self.subscribe('intactContents');
  });
});

Template.BranchPostSubmit.helpers({
  errorMessage: function (field) {
    return Session.get('BranchPostSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('BranchPostSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.BranchPostSubmit.events({
  'submit form': function (e) {
    util.preventDefault(e);

    var parentId = FlowRouter.getParam('parent_id'),
        rootId = FlowRouter.getParam('r_id'),
        pathId = FlowRouter.getParam('p_id'),
        errors;

    var branchPost = {
      content: posts.intactToFormatted(editor.quill.getHTML())
    },
    branchPostCopy = {
      content: util.stripHTML(editor.quill.getText())
    };


    //validate branchPost
    errors = branch.validate(branchPostCopy);
    if (errors.content) {
      return Session.set('BranchPostSubmitErrors', errors);
    }

    Meteor.call('/post/branch/insert', branchPost, {
      parentId: parentId,
      from: 'branch',
      rootId: rootId,
      pathId: pathId
    },
    function (err, result) {
      if (err) {
        clientHelpers.callout('alert', err.reason);
      } else {
        FlowRouter.go('PostPage', {_id: rootId}, {'path_id': result._id});
      }
    });
  }
});
