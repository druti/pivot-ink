var c = DEPNES.namespace('lib.collections'),
    p = DEPNES.namespace('lib.helpers.posts');

c.IntactContents = new Mongo.Collection('intactContents');

p.insertIntactContent = function ({content, groupId}) {
  c.IntactContents.insert({content, groupId});
};
