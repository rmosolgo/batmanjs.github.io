
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
  var selectedResult = 0;

  var tmplSearchResultGroup;

  var nonSearchKeycodes = [40, 38, 13];

  // keyboard navigation
  var resultSelector = function (e) {
    if (nonSearchKeycodes.indexOf(e.keyCode) < 0) return;

    var $selected = $('#api-search-results .selected');

    if (e.keyCode === 13) {

      window.location = $selected.children('a').eq(0).attr('href');
      $('.api-search-input').val('');
      resetSearch();

    } else {

      var $next = (e.keyCode === 40) ? $selected.next() : $selected.prev();

      if ($next.length) {
        $selected.removeClass('selected');
        $next.addClass('selected');
      }

    }

    return false;
  };

  var resetSearch = function () {
    $('#api-search-results').empty();
    $('#api-search-results').removeClass('active');
    selectedResult = 0;
  };

  var autocomplete = function (e) {
    if (nonSearchKeycodes.indexOf(e.keyCode) >= 0) return;

    query = $(this).val();
    resetSearch();
    if (!query) return;

    var sortedSections = _.chain(index)
      .filter(filterResults)
      .groupBy(function (result) { return result.section; })
      .value();

    var hasResults = false;
    var renderedTemplatePartials = {};

    _.each(sortedSections, function (resultSet, section) {
      _.each(resultSet, function(result) {
        // case-insensitive
        var indexable = result.name.toLowerCase();
        var searchTerm = query.toLowerCase();

        // 3pts - exact match
        // 2pts - starts with
        // 1pts - substr
        result.rank = (indexable === searchTerm) ? 3 : (indexable.indexOf(searchTerm) === 0) ? 2 : 1;
      });

      resultSet = _.sortBy(resultSet, function(result) { return -result.rank });

      resultSet.rank = resultSet.reduce(function(prev, cur) { return prev + cur.rank }, 0);

      var content = tmplSearchResultGroup({section: section, results: resultSet});
      renderedTemplatePartials[section] = content;
      // document.getElementById('api-search-results').innerHTML += content;

      if (!hasResults) hasResults = true;
    });

    var renderOrderData = _.map(sortedSections, function(resultSet, section) { return {rank: resultSet.rank, section: section} });
    var renderOrder = _.sortBy(renderOrderData, function(data) { return -data.rank });

    _.each(renderOrder, function(data) {
      document.getElementById('api-search-results').innerHTML += renderedTemplatePartials[data.section];
    });

    if (hasResults) {
      $('#api-search-results').addClass('active');
    }

    // $('#api-search-results').children().eq(0).addClass('selected');
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

  var initTemplates = function() {
    tmplSearchResultGroup = _.template(document.getElementById('tmplSearchResultGroup').innerHTML);
  };


  // == | PUBLIC ===============================

  var init = function (searchIndex) {
    index = searchIndex;

    initTemplates();

    $('.api-search-input').on('keyup', autocomplete);
    $('.api-search-input').on('keydown', resultSelector);
  };

  return { init: init };

})();
