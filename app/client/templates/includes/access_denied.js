var accessDenied = DEPNES.namespace('client.templates.includes.accessDenied');

Template.AccessDenied.onRendered(function() {
  // don't open the log in if one of these is open already
  if(Session.get('mLSignUpPanelOpen') || Session.get('mLLogInPanelOpen') ||
     Session.get('mLDrawerOpen') || Session.get('mLNotificationsOpen') ||
       Session.get('mLOpenPanel')) {
    return;
  } else {
    Session.set('mLOpenPanel', {name: 'LogInPanel'});
  }
});
