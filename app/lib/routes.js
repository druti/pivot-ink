if (Meteor.isClient) {
  BlazeLayout.setRoot('body');
}

FlowRouter.route('/', {
  name: 'Root',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'PostsList'});
  }
});

FlowRouter.route('/posts/:_id', {
  name: 'PostPage',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'PostPage'});
  }
});

FlowRouter.route('/forgot_password', {
  name: 'ForgotPassword',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'ForgotPassword'});
  }
});

FlowRouter.route('/terms', {
  name: 'TermsOfUse',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'TermsOfUse'});
  }
});

FlowRouter.route('/loading', {
  name: 'Loading',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'LoadingFull'});
  }
});

FlowRouter.route('/access-denied', {
  name: 'Loading',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'AccessDenied'});
  }
});



var submitRoutes = FlowRouter.group({
  name: 'SubmitRoutes',
  triggersEnter: [requireLogin]
});

submitRoutes.route('/submit', {
  name: 'RootPostSubmit',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'RootPostSubmit'});
  }
});

submitRoutes.route('/posts/:r_id/:p_id/:parent_id/branch_submit', {
  name: 'BranchPostSubmit',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'BranchPostSubmit'});
  }
});

submitRoutes.route('/posts/:r_id/:p_id/:parent_id/continuation_submit', {
  name: 'ContinuationPostSubmit',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'ContinuationPostSubmit'});
  }
});

submitRoutes.route('/posts/:r_id/:path_id/:start_index/:end_index/replacement_submit', {
  name: 'ReplacementPostSubmit',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'ReplacementPostSubmit'});
  }
});

/*
submitRoutes.route('/posts/:r_id/:p_id/:g_id/edit', {
  name: 'PostEdit',
  action: function () {
    BlazeLayout.render('MasterLayout', {content: 'PostEdit'});
  }
});
*/



// Trigger Callbacks
function requireLogin(context, redirect, stop) {
  if (!Meteor.user() && !Meteor.loggingIn()) {
    Session.set('redirectAfterLogin', FlowRouter.current().path);
    redirect('/access-denied')
  }
}
