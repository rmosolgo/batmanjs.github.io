
$(function() {
  var response = $.getJSON('/docs/api/search.json');
  response.success( initBindings );
});

var initBindings = function (index) {
  API_SEARCH.init( index );
};





var API_SEARCH = (function() {

  // == | PRIVATE ===============================

  var index = [];
  var query = "";

  var onKeyUp = function (e) {
    var query = $(this).val();
    $('#api-search-results').empty();

    if (!query) return;

    var results = index.filter( filterResults ).slice(0, 7);

    results.forEach(function(result) {
      var content = $('<a>').attr('href', result.link).html(result.name);
      $('<li>').html(content).appendTo('#api-search-results');
    });
  };

  var filterResults = function (item) {
    if (item !== null && typeof(item) !== 'undefined' && item.name.indexOf) {
      var indexable = item.name.toLowerCase();
      var searchTerm = query.toLowerCase();

      return indexable.indexOf(searchTerm) >= 0;
    } else {
      return false;
    }
  };


  // == | PUBLIC ===============================

  var init = function (searchIndex) {
    index = searchIndex;
    $('.api-search-input').on('keyup', onKeyUp);
  };

  return { init: init };

})();
