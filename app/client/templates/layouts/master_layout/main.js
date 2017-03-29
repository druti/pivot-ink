var mL = DEPNES.namespace('client.templates.layouts.masterLayout');
var topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar');
var drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer');
var logInPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.logInPanel');
var signUpPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.signUpPanel');
var notificationsPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.notificationsPanel');
var body = DEPNES.namespace('client.templates.body');
var util = DEPNES.namespace('client.helpers.utilities');
var clientHelpers = DEPNES.namespace('client.helpers');

mL.animationDuration = 250;
mL.animationEasing = 'swing';
mL.disabledPanelOpacity = 0.75;

Template.MasterLayout.onRendered(function () {
  var self = this;

  body.$ = $('body');

  mL.$contentWrapper = $('.content-wrapper');
  mL.$mainSolid = $('.main-solid');
  mL.$logoAndContentWrappers = $('.logo-wrapper, .content-wrapper');


  //////////////////////////////////////////////////////////////////////////////
  // Session restore
  if (Session.get('mLDrawerOpen')) {
    drawer.open();
  }
  // Session restore
  //////////////////////////////////////////////////////////////////////////////


  self.autorun(function () {
    if (Session.get('mLOpenPanel') || Session.get('mLDrawerOpen')) {
      // sub out for js solution
      util.disableScroll();
    } else {
      util.enableScroll();
    }
  });

  self.autorun(function () {
    var drawerOpen = Session.get('mLDrawerOpen'),
        openPanel = Session.get('mLOpenPanel');

    if (openPanel && drawerOpen) {
      drawer.$drawerSolid.css('visibility', 'visible');
      $('.top-bar__menu .expand-right').removeClass('contract-left');
      $('.top-bar__menu').removeClass('top-bar__menu--active');
    } else {
      drawer.$drawerSolid.css('visibility', 'hidden');
      if (drawerOpen) {
        $('.top-bar__menu .expand-right').addClass('contract-left');
        $('.top-bar__menu').addClass('top-bar__menu--active');
      }
    }

    if (openPanel || drawerOpen) {
      mL.$mainSolid.css('visibility', 'visible');
    } else {
      mL.$mainSolid.css('visibility', 'hidden');
    }
  });


  //////////////////////////////////////////////////////////////////////////////
  // Adjustments on resize or orientation change
  $(window).on('resize orientationChanged', function () {
    var openPanel = Session.get('mLOpenPanel'),
        viewportHeight = util.viewportH(),
        menuHeaderHeight = Number.parseInt($('.main-menu-header').css('height')),
        newHeight = viewportHeight - topBar.height - menuHeaderHeight - $('.callouts').outerHeight();

    $('.main-menu, .sub-menu').css({
      height: newHeight
    });

    if (openPanel === 'LogInPanel') {
      logInPanel.recalcHeight();
    }

    if(openPanel === 'SignUpPanel') {
      signUpPanel.recalcHeight();
    }

    if (openPanel === 'NotificationsPanel') {
      notificationsPanel.recalcHeight();
    }

    if (Session.get('calloutsOpen')) {
      clientHelpers.calloutsResized();
    }
  });
  // Adjustments on resize or orientation change
  //////////////////////////////////////////////////////////////////////////////


  clientHelpers.callout('warning', `Welcome to PivotInk! Checkout the example
  story below. Drag or click a paragraph to see its options.`,
    10000000);
});


Template.MasterLayout.helpers({
  openTopBarPanel: function () {
    var openPanel = Session.get('mLOpenPanel') || {};

    if (!openPanel.name) {
      openPanel.name = '';
    }
    if (!openPanel.data) {
      openPanel.data = {};
    }

    return openPanel;
  }
});


////////////////////////////////////////////////////////////////////////////////
// Events
Template.MasterLayout.events({
  'click .main-solid': function (e) {
    util.stopPropagation(e);
    util.preventDefault(e);

    var openPanel = Session.get('mLOpenPanel'),
        drawerOpen = Session.get('mLDrawerOpen');

    if (drawerOpen) {
      drawer.close();
    }
    if (openPanel) {
      Session.set('mLOpenPanel', null);
    }
  }
});
// Events
////////////////////////////////////////////////////////////////////////////////
