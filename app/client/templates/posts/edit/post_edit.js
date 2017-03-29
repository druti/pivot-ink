var util = DEPNES.namespace('client.helpers.utilities'),
    editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    edit = DEPNES.namespace('client.templates.posts.edit.postEdit'),
    c = DEPNES.namespace('lib.collections'),
    root = DEPNES.namespace('lib.collections.rootPosts'),
    branch = DEPNES.namespace('lib.collections.branchPosts'),
    posts = DEPNES.namespace('client.helpers.posts'),
    clientHelpers = DEPNES.namespace('client.helpers');

edit.rootIncluded = function () {
  var rootId = FlowRouter.getParam('r_id'),
      groupId = FlowRouter.getParam('g_id'),
      rootPost = c.RootPosts.findOne(rootId),
      intactContent = c.IntactContents.findOne({groupId: groupId});

  if (typeof rootPost !== "undefined" && typeof intactContent !== "undefined") {
    if (rootPost.groupId === intactContent.groupId) {
      return true;
    }
  }
  return false;
};

Template.PostEdit.onCreated(function () {
  Session.set('postEditErrors', {});

  var self = this;
  self.autorun(function () {
    self.subscribe('rootPosts');
    self.subscribe('branchPosts');
    self.subscribe('paths');
    self.subscribe('intactContents');
  });
});


Template.PostEdit.helpers({
  rootPost: function () {
    return c.RootPosts.findOne(FlowRouter.getParam('r_id'));
  },
  groupIdData: function () {
    return {groupId: FlowRouter.getParam('g_id')};
  },
  rootIncluded: function () {
    return edit.rootIncluded();
  },
  errorMessage: function (field) {
    return Session.get('postEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  }
});

Template.PostEdit.events({
  'submit form': function (e, tmpl) {
    util.preventDefault(e);

    var rootIncluded = edit.rootIncluded(),
        groupId = FlowRouter.getParam('g_id'),
        pathId = FlowRouter.getParam('p_id');

    var modPost = {
      content: posts.intactToFormatted(editor.quill.getHTML())
    };
    if (rootIncluded) {
      modPost.title = tmpl.$('[name=title]').val();
    }

    var modPostCopy = {
      title: modPost.title,
      content: util.stripHTML(editor.quill.getText())
    };
    var errors;
    if (rootIncluded) {
      errors = root.validate(modPostCopy);
    } else {
      errors = branch.validate(modPostCopy);
    }
    if (errors.title || errors.content) {
      return Session.set('postEditErrors', errors);
    }

    Meteor.call('/post/update', modPost, groupId, pathId, function (err, result) {
      if (err) {
        clientHelpers.callout('alert', err.reason);
      } else if (result.notOwned) {
        clientHelpers.callout('alert', 'Permission denied');
      } else if (result.drasticChange) {
        clientHelpers.callout('alert', 'Drastic changes are currently not allowed if a paragraph involved has any dependents.');
      } else {
        FlowRouter.go('PostPage', {_id: result._id}, {'path_id': result.pathId});
      }
    });
  }

  /*
  'click .delete': function (e) {
    util.preventDefault(e);
    if (confirm('Delete this post?')) {
      var groupId = FlowRouter.getParam('g_id');

      Meteor.call('/post/remove', groupId, function (err) {
        if (err) {
          clientHelpers.callout('alert', err.reason);
        } else {
          Router.go('PostsList');
        }
      });
    }
  }
 */
});
