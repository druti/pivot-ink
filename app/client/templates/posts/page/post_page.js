var c = DEPNES.namespace('lib.collections'),
    postPage = DEPNES.namespace('client.templates.posts.page.postPage'),
    logInPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.logInPanel'),
    util = DEPNES.namespace('lib.helpers.utilities');
    utilClient = DEPNES.namespace('client.helpers.utilities');
    p = DEPNES.namespace('lib.helpers.posts');

Template.PostPage.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('rootPosts');
    self.subscribe('paths');
    self.subscribe('branchPosts');
    self.subscribe('comments', FlowRouter.getParam('_id'));
  });
});


postPage.setCurrentPath = function (currentPath) {
  Session.set('postPageCurrentPath', currentPath);
};

postPage.getCurrentPath = function (fallback) {
  var currentPath = Session.get('postPageCurrentPath'),
      groupId = fallback.groupId,
      parentId = fallback.parentId,
      idStack = [];


  if (typeof currentPath !== 'undefined') {
    return currentPath;
  }

  if ((!groupId) && (!parentId)) {
    return console.log('no fallback groupId or parentId provided.');
  }

  // TODO tell user the current path will be assumed
  if (groupId) {
    c.BranchPosts.find({groupId}, {sort: {timestamp: 1}}).forEach(function (b) {
      idStack.push(b._id);
    });
  } else {
    while (parentId) {
      var bp = c.BranchPosts.findOne(parentId);
      idStack.push(parentId);
      parentId = bp._id;
    }
  }

  return c.Paths.findOne({idStack: {$all: idStack}});
};

postPage.getTopPath = function (rootId) {
  var paths = c.Paths.find({rootId: rootId}, {sort: {voteTally: -1, createdAt: 1, _id: -1}}).fetch();
  return paths[0];
};

postPage.generateBranchContainerStack = function (initialParentId, path) {
  var parentId = initialParentId,
      branchContainerStack = [],
      max = path.idStack.length,
      i = 0;

  for (; i < max; i += 1) {
    // find all branchPosts with parentId and fetch as an
    // array.
    var branchContainer = c.BranchPosts.find({parentIds: parentId}).fetch();

    // if no branch posts are found exit loop, unlikely to happen because this
    // for loop is running based on the path.
    if (branchContainer.length === 0) break;

    // set the same branchContainerId for all branchPosts in container
    var branchContainerId = util.guidGenerator(),
        branchContainerLength = branchContainer.length,
        topBranchId,
        j = 0;
    for (; j < branchContainerLength; j++) {
      branchContainer[j].branchContainerId = branchContainerId;
    }

    if (branchContainer.length > 1) {
      var pathFragmentId = path.idStack[i],
          maximum = branchContainer.length,
          k = 0;

      Session.set(branchContainerId + '_slides', branchContainer.length);

      for (; k < maximum; k += 1) {
        if (branchContainer[k]._id === pathFragmentId) {
          Session.set(branchContainerId + '_currentSlide', k);
          // grab id of first branch post in array. (TODO sort array by vote count)
          topBranchId = branchContainer[k]._id;
          break;
        } else {
          // TODO resort to default, first branch in container or top path
          // from this point
          if (k === maximum-1) {
            console.error('couldn\'t find path fragment id in branch container');
          }
        }
      }
    } else {
      Session.set(branchContainerId + '_currentSlide', 0);
      Session.set(branchContainerId + '_slides', 1);
      topBranchId = branchContainer[0]._id;
    }

    // add branchContainer to branchContainerStack array.
    branchContainerStack.push(branchContainer);

    // loop around, set the top voted branchPosts id as parentId
    parentId = topBranchId;
  }

  return branchContainerStack;
};


Template.PostPage.onRendered(function () {
  var self = this;

  self.autorun(function () {
    if (self.subscriptionsReady()) {
      Tracker.afterFlush(function () {
        self.$('.roller').each(function () {
          Ps.initialize(this);
        });
      });
    }
  });

  self.autorun(function () {
    if (self.subscriptionsReady()) {
      Tracker.afterFlush(function () {
        DEPNES.test.start();
        DEPNES.test.next();
      });
    }
  });

  // run test on pop state
  window.onpopstate = function () {
    DEPNES.test.start();
    DEPNES.test.next();
  };
});


Template.PostPage.events({
  'click .comments-section .log-in': function (e) {
    utilClient.preventDefault(e);
    Session.set('mLOpenPanel', {name: 'LogInPanel'});
  }
});


Template.PostPage.helpers({
  rootPost: function () {
    var postId = FlowRouter.getParam('_id'),
        rootPost = c.RootPosts.findOne(postId) || {};
    return rootPost;
  },
  pathId: function () {
    var currentPath = Session.get('postPageCurrentPath');
    if (currentPath) {
      return currentPath._id;
    }
    return null;
  },
  ownsPost: function () {
    return this.userId === Meteor.userId();
  },

  otherContributors: function () {
    return !!c.BranchPosts.find({rootId: this._id, userId: { $not: this.userId}}).fetch().length;
  },

  noDependents: function () {
    var groupId = this.groupId,
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
  },

  branchContainerStack: function () {
    // first paragraph (root post) id
    var rootId = FlowRouter.getParam('_id'),
        pathId = FlowRouter.getQueryParam('path_id'),
        path = c.Paths.findOne(pathId) || postPage.getTopPath(rootId);

    Session.set('postPageCurrentPath', path);

    var branchContainerStack = postPage.generateBranchContainerStack(rootId, path);

    // store branchContainer stack in session variable
    Session.set('postPageBranchContainerStack', branchContainerStack);

    if ($('.branch-container.hidden').length) {
      $('.branch-container.hidden').removeClass('hidden');
      $('.post-page__content .loading').hide();
    }

    return branchContainerStack;
  },

  authors: function () {
    var containerStack = Session.get('postPageBranchContainerStack');

    var authors = [this.author];

    if (containerStack) {
      containerStack.forEach(function (c) {
        for (var i = 0; i < c.length; i++) {
          var author = c[i].author;
          if (authors.indexOf(author) === -1) {
            authors.push(author);
          }
        }
      });
    }

    return authors;
  },


  continuationParentId: function () {
    var containerStack = Session.get('postPageBranchContainerStack'),
        length = containerStack.length;

    if (length === 0) {
      return this._id;
    } else {
      var lastContainer = containerStack[length - 1],
          // grab last container, grab first paragraph, grab parentId, grab
          // current slide, if it isn't defined yet, assume the slider is still on
          // the first slide.
          currentSlide = Session.get(lastContainer[0].branchContainerId +
                                    '_currentSlide') || 0;
      return lastContainer[currentSlide]._id;
    }
  },


  comments: function () {
    return c.Comments.find({rootId: this._id});
  }
});


Template.PostPage.onDestroyed(function () {
  Session.set('postPageBranchContainerStack', undefined);
  Session.set('postPageCurrentPath', undefined);
  postPage.branchContainerStackRendered = false;

  window.onpopstate = null;
});


var test = DEPNES.namespace('test');

test.intervalIds = [];
test.start = function (options) {
  var rootId = FlowRouter.getParam('_id'),
      initialPathId = FlowRouter.getQueryParam('path_id') || postPage.getTopPath(rootId)._id,
      paths = c.Paths.find({rootId: rootId}).fetch(),
      pathIds = [],
      whichPath = 0,
      options = options || {}, //jshint ignore:line
      auto = options.auto || false,
      interval = options.interval || 2500;

  paths.forEach(function (path) {
    pathIds.push(path._id);
  });

  whichPath = pathIds.indexOf(initialPathId);

  test.next = function () {
    if (whichPath === pathIds.length) whichPath = 0;
    if (pathIds[whichPath] === initialPathId) {
      FlowRouter.withReplaceState(function () {
        FlowRouter.go('PostPage', {_id: rootId}, {'path_id': pathIds[whichPath]});
      });
    } else {
      FlowRouter.go('PostPage', {_id: rootId}, {'path_id': pathIds[whichPath]});
    }

    var path = c.Paths.findOne(pathIds[whichPath]),
        branchContainerStack = Session.get('postPageBranchContainerStack'),
        $branchContainers = $('.branch-container'),
        postPageIdStack = [],
        postPageIdStackMatches = true;

    // Test #1
    var lengthCheckOne = path.idStack.length === $branchContainers.length;
    if (lengthCheckOne) {
      //console.log('Length check #1: ', lengthCheckOne);
    } else {
      console.error('Length check #1: ', lengthCheckOne);
    }

    // Test #2
    var lengthCheckTwo = branchContainerStack.length === $branchContainers.length;
    if (lengthCheckTwo) {
      //console.log('Length check #2: ', lengthCheckTwo);
    } else {
      console.error('Length check #2: ', lengthCheckTwo);
    }

    // Test #3
    var lengthCheckThree = branchContainerStack.length === path.idStack.length;
    if (lengthCheckThree) {
      //console.log('Length check #3: ', lengthCheckThree);
    } else {
      console.error('Length check #3: ', lengthCheckThree);
    }

    // Test #4
    $branchContainers.find('.branch-post.slick-active').each(function (i) {
      postPageIdStack.push(this.id);
      if (this.id !== path.idStack[i]) {
        postPageIdStackMatches = false;
      }
    });

    if (postPageIdStackMatches) {
      //console.log('postPageIdStackMatches: ', true);
    } else {
      console.error('postPageIdStackMatches: ', false);
    }

    // Test #5
    var hiddenBranchContainers = $('.branch-container.hidden').length;
    if (!lengthCheckOne || !lengthCheckTwo || !lengthCheckThree || !postPageIdStackMatches || hiddenBranchContainers) {
      location.reload();
      test.stop();
    }

    whichPath++;
  };

  test.automate = function (interval) {
    var interval = interval || 2500, //jshint ignore:line
        timeout = interval;

    test.intervalIds.forEach(function (id) {
      Meteor.clearInterval(id);
    });
    test.intervalIds = [];

    Meteor.setTimeout(function () {
    }, timeout);

    test.intervalIds.push(Meteor.setInterval(function () {
      test.next();
    }, interval));
  };

  test.stop = function () {
    test.intervalIds.forEach(function (id) {
      Meteor.clearInterval(id);
    });
    test.intervalIds = [];
    test.next = undefined;
    test.stop = undefined;
    test.automate = undefined;
  };


  if (auto) {
    test.automate(interval);
  }

  if (rootId, initialPathId, paths, pathIds) {
  } else {
    test.stop();
    console.error('Test initiation failed');
  }
};
