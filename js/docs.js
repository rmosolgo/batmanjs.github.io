$(function() {
  var response = $.getJSON('/docs/api/search.json');
  response.success( ApiSearch.initialize );
});
