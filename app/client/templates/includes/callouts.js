var clientCollections = DEPNES.namespace('client.collections');
var clientHelpers = DEPNES.namespace('client.helpers');
var topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar');
var util = DEPNES.namespace('client.helpers.utilities');
//    mL = DEPNES.namespace('client.templates.layouts.masterLayout');

Template.Callouts.onRendered(function () {

  var initialMenuMargin = parseInt($('.main-menu').css('margin-top'), 10),
      calloutsHeight;

  // initialize calloutsOpen session var
  Session.set('calloutsOpen', 0);

  clientHelpers.calloutsResized = function () {
    // cache callouts height
    calloutsHeight = $('.callouts').outerHeight();

    $('.content-wrapper').css('paddingTop', calloutsHeight);

    if (Session.get('calloutsOpen')) {
      if (Session.get('mLDrawerOpen') || Session.get('mLDrawerAnimatingH')) {
        // increase margin-top of the menus by the height of the callouts
        $('.main-menu, .sub-menu').css('marginTop', initialMenuMargin + calloutsHeight);
        $('.main-menu-header, .sub-to-main-menu').css('top', calloutsHeight);
      }
    } else {
      // reset menus margin top
      $('.main-menu, .sub-menu').css('marginTop', initialMenuMargin);
      $('.main-menu-header, .sub-to-main-menu').css('top', 0);
    }

    // menu resizing
    var viewportHeight = util.viewportH(),
        menuHeaderHeight = Number.parseInt($('.main-menu-header').css('height')),
        newHeight = viewportHeight - topBar.height - menuHeaderHeight - $('.callouts').outerHeight();

    $('.main-menu, .sub-menu').css({
      height: newHeight
    });

  };

  Tracker.autorun(function () {
    clientHelpers.calloutsResized();
  });
});


Template.Callouts.helpers({
  callouts: function () {
    // all documents in Callouts local collection
    return clientCollections.Callouts.find();
  }
});
