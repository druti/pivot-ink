var clientCollections = DEPNES.namespace('client.collections');

Template.Callout.onRendered(function () {
  // data context
  var callout = this.data;

  // increment calloutsOpen session variable by one
  Session.set('calloutsOpen', Session.get('calloutsOpen') + 1);

  // remove callout from Callouts local collection after its duration is done
  if (callout.duration) {
    Meteor.setTimeout(function () {
      clientCollections.Callouts.remove(callout._id);
    }, callout.duration);
  } else {
    Meteor.setTimeout(function () {
      clientCollections.Callouts.remove(callout._id);
    }, 3000);
  }
});

Template.Callout.events({
  'click .close-button': function () {
    // remove callout from local collection
    clientCollections.Callouts.remove(this._id);
  }
});

Template.Callout.onDestroyed(function () {
  // when callout template is destroyed subtract 1 from calloutsOpen session
  // variable
  Session.set('calloutsOpen', Session.get('calloutsOpen') - 1);
});
