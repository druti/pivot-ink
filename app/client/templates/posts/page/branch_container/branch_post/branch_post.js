var branchContainer = DEPNES.namespace('client.templates.posts.page.branchContainer.branchContainer');

Template.BranchPost.onRendered(function () {
  var $branchPost = this.$('.branch-post'),
      $branches = $branchPost.closest('.branches');
  if ($branches.is('.slick-initialized')) {

    // add this branch post to the parent slick slider
    $branches.slick('slickAdd', this.find('.branch-post'));

    // find data of branch container for this branch post
    var branchContainerStack = Session.get('postPageBranchContainerStack'),
        templateContext,
        max = branchContainerStack.length,
        i = 0;

    for (; i < max; i++) {
      if (branchContainerStack[i][0].branchContainerId === this.data.branchContainerId) {
        templateContext = branchContainerStack[i];
        break;
      }
    }

    $branches.off('afterChange.rerender');

    $branches.on('afterChange.rerender', (function (context) {
      return function (e, slick, currentSlide) {
        branchContainer.rerender.call(this, e, slick, currentSlide, context);
      };
    })(templateContext));

    Session.set(this.data.branchContainerId + '_slides', Session.get(this.data.branchContainerId + '_slides')+1);
  }
});
