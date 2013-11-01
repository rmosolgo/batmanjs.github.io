var ApiSearch = (function() {

  // == | PRIVATE ===============================

  var index = [], query = "";
  var selectedResult = 0, totalResultCount = 0;

  var renderedTemplatePartials = {};
  var tmplSearchResultGroup;

  // arrows, enter, esc...
  // actions speak louder than words!
  var nonQueryKeycodes = [40, 38, 13, 27];

  var redirectTo = function(href) {
    window.location = href;
    $('.api-search-input').val('');
    clearResults();
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

  var keyboardNavigation = function (e) {
    if (nonQueryKeycodes.indexOf(e.keyCode) === -1) return;

    var $domResults = $('.result-list-item');
    var $selected = $domResults.eq(selectedResult);

    switch (e.keyCode) {
      // enter
      case 13:
        redirectTo( $selected.children('a').eq(0).attr('href') );
        break;
      // escape
      case 27:
        clearResults();
        break;
      // arrows
      case 38:
      case 40:
        var direction = (e.keyCode === 40) ? 1 : -1;
        nextInList(direction, $selected, $domResults);
    }

    e.preventDefault();
  };

  var autocompleteSearch = function (e) {
    // don't capture if we're using arrows or enter key
    if (nonQueryKeycodes.indexOf(e.keyCode) >= 0) return;

    clearResults();

    if ( !(query = $(this).val()) ) return;

    // filter relevant results
    var results = _.chain(index)
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
    $domResults.eq(0).addClass('selected');

    totalResultCount = $domResults.length;
  };

  var rank = function (resultSet, sectionName) {
    // individual ranking
    var rankedResultSet = _.chain(resultSet)
      .map(function (result) {
        // case-insensitive
        var indexable = result.name.toLowerCase();
        var searchTerm = query.toLowerCase();

        // 3: exact match, 2: starts with, 1: substr
        result.rank = (indexable === searchTerm) ? 5 : (indexable.indexOf(searchTerm) === 0) ? 3 : 1;
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

  var initialize = function (searchIndex) {
    index = searchIndex;

    initTemplates();

    $('.api-search-input').on('keyup', autocompleteSearch);
    $('.api-search-input').on('keydown', keyboardNavigation);
  };

  var clearResults = function () {
    $('#api-search-results').empty();
    $('#api-search-results').removeClass('active');
    selectedResult = totalResultCount = 0;
    renderedTemplatePartials = {};
  };

  return {
    initialize: initialize,
    clear: clearResults
  };

})();
