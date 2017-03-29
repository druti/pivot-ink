Template.CommentItem.helpers({
  submittedText: function () {
    return moment(this.submitted).fromNow();
  }
});
