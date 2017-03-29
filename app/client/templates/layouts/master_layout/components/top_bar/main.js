var topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer'),
    clientHelpers = DEPNES.namespace('client.helpers'),
    util = DEPNES.namespace('client.helpers.utilities'),
    c = DEPNES.namespace('lib.collections');

Template.TopBar.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('userData');
    if (Meteor.user()) {
      self.subscribe('notifications', {read: false});
    }
  });
});

Template.TopBar.onRendered(function () {
  var self = this;

  topBar.$ = self.$('.top-bar');
  topBar.height = topBar.$.outerHeight();

  // Scroll bar
  if ('ontouchstart' in document) { // touch support check
    // TODO hide scroll bar in top bar based on its height or Flickity
    Ps.initialize($('.top-bar .roller')[0]);
  } else {
    Ps.initialize($('.top-bar .roller')[0]);
  }
  // end Scroll bar
});

Template.TopBar.helpers({
  userOpen: function () {
    return Session.get('mLTopBarUserOpen');
  },
  notificationCount: function () {
    return c.Notifications.find({userId: Meteor.userId()}).count();
  }
});



Template.TopBar.events({
  'click .top-bar__menu': function (e) {
    util.preventDefault(e);

    if(!Session.get('mLDrawerOpen')) {
      // TODO implement in drawer open
      $('.top-bar .roller').scrollLeft(0);
      //
      drawer.open();
    } else if (Session.get('mLOpenPanel')) {
      Session.set('mLOpenPanel', null);
    } else {
      drawer.close();
    }
  },

  'click .top-bar__action[data-panel-tmpl]': function (e) {
    util.preventDefault(e);

    var openPanel = Session.get('mLOpenPanel') || {},
        targetPanel = $(e.target).closest('[data-panel-tmpl]').attr('data-panel-tmpl');

    if(openPanel.name !== targetPanel) {
      Session.set('mLOpenPanel', {name: targetPanel});
    } else {
      Session.set('mLOpenPanel', null);
    }
  },

  'click .top-bar__user': function (e) {
    util.preventDefault(e);

    var userOpen = Session.get('mLTopBarUserOpen');
    if (userOpen) {
      Session.set('mLTopBarUserOpen', false);
    } else {
      Session.set('mLTopBarUserOpen', true);
    }
  },

  'click .top-bar__log-out': function (e) {
    util.preventDefault(e);

    Session.set('mLOpenPanel', null);
    Session.set('mLTopBarUserOpen', false);

    var displayName = Meteor.user().displayName;

    Meteor.logout(function (e) {
      if (e) {
        clientHelpers.callout('alert', e.reason);
      }
      clientHelpers.callout('success', 'Goodbye ' + displayName + '!');
    });
  }
});
