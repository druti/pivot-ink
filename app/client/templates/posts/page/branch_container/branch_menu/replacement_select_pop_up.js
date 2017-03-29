var postPage = DEPNES.namespace('client.templates.posts.page.postPage'),
    util = DEPNES.namespace('client.helpers.utilities'),
    clientCollections = DEPNES.namespace('client.collections'),
    clientHelpers = DEPNES.namespace('client.helpers');

Template.ReplacementSelectPopUp.events({
  'click .rs-cancel': function (e) {
    util.preventDefault(e);

    $('.cover, .cover--selected-initial').remove();
    $('.rspu').remove();
    clientCollections.Callouts.remove({});
  },

  'click .rs-done': function (e) {
    util.preventDefault(e);

    var $allCovers = $('.cover, .cover--selected-initial'),
        $selectedCovers = $('.cover--selected, .cover--selected-initial'),
        iOFirstSelectedCover = $allCovers.index($selectedCovers.first()),
        iOLastSelectedCover = $allCovers.index($selectedCovers.last()),
        startIndex = iOFirstSelectedCover,
        endIndex = iOLastSelectedCover + 1;

    if ((startIndex < 0) || (endIndex < 0)) {
      return clientHelpers.callout('alert', 'You need to include the marked paragraph in your selection.', 10000);
    }

    $('.cover, .cover--selected-initial').remove();
    $('.rspu').remove();
    clientCollections.Callouts.remove({});

    FlowRouter.go('ReplacementPostSubmit', {
      r_id: this[0].rootId,
      path_id: postPage.getCurrentPath({groupId: this[0].groupId})._id,
      start_index: startIndex,
      end_index: endIndex
    });
  }
});

Template.ReplacementSelectPopUp.helpers({
  rootId: function () {
    return this[0].rootId;
  },
  pathId: function () {
    return postPage.getCurrentPath({groupId: this[0].groupId})._id;
  }
});
