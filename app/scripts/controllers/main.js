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
            }
          );
        };
        loadListData();
      }
    }
  ]);