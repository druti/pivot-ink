var c = DEPNES.namespace('lib.collections');

c.Paths = new Mongo.Collection('paths');

c.Paths.allow({
  'update': function () {
    return true;
  }
});
