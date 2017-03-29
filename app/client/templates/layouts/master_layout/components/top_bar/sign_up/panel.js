var mL = DEPNES.namespace('client.templates.layouts.masterLayout'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    drawer = DEPNES.namespace('client.templates.layouts.masterLayout.components.drawer'),
    signUpPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.signUpPanel'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.SignUpPanel.onCreated(function () {
  Session.set('signUpErrors', {});
});

Template.SignUpPanel.onRendered(function () {
  signUpPanel.$ = $('.sign-up-panel');
  signUpPanel.contentHeight = signUpPanel.$.find('.row').outerHeight(true);
  signUpPanel.expandedHeight = Math.min(signUpPanel.contentHeight,
                                        util.viewportH() - topBar.height);
  mL.topBarSignUpHeight = topBar.height + signUpPanel.expandedHeight;

  if (!this.data.override) {
    // adjust height
    if (signUpPanel.$.css('height') !== signUpPanel.expandedHeight) {
      signUpPanel.$.css('height', signUpPanel.expandedHeight + 'px');
    }
  }

  $('.top-bar__sign-up .expand-down').addClass('contract');
  $('.top-bar__sign-up').addClass('top-bar__sign-up--active');

  mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) + signUpPanel.expandedHeight + 'px');
  drawer.$.css('top', mL.topBarSignUpHeight + 'px');

  $('.top-bar-dropdowns .logo-wrapper').show();



  signUpPanel.recalcHeight = function () {
    // recalc height
    signUpPanel.contentHeight = signUpPanel.$.find('.row').outerHeight(true);

    signUpPanel.expandedHeight = Math.min(signUpPanel.contentHeight,
                                          util.viewportH() - topBar.height);

    mL.topBarSignUpHeight = topBar.height + signUpPanel.expandedHeight;

    if (signUpPanel.$.css('height') !== signUpPanel.expandedHeight) {
      // adjust height
      signUpPanel.$.css('height', signUpPanel.expandedHeight + 'px');
    }

    mL.$contentWrapper.css('paddingTop', $('.callouts').outerHeight() + signUpPanel.expandedHeight + 'px');
    drawer.$.css('top', mL.topBarSignUpHeight + 'px');
  };
});

Template.SignUpPanel.helpers({
  errorMessage: function(field) {
    return Session.get('signUpErrors')[field];
  },

  errorClass: function (field) {
    return !!Session.get('signUpErrors')[field] ? 'has-error' : '';
  }
});


Template.SignUpPanel.events({
  'submit .accounts__form': function (e, tmpl) {
    util.preventDefault(e);

    var target = e.target || e.srcElement,
        $target = $(target),
        errors,
        newUser;

    newUser = {
      email: $target.find('[name=email]').val(),
      username: $target.find('[name=username]').val(),
      password: $target.find('[name=password]').val(),
      profile: {
        name: $target.find('[name="name"]').val()
      },
      terms: tmpl.$('input[type="checkbox"]').is("input:checked")
    };

    errors = signUpPanel.validate(newUser);
    if (errors.email || errors.username || errors.password || errors.name || errors.terms) {
      Session.set('signUpErrors', errors);
      Tracker.afterFlush(function () {
        signUpPanel.recalcHeight();
      });
      return;
    } else {
      Session.set('signUpErrors', {});
      Tracker.afterFlush(function () {
        signUpPanel.recalcHeight();
      });
    }

    Accounts.createUser(newUser, function (err) {
      if(err) {
        Session.set('signUpErrors', {error: err.reason});
        Tracker.afterFlush(function () {
          signUpPanel.recalcHeight();
        });
        return;
      }

      //clientHelpers.callout('black', 'Lorem ipsum dolor sit amet, posse deserunt molestiae his ne, no facer numquam mei. Equidem laoreet ut cum. Stet lorem quaeque ea his. Labore mediocrem vim te, vis magna virtute eu. Usu ut ullum erant pertinacia. Mei sint aeterno incorrupte in.', 10000);

      var displayName = newUser.profile.name || newUser.username;
      clientHelpers.callout('success', 'Welcome ' + displayName + '!');

      Session.set('mLOpenPanel', null);
      var redirect = Session.get('redirectAfterLogin');
      if (redirect) {
        FlowRouter.go(redirect);
      }
    });
  },
  'click .tou-a': function () {
    Session.set('mLOpenPanel', null);
  }
});

Template.SignUpPanel.onDestroyed(function () {
  if (!Session.get('mLDrawerOpen')) {
    $('.top-bar-dropdowns .logo-wrapper').hide();
  }

  Session.set('signUpErrors', {});

  signUpPanel.$.scrollTop(0);

  $('.top-bar__sign-up .expand-down').removeClass('contract');
  $('.top-bar__sign-up').removeClass('top-bar__sign-up--active');

  mL.$contentWrapper.css('paddingTop', parseInt(mL.$contentWrapper.css('paddingTop'), 10) - signUpPanel.expandedHeight + 'px');
  drawer.$.css('top', topBar.height + 'px');
});
