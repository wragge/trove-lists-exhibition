'use strict';

/**
 * @ngdoc overview
 * @name trovelistsApp
 * @description
 * # trovelistsApp
 *
 * Main module of the application.
 */
var app = angular.module('trovelistsApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'picardy.fontawesome',
    'truncate',
    'infinite-scroll',
    'masonry'
  ]);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      controllerAs: 'mc'
    })
    .when('/reload/', {
      templateUrl: 'views/main.html',
      controller: 'ReloadCtrl',
      controllerAs: 'rc'
    })
    .when('/topics/', {
      templateUrl: 'views/lists.html',
      controller: 'ListsCtrl',
      controllerAs: 'lsc'
    })
    .when('/topics/:order', {
      templateUrl: 'views/list.html',
      controller: 'ListCtrl',
      controllerAs: 'lc'
    })
    .when('/resources/', {
      templateUrl: 'views/items.html',
      controller: 'ItemsCtrl',
      controllerAs: 'isc'
    })
    .when('/resources/:order', {
      templateUrl: 'views/item.html',
      controller: 'ItemCtrl',
      controllerAs: 'ic'
    })
    .otherwise({
      redirectTo: '/'
    });
  });

app.controller('BaseCtrl', function($scope, $document, $location) {
  $document.scrollTop(0);
  if (typeof $scope.exhibition === 'undefined') {
    $scope.listHide = true;
    $scope.sort = 'order';
    $scope.isActive = function (viewLocation) {
      var active = (viewLocation === $location.path());
      return active;
    };
    $scope.view = 'list';
    $scope.exhibition = angular.element('#exhibition-name').html();
    $scope.tagline = angular.element('#exhibition-tagline').html();
    $scope.description = angular.element('#exhibition-description').html();
    $scope.credit = angular.element('#exhibition-credit').html();
    $scope.listLinks = angular.element('.list-link');
    $scope.config = window.config;
  }
});

app.controller('ReloadCtrl', function($rootScope, $location) {
  $rootScope.failed = false;
  $location.url('/');
});

app.factory('ListsDataFactory', function($rootScope, $document, $http) {
  var listsDataFactory = {};
  var processListItems = function(listItems, listId, items) {
    var order = items.length + 1;
    angular.forEach(listItems, function(listItem) {
      var item = {};
      item.order = order;
      item.list = listId;
      item.rank = 0.5 - Math.random();
      angular.forEach(listItem, function(details, itemType) {
        if (itemType === 'article') {
          item.type = 'newspaper';
          item.id = details.id;
          item.title = details.heading;
          item.newspaper = details.title.value;
          item.date = details.date;
          try {
            item.year = parseInt(item.date.toString().match(/^([12]{1}\d{3})[\-\.\w\s]*/)[1], 10);
          } catch(e) {
            item.year = 0;
          }
          item.page = details.page;
          item.url = details.troveUrl;
        } else if (itemType === 'work') {
          item.type = 'work';
          item.title = details.title;
          item.id = details.id;
          item.format = details.type;
          item.url = details.troveUrl;
          item.date = details.issued;
          if (typeof details.contributor !== 'undefined') {
            item.contributor = details.contributor;
          }
          try {
            item.year = parseInt(item.date.toString().match(/^([12]{1}\d{3})[\-\.\w\s]*/)[1], 10);
          } catch(e) {
            item.year = 0;
          }
          item.holdings = details.holdingsCount;
          angular.forEach(details.identifier, function(link) {
            if (link.linktype === 'thumbnail') {
              item.thumbnail = link.value;
            } else if (link.linktype === 'fulltext') {
              item.fulltext = link.value;
              if (typeof link.linktext !== 'undefined') {
                item.linktext = link.linktext;
              }
            } 
          });
        } else if (itemType === 'externalWebsite') {
          item.type = 'website';
          item.title = details.title;
          if (angular.isArray(details.identifier)) {
            item.url = details.identifier[0].value;
          } else {
            item.url = details.identifier.value;
          }
        } else if (itemType === 'note') {
          item.note = details;
        } else if (itemType === 'people') {
          item.type = 'people';
        }
      });
      if (item.type !== 'people') { 
        items.push(item);
        order++;
      }
    });
console.log(items);
    return items;
  };
  var processList = function(data, order) {
    var list = {};
    list.order = order;
    list.id = data.id;
    list.title = data.title;
    list.numberOfItems = data.listItemCount;
    list.description = data.description;
    if (typeof data.identifier !== 'undefined') {
      if (data.identifier.value.match(/^http/)) {
        list.thumbnail = data.identifier.value;
      } else {
        list.thumbnail = 'http://trove.nla.gov.au' + data.identifier.value;
      }
    }
    return [list, data.listItem];
  };
  listsDataFactory.getPromises = function() {
    console.log('Getting...');
    var listLinks = angular.element('.list-link');
    var promises = [];
    angular.forEach(listLinks, function(link) {
      var listID = angular.element(link).attr('href').match(/id=(\d+)/)[1];
      var request = $http.jsonp('http://api.trove.nla.gov.au/list/' + listID + '?encoding=json&reclevel=full&include=listItems&key=' + window.troveAPIKey + '&callback=JSON_CALLBACK', {cache: true});
      promises.push(request);
    });
    return promises;
  };
  listsDataFactory.loadResources = function(responses) {
    var order = 1;
    var items = [];
    var lists = [];
    angular.forEach(responses, function(response) {
      var listDetails = processList(response.data.list[0], order);
      items = processListItems(listDetails[1], order, items);
      lists.push(listDetails[0]);
      order++;
    }); 
    $rootScope.items = items;
    $rootScope.lists = lists;
  };

  return listsDataFactory;
});
app.filter('findById', function() {
  return function(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (+list[i].order === +id) {
        return list[i];
      }
    }
  };
});

app.filter('itemsInList', function() {
  return function(items, listId) {
    var listItems = [];
    for (var i = 0; i < items.length; i++) {
      if (+items[i].list === +listId) {
        listItems.push(items[i]);
      }
    }
    return listItems;
  };
});

app.filter('itemsWithThumbnails', function() {
  return function(items) {
    var thumbnails = [];
    for (var i = 0; i < items.length; i++) {
      if (typeof items[i].thumbnail !== 'undefined') {
        thumbnails.push(items[i]);
      }
    }
    return thumbnails;
  };
});

app.filter('randomItems', function($filter) {
  return function(items, number) {
    var selected = [];
    var thumbnails = $filter('itemsWithThumbnails')(items);
    if (thumbnails.length > number) {
      for (var i = 0; i < 10; i++) {
        var random = Math.floor(Math.random() * thumbnails.length);
        selected.push(thumbnails.splice(random, 1));
      }
    } else {
      selected = thumbnails;
    }
    return selected;
  };
});

app.filter('dateFormat', function($filter) {
  return function(date) {
    var formattedDate = '';
    if (typeof date !== 'undefined') {
        var parts = date.split('-');
        if (parts.length === 1) {
          formattedDate = date;
        } else if (parts.length === 2) {
          formattedDate = $filter('date')(date + '-' + '01', 'MMMM yyyy');
        } else {
          formattedDate = $filter('date')(date, 'd MMMM yyyy');
        }
      }
    return formattedDate;
    };
});
