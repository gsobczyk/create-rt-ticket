KangoAPI.onReady(function() {
  initPopupTree();
  $('#popup-close').click(function(event) {
    KangoAPI.closeWindow();
  });
  $('#options').click(function(event) {
    var opened = kango.ui.optionsPage.open();
    KangoAPI.closeWindow();
  });
});
