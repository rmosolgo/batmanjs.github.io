$(function() {
  var response = $.getJSON('/docs/api/search.json');
  response.success( API_SEARCH.init );
});
