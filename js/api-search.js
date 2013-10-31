var API_SEARCH = (function() {

  // == | PRIVATE ===============================

  var index = [], query = "";
  var selectedResult = 0, totalResultCount = 0;

  var renderedTemplatePartials = {};
  var tmplSearchResultGroup;

  // arrow keys, enter key...
  // actions speak louder than words!
  var nonSearchKeycodes = [40, 38, 13];

  var redirectTo = function(href) {
    window.location = href;
    $('.api-search-input').val('');
    resetSearch();
  }

  var nextInList = function(direction, $selected, $resultSet) {
    selectedResult += direction
    if (selectedResult < 0) selectedResult = 0
    else if (selectedResult > totalResultCount-1) selectedResult = totalResultCount - 1

    var $next = $resultSet.eq(selectedResult)

    if ($next.length) {
      $selected.removeClass('selected');
      $next.addClass('selected');
    }
  }

  // keyboard navigation
  var keyboardNavigation = function (e) {
    if (nonSearchKeycodes.indexOf(e.keyCode) < 0) return;

    var $domResults = $('.result-list-item');
    var $selected = $domResults.eq(selectedResult);

    // enter key
    if (e.keyCode === 13) {
      redirectTo($selected.children('a').eq(0).attr('href'))
    // arrow keys
    } else {
      var direction = (e.keyCode === 40) ? 1 : -1;
      nextInList(direction, $selected, $domResults)
    }

    return false;
  };

  var resetSearch = function () {
    $('#api-search-results').empty();
    $('#api-search-results').removeClass('active');
    selectedResult = 0;
    renderedTemplatePartials = {};
  };

  var autocompleteSearch = function (e) {
    // don't capture if we're using arrows or enter key
    if (nonSearchKeycodes.indexOf(e.keyCode) >= 0) return;

    resetSearch();

    if ( !(query = $(this).val()) ) return;

    // filter relevant results
    results = _.chain(index)
      .filter( filterResults )
      .groupBy(function (result) { return result.section })
      // calculate rank value per result, aggregate per section
      .map( rank )
      // render partials in correct order based on rank
      .map(function (resultSet) { return {rank: resultSet.rank, section: resultSet[0].section} })
      .sortBy(function (data) { return -data.rank })
      .value();

    // insert into DOM
    for (var i=0, totalRank=0; i < results.length && totalRank < 15; i++) {
      var data = results[i];
      document.getElementById('api-search-results').innerHTML += renderedTemplatePartials[data.section];
      totalRank += data.rank;
    }

    // use correct styling
    if (results.length) {
      $('#api-search-results').addClass('active');
    }

    var $domResults = $('.result-list-item');
    totalResultCount = $domResults.length;
    $domResults.eq(0).addClass('selected');
  };

  var rank = function (resultSet, sectionName) {
    // individual ranking
    var rankedResultSet = _.chain(resultSet)
      .map(function (result) {
        // case-insensitive
        var indexable = result.name.toLowerCase();
        var searchTerm = query.toLowerCase();

        // 3: exact match, 2: starts with, 1: substr
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

    $('.api-search-input').on('keyup', autocompleteSearch);
    $('.api-search-input').on('keydown', keyboardNavigation);
  };

  return { init: init };

})();
