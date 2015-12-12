'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('ItemCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', '$location', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, $location, ListsDataFactory) {
    $document.scrollTop(0);
    //this.order = $routeParams.order;
    //this.list = lists[listId];
    $scope.nextItem = function() {
      var order = $routeParams.order;
      if (order < $rootScope.items.length) {
        $location.url('#/resources/' + (order + 1));
      }
    };
    var setItem = function() {
      var item = $filter('findById')($rootScope.items, $routeParams.order);
      $scope.item = item;
      if (item.type === 'newspaper') {
        $http.jsonp('http://api.trove.nla.gov.au/newspaper/' + item.id + '?encoding=json&reclevel=full&include=articletext&key=' + window.troveAPIKey + '&callback=JSON_CALLBACK', {cache: true})
          .then(function successCallback(response) {
            //var paras = response.data.article.articleText.match(/<p>.*?<\/p>/g);
            //$scope.articleText = paras.slice(0,5).join('') + '&hellip;';
            $scope.articleText = response.data.article.articleText;
            $scope.words = response.data.article.wordCount;
        });
      } else if (item.type === 'work' && item.holdings === 1) {
        $http.jsonp('http://api.trove.nla.gov.au/work/' + item.id + '?encoding=json&reclevel=full&include=holdings&key=' + window.troveAPIKey + '&callback=JSON_CALLBACK', {cache: true})
          .then(function successCallback(response) {
            var nuc;
            try { 
              nuc = response.data.work.holding[0].nuc;
            } catch(e) {
              //Do nothing
            }
            if (typeof nuc !== 'undefined') {
              $http.jsonp('http://api.trove.nla.gov.au/contributor/' + nuc + '?encoding=json&key=' + window.troveAPIKey + '&callback=JSON_CALLBACK', {cache: true})
                .then(function successCallback(response) {
                  $scope.repository = response.data.contributor.name.replace(/\.$/, '');
              });
            }
        });
      }
    };
    if (typeof $rootScope.items === 'undefined' && $rootScope.failed !== true) {
      var tries = 1;
      var loadListData = function() {
        var promises = ListsDataFactory.getPromises();
        $q.all(promises).then(
          function successCallback(responses) {
            ListsDataFactory.loadResources(responses);
            setItem();
          },
          function errorCallback() {
            if (tries < 1) {
              tries++;
              loadListData();
            } else {
              //$rootScope.listHide = false;
              $rootScope.failed = true;
              $location.url('/');
            }
          });
      };
      loadListData();
    } else if ($rootScope.failed === true) {
      $location.url('/');
    } else {
      setItem();
    }
}]);
