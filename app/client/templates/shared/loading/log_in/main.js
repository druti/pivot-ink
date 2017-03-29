var loadingLogIn = DEPNES.namespace('client.templates.shared.loading.logIn');

Template.LoadingLogIn.onRendered(function () {
  var interval = 100;

  loadingLogIn.intervalId = Meteor.setInterval(function () {
    if (Meteor.user()) {
      FlowRouter.reload();
    } else {
      if (!Meteor.loggingIn()) {
        BlazeLayout.render('MasterLayout', {content: 'AccessDenied'});
      }
    }
  }, interval);
});

Template.LoadingLogIn.onDestroyed(function () {
  Meteor.clearInterval(loadingLogIn.intervalId);
});
