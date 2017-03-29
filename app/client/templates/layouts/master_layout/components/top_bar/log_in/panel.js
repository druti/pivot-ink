var logInPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.logInPanel'),
    mL = DEPNES.namespace('client.templates.layouts.masterLayout'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.LogInPanel.onCreated(function () {
  Session.set('logInErrors', {});
});

Template.LogInPanel.helpers({
  errorMessage: function (field) {
    return Session.get('logInErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('logInErrors')[field] ? 'has-error' : '';
  }
});

Template.LogInPanel.onRendered(function () {
  logInPanel.$ = $('.log-in-panel');
  logInPanel.contentHeight = logInPanel.$.find('.row').outerHeight(true);
  logInPanel.expandedHeight = Math.min(logInPanel.contentHeight,
                                       util.viewportH() - topBar.height);
  mL.topBarLogInHeight = topBar.height + logInPanel.expandedHeight;

  if (!this.data.override) {
    // adjust height
    if (logInPanel.$.css('height') !== logInPanel.expandedHeight) {
      logInPanel.$.css('height', logInPanel.expandedHeight + 'px');
    }
  }

  $('.top-bar__log-in .expand-down').addClass('contract');
  $('.top-bar__log-in').addClass('top-bar__log-in--active');

  mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) + logInPanel.expandedHeight + 'px');
  drawer.$.css('top', mL.topBarLogInHeight + 'px');

  $('.top-bar-dropdowns .logo-wrapper').show();



  logInPanel.recalcHeight = function () {
    // recalc height
    logInPanel.contentHeight = logInPanel.$.find('.row').outerHeight(true);

    logInPanel.expandedHeight = Math.min(logInPanel.contentHeight,
                                          util.viewportH() - topBar.height);

    mL.topBarLogInHeight = topBar.height + logInPanel.expandedHeight;

    if (logInPanel.$.css('height') !== logInPanel.expandedHeight) {
      // adjust height
      logInPanel.$.css('height', logInPanel.expandedHeight + 'px');
    }

    mL.$contentWrapper.css('paddingTop', $('.callouts').outerHeight() + logInPanel.expandedHeight + 'px');
    drawer.$.css('top', mL.topBarLogInHeight + 'px');
  };
});


Template.LogInPanel.events({
  "submit form": function (e) {
    util.preventDefault(e);

    var target = e.target || e.srcElement;

    var user = $(target).find('[name="user"]').val();
    var password = $(target).find('[name="password"]').val();

    var errors = logInPanel.validate({
      user: user,
      password: password
    });
    if (errors.user || errors.password) {
      Session.set('logInErrors', errors);
      Tracker.afterFlush(function () {
        logInPanel.recalcHeight();
      });
      return;
    } else {
      Session.set('logInErrors', {});
    }

    Meteor.loginWithPassword(user, password, function (err) {
      if (err) {
        Session.set('logInErrors', {error: err.reason});
        Tracker.afterFlush(function () {
          logInPanel.recalcHeight();
        });
        return;
      }

      var user = Meteor.user().displayName;
      clientHelpers.callout('success', 'Welcome back ' + user + '!');
      Session.set('mLOpenPanel', null);
      var redirect = Session.get('redirectAfterLogin');
      if (redirect) {
        FlowRouter.go(redirect);
      }
    });
  },


  'click .forgot-p': function () {
    if(Session.get('mLDrawerOpen')) {
      Session.set('mLDrawerOpen', false);
      Session.set('mLOpenPanel', null);
    } else {
      Session.set('mLOpenPanel', null);
    }
  }
});

Template.LogInPanel.onDestroyed(function () {
  if (!Session.get('mLDrawerOpen')) {
    $('.top-bar-dropdowns .logo-wrapper').hide();
  }

  Session.set('logInErrors', {});

  logInPanel.$.scrollTop(0);

  $('.top-bar__log-in .expand-down').removeClass('contract');
  $('.top-bar__log-in').removeClass('top-bar__log-in--active');

  mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) - logInPanel.expandedHeight + 'px');
  drawer.$.css('top', topBar.height + 'px');
});
