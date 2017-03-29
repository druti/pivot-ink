var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts'),
    b = DEPNES.namespace('lib.collections.branchPosts'),
    r = DEPNES.namespace('lib.collections.rootPosts');

Meteor.methods({
  '/post/root/insert': function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      content: Array
    });

    // TODO: also validate that the content is formatted correctly
    r.serverValidate(postAttributes);

    // add required properties to post
    p.populateNew(postAttributes, 'root');

    // remove any leading line break
    p.removeLeadingLineBreak(postAttributes.content);
    // if content doesn't end in a line break append one
    p.appendLineBreak(postAttributes.content);

    // store content as a whole before inserting it as individual posts
    p.insertIntactContent(postAttributes);

    var branchContent = postAttributes.content.splice(1);
    // insert root post with only the first paragraph as the content
    postAttributes.content = postAttributes.content[0];
    var rootId = c.RootPosts.insert(postAttributes);

    // set content as all other paragraphs after the first one
    postAttributes.content = branchContent;

    try {
      b.insert(postAttributes, {
        parentId: rootId,
        from: 'root',
        rootId: rootId
      });
    } catch (err) {
      // TODO remove rootPost that was created.
      p.throwCreationError(err);
    }

    return {
      _id: rootId
    };
  }
});
