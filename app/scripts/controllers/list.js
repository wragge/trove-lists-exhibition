'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('ListCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, ListsDataFactory) {
    $document.scrollTop(0);
    //this.order = $routeParams.order;
    //this.list = lists[listId];
    if ($scope.items.length === 0) {
      var promises = ListsDataFactory.getPromises();
      $q.all(promises).then(function successCallback(responses) {
        var order = 1;
        var items = [];
        var lists = [];
        angular.forEach(responses, function(response) {
          var listDetails = ListsDataFactory.processList(response.data.list[0], order);
          items = ListsDataFactory.processListItems(listDetails[1], order, items);
          lists.push(listDetails[0]);
          order++;
        }); 
        $scope.lists = lists;
        $scope.items = items;
        var list = $filter('findById')(lists, $routeParams.order);
        $scope.list = list;
      });
    }
  }]);
