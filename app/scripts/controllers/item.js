'use strict';

/**
 * @ngdoc function
 * @name trovelistsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the trovelistsApp
 */
angular.module('trovelistsApp')
  .controller('ItemCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, ListsDataFactory) {
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
        var item = $filter('findById')(items, $routeParams.order);
        $scope.item = item;
        if (item.type == 'newspaper') {
          $http.jsonp('http://api.trove.nla.gov.au/newspaper/' + item.id + '?encoding=json&reclevel=full&include=articletext&key=' + troveAPIKey + '&callback=JSON_CALLBACK', {cache: true})
            .then(function successCallback(response) {
              var paras = response.data.article.articleText.match(/<p>.*?<\/p>/g);
              $scope.articleText = paras.slice(0,5).join('') + "&hellip;";
              $scope.words = response.data.article.wordCount;
            });
          }
      });
    }
    
}]);
