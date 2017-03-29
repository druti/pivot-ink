var drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer'),
    mL = DEPNES.namespace('client.templates.layouts.masterLayout'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    util = DEPNES.namespace('client.helpers.utilities');

Template.Drawer.onRendered(function () {
  var self = this,
      viewportHeight = util.viewportH(),
      menuHeaderHeight = Number.parseInt($('.main-menu-header').css('height')),
      newHeight = viewportHeight - topBar.height - menuHeaderHeight - $('.callouts').outerHeight();

  $('.main-menu, .sub-menu').css({
    height: newHeight
  });

  Ps.initialize($('.sub-menu')[0]);
  Ps.initialize($('.sub-menu')[1]);

  drawer.$ = $('.drawer');
  drawer.$drawerSolid = $('.drawer-solid');
  drawer.$mainMenu = $('.main-menu');
  drawer.$categoriesMenu = $('#categories-menu');
  drawer.$genresMenu = $('#genres-menu');

  drawer.width = util.width(drawer.$);

  drawer.subMenuFromMain = function ($sub, callback) {
    drawer.$mainMenu.velocity({
      left: '-' + drawer.width + 'px',
    }, {
      begin: function () {
        Session.set('mLDrawerMenuAnimatingH', true);
      },
      queue: false,
      duration: mL.animationDuration,
      easing: mL.animationEasing
    });

    $sub.velocity({
      left: 0,
      opacity: 1
    }, {
      queue: false,
      duration: mL.animationDuration,
      easing: mL.animationEasing,
      complete: function () {
        Session.set('mLDrawerMenuAnimatingH', false);

        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  };



  drawer.mainMenuFromSub = function ($sub, callback) {
    Session.set('mLDrawerMenuAnimatingH', true);

    drawer.$mainMenu.velocity({
      left: 0,
    }, {
      duration: mL.animationDuration,
      easing: mL.animationEasing,
      complete: function () {
        $('.menu-item-expand').removeClass('hdn');
      }
    });

    $sub.velocity({
      left: '100%',
      opacity: 0
    }, {
      duration: mL.animationDuration,
      easing: mL.animationEasing,
      complete: function () {
        Session.set('mLDrawerMenuAnimatingH', false);

        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  };



  drawer.open = function (callback) {
    drawer.$.css('display', 'block');
    drawer.$.css('left', 0);

    mL.$logoAndContentWrappers.css('left', drawer.width);

    $('.top-bar__menu .expand-right').addClass('contract-left');
    $('.top-bar__menu').addClass('top-bar__menu--active');

    Session.set('mLDrawerOpen', true);
    Session.set('mLOpenPanel', null);

    $('.content-wrapper .logo-wrapper').hide();
    $('.top-bar-dropdowns .logo-wrapper').show();

    // execute callback if provided
    if(typeof callback === 'function') {
      callback();
    }
  };



  drawer.close = function (callback) {
    if (!Session.get('mLOpenPanel')) {
      $('.top-bar-dropdowns .logo-wrapper').hide();
    }

    drawer.$.css('left', '-' + drawer.width);
    mL.$logoAndContentWrappers.css('left', 0);

    $('.top-bar__menu .expand-right').removeClass('contract-left');
    $('.top-bar__menu').removeClass('top-bar__menu--active');

    if (Session.get('mLDrawerCategoriesOpen')) {
      drawer.mainMenuFromSub(drawer.$categoriesMenu, function () {
        Session.set('mLDrawerCategoriesOpen', false);
      });
      self.$('.categories-menu-header').addClass('hdn');
      self.$('.main-menu-header').removeClass('hdn');
    }
    if (Session.get('mLDrawerGenresOpen')) {
      drawer.mainMenuFromSub(drawer.$genresMenu, function () {
        Session.set('mLDrawerGenresOpen', false);
      });
      self.$('.genres-menu-header').addClass('hdn');
      self.$('.main-menu-header').removeClass('hdn');
    }

    Session.set('mLDrawerOpen', false);
    drawer.$.css('display', 'none');

    $('.content-wrapper .logo-wrapper').show();

    // execute callback if provided
    if(typeof callback === 'function') {
      callback();
    }
  };


  Tracker.autorun(function () {
    if(Session.get('mLDrawerOpen') &&
       Session.get('mLLogInPanelOpen') ||
       Session.get('mLSignUpPanelOpen') ||
       Session.get('mLNotificationsOpen')) {

      drawer.$drawerSolid.css({
        visibility: 'visible'
      });
    } else {

      drawer.$drawerSolid.css({
        visibility: 'hidden'
      });
    }
  });
});

Template.Drawer.events({
  'click .drawer-solid': function () {
    Session.set('mLOpenPanel', null);
  },


  'click #categories-anchor': function (e, tmpl) {
    util.preventDefault(e);

    if(!Session.get('mLDrawerMenuAnimatingH')) {
      tmpl.$('.menu-item-expand').addClass('hdn');

      $('#categories-anchor').children('.menu-item-expand').removeClass('hdn');

      tmpl.$('.main-menu-header').addClass('hdn');

      tmpl.$('.categories-menu-header').removeClass('hdn');

      drawer.subMenuFromMain(drawer.$categoriesMenu, function () {
        Session.set('mLDrawerCategoriesOpen', true);
      });
    }
  },


  'click #genres-anchor': function (e, tmpl) {
    util.preventDefault(e);

    if(!Session.get('mLDrawerMenuAnimatingH')) {
      tmpl.$('.menu-item-expand').addClass('hdn');

      $('#genres-anchor').children('.menu-item-expand').removeClass('hdn');

      tmpl.$('.main-menu-header').addClass('hdn');

      tmpl.$('.genres-menu-header').removeClass('hdn');

      drawer.subMenuFromMain(drawer.$genresMenu, function () {
        Session.set('mLDrawerGenresOpen', true);
      });
    }
  },


  'click .sub-to-main-menu, click .expand-main-menu': function (e, tmpl) {
    if(!Session.get('mLDrawerMenuAnimatingH')) {
      var target = e.target || e.srcElement,
          subIsCategories = $(target).is('.categories-menu-header') ||
                            $(target).parents().is('.categories-menu-header'),
          subIsGenres = $(target).is('.genres-menu-header') ||
                        $(target).parents().is('.genres-menu-header');

      if(subIsCategories) {
        drawer.mainMenuFromSub(drawer.$categoriesMenu, function () {
          Session.set('mLDrawerCategoriesOpen', false);
        });
        tmpl.$('.categories-menu-header').addClass('hdn');
        tmpl.$('.main-menu-header').removeClass('hdn');
      } else if(subIsGenres) {
        drawer.mainMenuFromSub(drawer.$genresMenu, function () {
          Session.set('mLDrawerGenresOpen', false);
        });
        tmpl.$('.genres-menu-header').addClass('hdn');
        tmpl.$('.main-menu-header').removeClass('hdn');
      }
    }
  },
  "click a": function (e) {
    if ($(e.target).is('.menu-item-expand') ||
        $(e.target).find('*').is('.menu-item-expand')) {
      return;
    }
    drawer.close();
  }
});
