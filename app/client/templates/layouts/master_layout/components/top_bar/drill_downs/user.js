var c = DEPNES.namespace('lib.collections');

Template.TopBarUserMenu.onRendered(function () {
  if (!Session.get('mLDrawerOpen')) {
    $('.top-bar .roller').scrollLeft($('.top-bar__user')[0].offsetLeft);
  }

  $('.top-bar__user').addClass('top-bar__user--active');

  $('.top-bar-dropdowns .logo-wrapper').show();

  var $topBarOpener = $('.top-bar .top-bar__user.top-bar__opener');
  if ($topBarOpener[0]) {
    $topBarOpener.addClass('top-bar__opener--active');
  }

  if ($('.top-bar__user .expand-right')[0]) {
    $('.top-bar__user .expand-right').addClass('contract-left');
  } else if ($('.top-bar__user .expand-down')[0]) {
    $('.top-bar__user .expand-down').addClass('contract');
  }
});

Template.TopBarUserMenu.onDestroyed(function () {
  $('.top-bar a').css('width', 'initial');
  $('.top-bar .roller').scrollLeft(0);


  $('.top-bar__user').removeClass('top-bar__user--active');

  $('.top-bar-dropdowns .logo-wrapper').hide();

  var $topBarOpener = $('.top-bar__user.top-bar__opener');
  if ($topBarOpener[0]) {
    $topBarOpener.removeClass('top-bar__opener--active');
  }

  if ($('.top-bar__user .expand-right')[0]) {
    $('.top-bar__user .expand-right').removeClass('contract-left');
  } else if ($('.top-bar__user .expand-down')[0]) {
    $('.top-bar__user .expand-down').removeClass('contract');
  }

  var openPanel = Session.get('mLOpenPanel');
  if (openPanel) {
    Session.set('mLOpenPanel', null);
  }
});

Template.TopBarUserMenu.helpers({
  notificationCount: function () {
    return c.Notifications.find({userId: Meteor.userId()}).count();
  }
});
