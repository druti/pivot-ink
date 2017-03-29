var util = DEPNES.namespace('client.helpers.utilities'),
    helpers = DEPNES.namespace('client.helpers');

Template.CommentSubmit.onCreated(function () {
  Session.set('commentSubmitErrors', {});
});

Template.CommentSubmit.helpers({
  errorMessage: function (field) {
    return Session.get('commentSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('commentSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.CommentSubmit.events({
  'submit form': function (e, template) {
    util.preventDefault(e);

    var $body = $(e.target).find('[name=body]');
    var comment = {
      body: $body.val(),
      rootId: template.data._id
    };

    var errors = {};
    if (!comment.body) {
      errors.body = 'Please write some content';
      return Session.set('commentSubmitErrors', errors);
    }

    Meteor.call('/post/comment/insert', comment, function (err, commentId) { //jshint ignore: line
      if (err) {
        helpers.callout('alert', error.reason);
      } else {
        $body.val('');
      }
    });
  }
});
