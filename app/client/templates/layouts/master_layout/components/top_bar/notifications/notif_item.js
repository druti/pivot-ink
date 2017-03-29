var c = DEPNES.namespace('lib.collections');

Template.NotificationItem.helpers({
  notifText: function () {
    var returnVal;
    switch (this.type) {
      case 'comment':
        returnVal = 'commented on';
        break;
      case 'continuation':
        returnVal = 'continued from';
        break;
      case 'branch':
        returnVal = 'branched from';
        break;
    }
    return returnVal;
  },
  notifLink: function () {
    var href;
    switch (this.type) {
      case 'comment':
        href = FlowRouter.path('PostPage', {_id: this.rootId});
        break;
      case 'continuation':
        href = FlowRouter.path('PostPage', {_id: this.rootId}, {'path_id': this.pathId});
        break;
      case 'branch':
        href = FlowRouter.path('PostPage', {_id: this.rootId}, {'path_id': this.pathId});
        break;
    }
    return href;
  }
});

Template.NotificationItem.events({
  'click .notification-link': function () {
    var data = this;

    Session.set('mLOpenPanel', null);

    if (Session.get('mLDrawerOpen')) {
      drawer.close();
    }

    c.Notifications.update(data._id, {$set: {read: true}});
  }
});
