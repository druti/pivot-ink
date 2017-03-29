var c = DEPNES.namespace('lib.collections'),
    r = DEPNES.namespace('lib.collections.rootPosts'),
    util = DEPNES.namespace('lib.helpers.utilities');

c.RootPosts = new Mongo.Collection('rootPosts');

r.validate = function (rootPost) {
  var errors = {};
  if (!rootPost.title) {
    errors.title = 'Please provide a title';
  }
  if (!rootPost.content) {
    errors.content = 'Please provide some content';
  }
  return errors;
};

r.checkErrors = function (errors) {
  if (errors.title || errors.content) {
    throw new Meteor.Error('invalid-root-post', 'You must set a title and content for your root post');
  }
};

r.serverValidate = function (rootPost) {
  var rootPostCopy = {
    title: rootPost.title,
    content: util.stripHTMLArray(rootPost.content)
  },
  errors = r.validate(rootPostCopy);
  r.checkErrors(errors);
};
