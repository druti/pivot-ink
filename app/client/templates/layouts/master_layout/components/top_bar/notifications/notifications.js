var notificationsPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.notificationsPanel'),
    c = DEPNES.namespace('lib.collections');

Template.Notifications.helpers({
  notifications: function () {
    return c.Notifications.find({userId: Meteor.userId()});
  },
  notificationCount: function () {
    return c.Notifications.find({userId: Meteor.userId()}).count();
  }
});
