'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('ListCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', '$location', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, $location, ListsDataFactory) {
    $document.scrollTop(0);
    //this.order = $routeParams.order;
    //this.list = lists[listId];
    var setList = function() {
      var list = $filter('findById')($rootScope.lists, $routeParams.order);
      $scope.list = list;
    };
    if (typeof $rootScope.items === 'undefined' && $rootScope.failed !== true) {
      var tries = 1;
      var loadListData = function() {
        var promises = ListsDataFactory.getPromises();
        $q.all(promises).then(
          function successCallback(responses) {
            ListsDataFactory.loadResources(responses);
            setList();
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
    } else {
      setList();
    }
  }]);

