var c = DEPNES.namespace('lib.collections'),
    clientCollections = DEPNES.namespace('client.collections'),
    clientHelpers = DEPNES.namespace('client.helpers');

///////////////////////////////////////////////////////////// Master Layout Open
Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  waitOn: function() {
    return [
      Meteor.subscribe('rootPosts'),
      Meteor.subscribe('branchPosts'),
      Meteor.subscribe('intactContents'),
      Meteor.subscribe('paths'),
      Meteor.subscribe('userData'),
      Meteor.subscribe('recentNotifications')
    ];
  },
  notFoundTemplate: 'NotFound'
});
// Close Master Layout /////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////// Post List Open
Router.route('/', {
  name: 'PostsList'
//controller: 'HomeController',
//action: 'action',
//where: 'client'
});
// Close Post List /////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////// Post Page Open
Router.route('/posts/:_id', {
  name: 'PostPage',
  waitOn: function () {
    return Meteor.subscribe('comments', this.params._id);
  },
  data: function() {
    var params = this.params,
        query = params.query,
        rootPost = c.RootPosts.findOne(params._id),
        path;

    if (typeof rootPost === 'undefined') {
      return undefined;
    }

    if ((typeof query.path_id !== 'undefined') && (query.path_id !== 'undefined')) {
      path = c.Paths.findOne({_id: query.path_id, rootId: params._id});
      if (typeof path === 'undefined') {
        return undefined;
      } else {
        rootPost.path = path;
      }
    }

    return rootPost;
  }
});
// Close Post Page /////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////// Post Edit Open
Router.route('/posts/:r_id/edit/:g_id', {
  name: 'PostEdit',
  data: function () {
    var data = {},
        params = this.params,
        g_id = params.g_id;

    data.rootPost = c.RootPosts.findOne(params.r_id);
    data.branchPosts = c.BranchPosts.find({groupId: g_id}).fetch();
    data.intactContent = c.IntactContents.findOne({groupId: g_id});

    return data;
  }
});
// Close Post Edit /////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////// Root Submit Open
Router.route('/submit', {
  name: 'RootPostSubmit'
});
// Close Root Submit ///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////// Branch Submit Open
Router.route('/posts/:r_id/branch_submit/:parent_id', {
  name: 'BranchPostSubmit',
  data: function () {
    // id of parent we will branch off of
    var data = {},
        params = this.params,
        rootId = params.r_id,
        parentId = params.parent_id,
        //most likely has another branch as a parent
        parent = c.BranchPosts.findOne(parentId);

    // return the id of the rootPost so the user can be redirected back to the
    // post page.
    data.rootId = rootId;
    //if not, return the root post as the data context which is most definitely
    //the parent
    data.parent = (typeof parent === 'undefined' ?
           c.RootPosts.findOne(parentId) : parent);

    if (typeof data.parent === 'undefined') {
      data = undefined;
    }
    return data;
  }
});
  // Close Branch Submit ///////////////////////////////////////////////////////

/////////////////////////////////////////////////////// Continuation Submit Open
Router.route('/posts/:r_id/continuation_submit/:parent_id', {
  name: 'ContinuationPostSubmit',
  data: function () {
    var data = {},
        params = this.params,
        // id of parent we're continuing from
        parentId = params.parent_id,
        //most likely has another branch as a parent
        potentialParentOne = c.BranchPosts.findOne(parentId),
        //if not there is no branches there is only a root post
        potentialParentTwo = c.RootPosts.findOne(parentId);

    data.parent = potentialParentOne;
    // return the id of the rootPost so the user can be redirected back to the
    // post page.
    data.rootId = params.r_id;

    if (typeof data.parent === 'undefined') {
      if (typeof potentialParentTwo === 'undefined') {
        data = undefined;
      } else {
        data.parent = potentialParentTwo;
      }
    }
    return data;
  }
});
  // Close Continuation Submit /////////////////////////////////////////////////

//////////////////////////////////////////////////////// Replacement Submit Open
Router.route('/posts/:r_id/replacement_submit/:path_id/:start_index/:end_index', {
  name: 'ReplacementPostSubmit',
  data: function () {
    var data = {},
        params = this.params,
        pathId = params.path_id,
        startIndex = params.start_index,
        endIndex = params.end_index,
        currentPath = c.Paths.findOne(pathId);

    if (typeof currentPath === 'undefined') {
      return undefined;
    }
    if ((startIndex < 0) || (endIndex < 0)) {
      if (Meteor.isClient) {
        clientCollections.Callouts.remove({});
        clientHelpers.callout('warning', 'You must include the marked paragraph.', 10000);
      }
      return undefined;
    }

    data.replacementIdStack = currentPath.idStack.slice(startIndex, endIndex);
    data.pathId = pathId;

    return data;
  }
});
  // Close Replacement Submit //////////////////////////////////////////////////

/////////////////////////////////////////////////////////// Forgot Password Open
Router.route('/forgot_password', {
  name: 'ForgotPassword'
});
  // Close Forgot Password /////////////////////////////////////////////////////

/////////////////////////////////////////////////////////// Forgot Password Open
Router.route('/more', {
  name: 'AccountMore'
});
  // Close Forgot Password /////////////////////////////////////////////////////

////////////////////////////////////////////////////////////// Terms of Use Open
Router.route('/terms', {
  name: 'TermsOfUse'
});
  // Close Terms of Use ////////////////////////////////////////////////////////

// Hooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooks Open //
var requireLogin = function () {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('AccessDenied');
    }
  } else {
    this.next();
  }
};

var setScrollBar = function () {
  $(window).scrollTop(0);
  this.next();
};

// Close Hoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooks //

Router.onBeforeAction('dataNotFound', {only: ['PostPage', 'BranchPostSubmit', 'ContinuationPostSubmit', 'ReplacementPostSubmit']});
Router.onBeforeAction(requireLogin, {only: ['RootPostSubmit', 'BranchPostSubmit', 'ContinuationPostSubmit', 'ReplacementPostSubmit', 'AccountMore']});
Router.onBeforeAction(setScrollBar);
