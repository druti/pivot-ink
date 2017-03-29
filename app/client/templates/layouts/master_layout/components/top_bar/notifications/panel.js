var notificationsPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.notificationsPanel'),
    mL = DEPNES.namespace('client.templates.layouts.masterLayout'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer'),
    util = DEPNES.namespace('client.helpers.utilities');

Template.NotificationsPanel.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('notifications', {read: false});
  });
});

Template.NotificationsPanel.onRendered(function () {
  notificationsPanel.$ = $('.notifications-panel');
  notificationsPanel.contentHeight = notificationsPanel.$.find('.row').outerHeight(true);
  notificationsPanel.expandedHeight = Math.min(notificationsPanel.contentHeight,
                                      util.viewportH() - topBar.height);
  mL.topBarNotificationsHeight = topBar.height + notificationsPanel.expandedHeight;

  if (!this.data.override) {
    // adjust height
    if (notificationsPanel.$.css('height') !== notificationsPanel.expandedHeight) {
      notificationsPanel.$.css('height', notificationsPanel.expandedHeight + 'px');
    }
  }

  $('.top-bar__notifications .expand-down').addClass('contract');
  $('.top-bar__notifications').addClass('top-bar__notifications--active');

  mL.$contentWrapper.css('paddingTop', $('.callouts').outerHeight() + notificationsPanel.expandedHeight + 'px');
  drawer.$.css('top', mL.topBarNotificationsHeight + 'px');

  $('.top-bar-dropdowns .logo-wrapper').show();




  notificationsPanel.recalcHeight = function () {
    // recalc height
    notificationsPanel.contentHeight = notificationsPanel.$.find('.row').outerHeight(true) +
                              notificationsPanel.$.find('.main.menu').outerHeight(true);
    notificationsPanel.expandedHeight = Math.min(notificationsPanel.contentHeight,
                                          util.viewportH() - topBar.height);
    mL.topBarNotificationsHeight = topBar.height + notificationsPanel.expandedHeight;

    if (notificationsPanel.$.css('height') !== notificationsPanel.expandedHeight) {
      // adjust height
      notificationsPanel.$.css('height', notificationsPanel.expandedHeight + 'px');
    }

    mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) + notificationsPanel.expandedHeight + 'px');
    drawer.$.css('top', mL.topBarNotificationsHeight + 'px');
  };
});


Template.NotificationsPanel.onDestroyed(function () {
  if (!Session.get('mLDrawerOpen')) {
    $('.top-bar-dropdowns .logo-wrapper').hide();
  }
  notificationsPanel.$.scrollTop(0);

  $('.top-bar__notifications .expand-down').removeClass('contract');
  $('.top-bar__notifications').removeClass('top-bar__notifications--active');

  mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) - notificationsPanel.expandedHeight + 'px');
  drawer.$.css('top', topBar.height + 'px');
});
