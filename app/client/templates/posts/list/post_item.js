Template.PostItem.helpers({
  contentPreview: function () {
    return this.content.slice(0, 160) + '...';
  }
});
