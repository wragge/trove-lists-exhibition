'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, ListsDataFactory) {
    $document.scrollTop(0);
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
      });
    }  
  }]);