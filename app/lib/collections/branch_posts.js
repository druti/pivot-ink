var c = DEPNES.namespace('lib.collections'),
    b = DEPNES.namespace('lib.collections.branchPosts'),
    util = DEPNES.namespace('lib.helpers.utilities');

// Initiate branchPosts collection
c.BranchPosts = new Mongo.Collection('branchPosts');
// c.BranchPosts allow/deny
c.BranchPosts.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

// BranchPost creation validation
b.validate = function (post) {
  var errors = {};
  if (!post.content) {
    errors.content = 'Please provide some content.';
  }
  return errors;
};

b.checkErrors = function (errors) {
  if (errors.title || errors.content) {
    throw new Meteor.Error('invalid-branch-post', 'You must provide content');
  }
};

b.serverValidate = function (branchPost, from) {
  var from = from || 'branch'; //jshint ignore:line

  var branchPostCopy = {};
  if (from === 'root') {
    branchPostCopy.title = branchPost.title;
    branchPostCopy.content = branchPost.content[0];
  } else if (from === 'branch' || from === 'continuation') {
    branchPostCopy.content = util.stripHTMLArray(branchPost.content);
  }

  var errors = b.validate(branchPostCopy);
  b.checkErrors(errors);
};

b.insertPosts = function (postAttributes, parentId) {
  var pathIdStack = [],
      newParentId,
      formattedContentArray = postAttributes.content;
  // loop through paragraphs inserting a BranchPost with a parentId of the
  // previous for each one.  Simultaneously create the new path's idStack.
  formattedContentArray.forEach(function (content) {
    postAttributes.timestamp++;
    postAttributes.parentIds = [parentId];
    postAttributes.content = content;
    newParentId = c.BranchPosts.insert(postAttributes);
    parentId = newParentId;
    pathIdStack.push(parentId);
  });
  return pathIdStack;
};

b.insertPath = function (idArray, rootId, date) {
  return c.Paths.insert({
    voteTally: 0,
    idStack: idArray,
    rootId: rootId,
    createdAt: date
  });
};

b.firstAndLastId = function (branchPosts) {
  check(branchPosts, [Object]);
  // determine first and last branchPost in lineage by looping through the
  // branchPosts comparing each one's parentId and _id fields with the inverse
  // of every other branchPost in the group. Use the first one's parentId as
  // the starting point for updating the branchPosts in the loop that
  // follows this one. Use the last one's _id to find the currentPath.
  var firstId,
      firstParentId,
      lastId,
      lastParentId;
  branchPosts.forEach(function (branchPost) {
    var currentParentId = branchPost.parentIds[0],
        currentId = branchPost._id,
        max = branchPosts.length,
        i = 0,
        first = true,
        last = true;
    for (; i < max; i++) {
      // the _id another branchPost in the group
      var anotherBranchPost = branchPosts[i],
          anotherId = anotherBranchPost._id,
          anotherParentId = anotherBranchPost.parentIds[0];
      // if we're comparing to the same post
      if (currentId === anotherId) {
        // skip current iteration
        continue;
      }
      if (currentParentId === anotherId) {
        // it has a parent in the group (it's not the first branchPost)
        first = false;
      }
      if (currentId === anotherParentId) {
        last = false;
      }
    }

    if (first) {
      firstId = currentId;
      firstParentId = currentParentId;
    }
    if (last) {
      lastId = currentId;
      lastParentId = currentParentId;
    }
    if (first && last) {
      throw new Meteor.Error('alert', 'Server error: please notify an admin.');
    }
  });

  return {
    first: {
      _id: firstId,
      parentId: firstParentId
    },
    last: {
      _id: lastId,
      parentId: lastParentId
    }
  };
};
