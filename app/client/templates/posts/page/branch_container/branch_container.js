var c = DEPNES.namespace('lib.collections'),
    mL = DEPNES.namespace('client.templates.layouts.masterLayout'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar'),
    branchContainer = DEPNES.namespace('client.templates.posts.page.branchContainer.branchContainer'),
    postPage = DEPNES.namespace('client.templates.posts.page.postPage'),
    skipAnimation = true;

Template.BranchContainer.onRendered(function () {
  postPage.branchContainerStackRendered = true;

  var self = this;

  // initialize slick slider on this branchContainer
  self.$('.branches').slick({
    adaptiveHeight: true,
    dots: true,
    arrows: false,
    appendDots: self.$('.branch-container')
  });

  var currentSlide = Session.get(self.data[0].branchContainerId + '_currentSlide');
  if (currentSlide > -1) {
    self.$('.branches').slick('slickGoTo', currentSlide, skipAnimation);
  }

  // cache this branchContainers data context.
  var templateContext = self.data;

  // slider after change handler
  branchContainer.rerender = function (e, slick, currentSlide, containerData) {
    var targetBranchContainerId = containerData[0].branchContainerId,
        previousSlide = Session.get(targetBranchContainerId + '_currentSlide');

    if (currentSlide !== previousSlide) {
      var branchContainerStack = Session.get('postPageBranchContainerStack'),
          queryObject = {},
          max = branchContainerStack.length,
          i = 0;

      for (; i < max; i++) {
        var bC = branchContainerStack[i],
            bCId = bC[0].branchContainerId,
            slide = Session.get(bCId + '_currentSlide');

        if (bCId === targetBranchContainerId) {
          queryObject['idStack.'+i] = bC[currentSlide]._id;
          break;
        }
        queryObject['idStack.'+i] = bC[slide]._id;
      }

      //TODO sort paths by vote tally
      var paths = c.Paths.find(queryObject).fetch();
      FlowRouter.setQueryParams({'path_id': paths[0]._id});
    }
  };

  // unique after change event handler set for every slider (each one has its
  // appropriate data context cached inside.
  self.$('.branches').on('afterChange.rerender', (function (context) {
    return function (e, slick, currentSlide) {
      branchContainer.rerender.call(this, e, slick, currentSlide, context);
    };
  })(templateContext));

  self.$('.branches').on('afterChange.test', function () {
    Meteor.setTimeout(function () {
      DEPNES.test.start();
      DEPNES.test.next();
    }, 100);
  });

  self.$('.branches').on('beforeChange', function (e, slick, currentSlide, nextSlide) {
    if (nextSlide !== currentSlide) {
      $(this).closest('.branch-container').nextAll('.branch-container').addClass('hidden');
      $('.post-page__content .loading').show();
    }
  });
});


Template.BranchContainer.helpers({
  textNode: function () {
    return (this[0].content.indexOf('text-node') !== -1);
  },
  branchContainerId: function () {
    var self = Template.instance(),
        templateData = this,
        branchContainerId = this[0].branchContainerId;

    // this if block is only executed if the branch container has already been
    // rendered and is rerun everytime the slide count is updated for this
    // branch container.
    if (self.firstNode && self.$('.branches').is('.slick-initialized') && Session.get(branchContainerId + '_slides')) {
      var currentSlide = Session.get(self.data[0].branchContainerId + '_currentSlide'),
          $branches = self.$('.branches'),
          slickCurrentSlide = $branches.slick('slickCurrentSlide');

      // temporarily remove event handlers because the branch container id it
      // uses has been updated and we don't want to trigger the handlers with the
      // slickGoTo call below.
      $branches.off('beforeChange');
      $branches.off('afterChange.rerender');
      $branches.off('afterChange.test');

      // if a slide change needs to be made
      if (currentSlide !== slickCurrentSlide) {
        // this little jqeury each loop ensures that all the slides for this
        // branch container have been rendered, by comparing the id of all the
        // slides to the corresponding id in the underlying data.
        var branchIdsMatch = false;
        self.$('.slick-slide').not('.slick-cloned').each(function (i) {
          if (this.id === templateData[i]._id) {
            branchIdsMatch = true;
          } else {
            branchIdsMatch = false;
            return false; //stop jquery each loop
          }
        });

        // only if all the slides have been rendered
        if (branchIdsMatch) {
          $branches.slick('slickGoTo', currentSlide, skipAnimation);
        }
      }

      // reattach the event handlers passing the template's new data context with
      // the new branch container id
      self.$('.branches').on('beforeChange', function (e, slick, currentSlide, nextSlide) {
        if (nextSlide !== currentSlide) {
          $(this).closest('.branch-container').nextAll('.branch-container').addClass('hidden');
          $('.post-page__content .loading').show();
        }
      });

      $branches.on('afterChange.rerender', (function (context) {
        return function (e, slick, currentSlide) {
          branchContainer.rerender.call(this, e, slick, currentSlide, context);
        };
      })(templateData));

      self.$('.branches').on('afterChange.test', function () {
        Meteor.setTimeout(function () {
          DEPNES.test.start();
          DEPNES.test.next();
        }, 100);
      });
    }

    return branchContainerId;
  }
});


Template.BranchContainer.events({
  'click .branch-container .pouch': function (e, tmpl) {
    var $branchContainer = tmpl.$('.branch-container'),
        $branchMenuContainer = $branchContainer.find('.branch-menu-container');
    if (Number.parseInt($branchMenuContainer.css('height'), 10) < 1) {
      $branchMenuContainer.closest('.branch-container').siblings('.branch-container').find('.branch-menu-container').css('height', 0);

      // grab height of panel inside branch-menu-container which isn't visible due
      // to overflow hidden
      var branchMenuContainerExpandedHeight = $branchMenuContainer.find('.callout').outerHeight();

      $branchMenuContainer.velocity({
        height: branchMenuContainerExpandedHeight
      }, {
        begin: function () {
          var $this = $(this);

          Meteor.setTimeout(function() {
            // align top of active-branch-container paragraph with bottom of top
            // hat
            $('html, body').animate({
              scrollTop: $('.active-branch-container').offset().top - topBar.height - $('.callouts').outerHeight() - 10
            }, {
              duration: mL.animationDuration
            });
          }, 10);

          // set class of active-branch-container
          $this.parents('.branch-container').siblings().removeClass('active-branch-container');
          $this.parents('.branch-container').addClass('active-branch-container');

          var openMenuBranchContainers = $this.parents('.branch-container').siblings('.menu-open');
          if (openMenuBranchContainers.length) {
            openMenuBranchContainers.removeClass('menu-open');
            openMenuBranchContainers.find('.branches').slick('setPosition');
          }

          $this.parents('.branch-container').addClass('menu-open');

          $this.parents('.branch-container').find('.branches').slick('setPosition');
        },
        duration: mL.animationDuration,
        complete: function () {
          var $this = $(this);
          $this.css('height', 'auto');
        },
        easing: 'linear'
      });
    } else {
      $branchMenuContainer.css('height', 0);
      $branchContainer.removeClass('menu-open');
      $branchContainer.find('.branches').slick('setPosition');
    }
  }
});
