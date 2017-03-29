var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts');

p.getPathWithId = function (postId) {
  return c.Paths.findOne({idStack: postId});
};

p.getCurrentPath = function (branchContainerStack) {
  var idStack = branchContainerStack.map(function (container) {
    var slide = Session.get(container[0].branchContainerId + '_currentSlide');
    if (typeof slide !== 'undefined') {
      return container[slide]._id;
    }
  });
  return c.Paths.findOne({idStack});
};

p.removeLeadingLineBreak = function (formattedContentArray) {
  // if story starts with a line break, remove it and repeat until it
  // doesn't
  while (true) {
    if (formattedContentArray[0] === '<div class="blank"><br></div>') {
      formattedContentArray.shift();
    } else {
      break;
    }
  }
};

p.appendLineBreak = function (formattedContentArray) {
  var last = formattedContentArray.length - 1;
  // if story doesn't end with a line break, append one
  if (formattedContentArray[last] !== '<div class="blank"><br></div>') {
    formattedContentArray.push('<div class="blank"><br></div>');
  }
};

p.throwCreationError = function (err) {
  console.log(err);
  throw new Meteor.Error('Server error', 'please notify an admin.');
};

p.populateNew = function (post, type, rootId) {
  if (type !== 'root' && type !== 'branch') {
    throw new Meteor.Error('populateNew requires type argument of value ' +
                           '"root" or "branch"');
  }

  var user = Meteor.user();

  _.extend(post, {
    userId: user._id,
    author: user.displayName,
    username: user.username,
    createdAt: new Date(),
    groupId: Random.id(),
    timestamp: Date.now()
  });

  if (type === 'root') {
    post.commentCount = 0;
  }
  if (type === 'branch') {
    post.rootId = rootId;
  }
  return post;
};
