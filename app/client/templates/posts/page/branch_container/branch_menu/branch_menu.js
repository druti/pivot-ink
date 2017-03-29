var c = DEPNES.namespace('lib.collections'), //jshint ignore: line
    util = DEPNES.namespace('client.helpers.utilities'),
    clientHelpers = DEPNES.namespace('client.helpers'),
    topBar = DEPNES.namespace('client.templates.layouts.masterLayout.components.topBar');


Template.BranchMenu.helpers({
  rootId: function () {
    var rootId = this[0].rootId;
    return rootId;
  },
  pathId: function () {
    return Session.get('postPageCurrentPath')._id;
  },
  pathCount: function () {
    return c.Paths.find({rootId: this[0].rootId}).count() > 1 ? false : true;
  },
  noDependents: function () {
    /*
    var currentSlide = Session.get(this[0].branchContainerId + '_currentSlide'),
        groupId = this[currentSlide].groupId,
        branchPosts = c.BranchPosts.find({groupId: groupId}).fetch(),
        max = branchPosts.length,
        i = 0;

    for (; i < max; i += 1) {
      var currentBranchPostId = branchPosts[i]._id,
          dependents = !!c.BranchPosts.find({parentIds: currentBranchPostId, groupId: {$not: groupId}}).fetch().length;
      if (dependents) {
        return false;
      }
    }
    return true;
    */
    return true;
  },
  parentId: function () {
    var branchContainerStack = Session.get('postPageBranchContainerStack'),
        data = this,
        iO;
    if (typeof branchContainerStack === 'undefined') {
      return console.log('branchContainerStack undefined');
    }

    branchContainerStack.forEach(function (branchContainer, index) {
      if (branchContainer[0].branchContainerId === data[0].branchContainerId) {
        iO = index;
      }
    });
    if (typeof iO === 'undefined') {
      return data[0].rootId;
    }

    var previousBranchContainer = branchContainerStack[iO-1],
        slide = Session.get(previousBranchContainer[0].branchContainerId + '_currentSlide');

    if (typeof slide === 'undefined') {
      return console.log('slide undefined');
    }
    var parentId = previousBranchContainer[slide]._id;
    return parentId;
  },
  groupId: function () {
    var currentSlide = Session.get(this[0].branchContainerId + '_currentSlide');
    return this[currentSlide].groupId;
  },
  branchAuthor: function () {
    var currentSlide = Session.get(this[0].branchContainerId + '_currentSlide');
    return this[currentSlide].author;
  },
  branchCreatedOn: function () {
    var currentSlide = Session.get(this[0].branchContainerId + '_currentSlide');
    var isoDate = this[currentSlide].createdAt;
    var momentDate = moment(isoDate).fromNow();
    return momentDate;
  },
  currentBranch: function () {
    return Session.get(this[0].branchContainerId + '_currentSlide') + 1;
  },
  branchCountMessage: function () {
    var count = this.length - 1;
    if (count <= 0) {
      return 'with no alternatives';
    } else if (count === 1) {
      return `with 1 alternative`;
    } else {
      return `with ${count} alternatives`;
    }
  },
  ownsPost: function () {
    var currentBranchIndex = Session.get(this[0].branchContainerId +
                                     '_currentSlide');
    if (typeof currentBranchIndex === 'undefined') {
      return console.log('currentBranchIndex undefined');
    }
    return this[currentBranchIndex].userId === Meteor.userId();
  }
});

Template.BranchMenu.events({
  'click .c-rpm': function (e, tmpl) {
    util.preventDefault(e);

    clientHelpers.callout("info", "Choose the paragraphs you want to replace.", 1000000);

    // close branch menu
    tmpl.$('.branch-menu-container').css('height', 0);
    tmpl.$('.branch-menu-container').closest('.branch-container').removeClass('menu-open');
    tmpl.$('.branch-menu-container').siblings('.branches').slick('setPosition');

    // replacement selection interface: open //////////////////////////////////////////////
    var $branchContainers = $('.branch-container');
    $branchContainers.append('<div class="cover"></div>');
    tmpl.$('.branch-menu-container')
        .parents('.branch-container')
        .find('.cover')
        .addClass('cover--selected-initial')
        .removeClass('cover');

    $('.cover').on('click', function () {
      var $this = $(this),
          $parentBranchContainer = $this.parents('.branch-container');
      if ($parentBranchContainer.find('.pouch').is('.pouch')) {
        if ($this.hasClass('cover--selected')) {
          $this.removeClass('cover--selected');

          if ($parentBranchContainer.isAfter('.active-branch-container')) {
            $parentBranchContainer.nextAll()
                                  .find('.cover')
                                  .removeClass('cover--selected');
            while (true) {
              if ($parentBranchContainer.prev().find('.blank').is('.blank')) {
                $parentBranchContainer = $parentBranchContainer.prev();
                $parentBranchContainer.find('.cover').removeClass('cover--selected');
              } else {
                break;
              }
            }
          } else {
            $parentBranchContainer.prevAll()
                                  .find('.cover')
                                  .removeClass('cover--selected');
            while (true) {
              if ($parentBranchContainer.next().find('.blank').is('.blank')) {
                $parentBranchContainer = $parentBranchContainer.next();
                $parentBranchContainer.find('.cover').removeClass('cover--selected');
              } else {
                break;
              }
            }
          }
        } else {
          $this.addClass('cover--selected');

          if ($parentBranchContainer.isAfter('.active-branch-container')) {
            $parentBranchContainer.prevUntil('.active-branch-container')
                                  .find('.cover')
                                  .addClass('cover--selected');
          } else {
            $parentBranchContainer.nextUntil('.active-branch-container')
                                  .find('.cover')
                                  .addClass('cover--selected');
          }
        }
      }
    });
    // replacement selection interface: close //////////////////////////////////////////////

    window.scrollTo(0, $('.active-branch-container').offset().top - topBar.height - 10);

    Blaze.renderWithData(Template.ReplacementSelectPopUp, this, $('body')[0]);
  },
  'click .next': function (e) {
    var $target = $(e.target);

    // if branchContainer length is one throw callout
    if (this.length === 1) {
      return clientHelpers.callout('info',
                             'There are no alternatives to this paragraph. ' +
                             'Be the first to write one!');
    }
    // next slide for this branchContainer
    $target.parents('.branch-container').find('.branches').slick('slickNext');
  },
  'click .prev': function (e) {
    var $target = $(e.target);

    // if branchContainer length is one throw callout
    if (this.length === 1) {
      return clientHelpers.callout('info', 'There are no alternatives to this paragraph.' +
                             ' Be the first to write one!');
    }
    // prev slide for this branchContainer
    $target.parents('.branch-container').find('.branches').slick('slickPrev');
  }
});
