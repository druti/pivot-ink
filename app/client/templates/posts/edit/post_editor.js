var editor = DEPNES.namespace('client.templates.posts.edit.postEditor'),
    c = DEPNES.namespace('lib.collections');

Template.PostEditor.onRendered(function () {
  editor.quill = new Quill('#post-editor', {
    modules: {
      'toolbar': { container: '#post-editor-toolbar' }
    },
    formats: ['bold', 'italic', 'underline', 'strike', 'align'],
    theme: 'snow'
  });
  editor.quill.undoManager = editor.quill.getModule('undo-manager');

  var groupId = this.data.groupId;

  if (groupId) {
    var intactContents = c.IntactContents.findOne({groupId: groupId}),
        intactContent = '';

    if (typeof intactContents !== 'undefined') {
      intactContents.content.forEach(function (el) {
        intactContent += el;
      });

      var $intactContent = $(intactContent),
          tmp = document.createElement('div'),
          html;

      $intactContent.each(function () {
        if (this.nodeType !== 3) {
          $(this).removeAttr('class');
          tmp.appendChild(this);
        }
      });

      html = tmp.innerHTML;
      editor.quill.setHTML(html);
    }
  }
});

Template.PostEditor.events({
  'click .ql-undo': function () {
    editor.quill.undoManager.undo();
  },
  'click .ql-redo': function () {
    editor.quill.undoManager.redo();
  }
});
