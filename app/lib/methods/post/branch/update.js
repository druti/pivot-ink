var c = DEPNES.namespace('lib.collections'),
    b = DEPNES.namespace('lib.collections.branchPosts');

b.update = function (editedPost) {
  check(editedPost, {
    content: [String],
    groupId: String
  });

  b.serverValidate(editedPost);

  // find branchPosts that were edited and fetch as an array
  var branchPosts = c.BranchPosts.find({groupId: editedPost.groupId}, {sort: {timestamp: 1}}).fetch();

  // iterate the branchPosts and for each one grab its id and update that
  // post's content with the corresponding paragraph.
  branchPosts.forEach(function (bp, index) {
    var correspondingParagraph = editedPost.content[index];
    c.BranchPosts.update(bp._id, {
      $set: {content: correspondingParagraph}
    });
  });
};
