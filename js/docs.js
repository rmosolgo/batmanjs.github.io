
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
  var renderedTemplatePartials = {};

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
    renderedTemplatePartials = {};
  };

  var autocomplete = function (e) {
    // don't capture if we're using arrows or enter key
    if (nonSearchKeycodes.indexOf(e.keyCode) >= 0) return;

    resetSearch();

    if ( !(query = $(this).val()) ) return;

    // filter relevant results
    results = _.chain(index)
      .filter( filterResults )
      .groupBy(function (result) { return result.section })
      // calculate rank value per section and result
      .map( rank )
      // render partials in correct order based on rank
      .map(function (resultSet) { return {rank: resultSet.rank, section: resultSet[0].section} })
      .sortBy(function (data) { return -data.rank })
      .value();

    // insert into DOM
    _.each(results, function (data) {
      document.getElementById('api-search-results').innerHTML += renderedTemplatePartials[data.section];
    })

    // use correct styling
    if (results.length) {
      $('#api-search-results').addClass('active');
    }

    // $('#api-search-results').children().eq(0).addClass('selected');
  };

  var rank = function (resultSet, sectionName) {
    // individual ranking
    var rankedResultSet = _.chain(resultSet)
      .map(function (result) {
        // case-insensitive
        var indexable = result.name.toLowerCase();
        var searchTerm = query.toLowerCase();

        // 3pts - exact match
        // 2pts - starts with
        // 1pts - substr
        result.rank = (indexable === searchTerm) ? 3 : (indexable.indexOf(searchTerm) === 0) ? 2 : 1;
        return result;
      })
      .sortBy(function(result) { return -result.rank })
      .value();

    // group ranking
    rankedResultSet.rank = rankedResultSet.reduce(function(prev, cur) { return prev + cur.rank }, 0);

    // render template HTML
    var content = tmplSearchResultGroup({section: sectionName, results: rankedResultSet});
    renderedTemplatePartials[sectionName] = content;

    // pass back ranked results
    return rankedResultSet;
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
