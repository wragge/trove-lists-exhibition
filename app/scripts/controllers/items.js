'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('ItemsCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', '$location', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, $location, ListsDataFactory) {
    $document.scrollTop(0);
    $scope.view = 'list';
    $scope.totalDisplayed = 20;
    $scope.loadMore = function() {
      if ($scope.totalDisplayed < $scope.items.length) {
        $scope.totalDisplayed += 20;  
      }
    };
    if (typeof $rootScope.items === 'undefined' && $rootScope.failed !== true) {
        var tries = 1;
        var loadListData = function() {
          var promises = ListsDataFactory.getPromises();
          $q.all(promises).then(
          function successCallback(responses) {
            ListsDataFactory.loadResources(responses);
          },
          function errorCallback() {
            if (tries < 1) {
              tries++;
              loadListData();
            } else {
              //$rootScope.listHide = false;
              $rootScope.failed = true;
            }
          });
        };
        loadListData();
    } else if ($rootScope.failed === true) {
      $location.url('/');
    }
  }]);