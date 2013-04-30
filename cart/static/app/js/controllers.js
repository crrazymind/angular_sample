'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	controller('view1Contr', [function($scope, $http, $compile, $filter) {
	}])
	.controller('MyCtrl2', [function() {
		
	}]);

function getData($scope, $http, $compile, $filter){
	$scope.data = {};
	$http({method: 'GET', url: '/cart/api/'}).
	//$http({method: 'GET', url: '/cart/stock/'}).
	//var url = 'http://dev.markitondemand.com/Api/Timeseries/jsonp?symbol=AAPL&callback=JSON_CALLBACK'
	//$http.jsonp(url).
		success(function(data, status, headers, config) {
			$scope.data = data;
			$scope.dataCache = data;
		}).
		error(function(data, status, headers, config) {
			console.log("load error", status)
		});
	$scope.sortKey = '-title';
	$scope.reverse = true;
	$scope.query = "";
	$scope.newCounter = 0;

	$scope.addRow = function(){
		var obj = {
			"cost":10,
			"title":"Trololo",
			"eta":"Thu Dec 27 2012",
			"duration":0,
			"done":1
		};
		$scope.newCounter++;
		$scope.data.push(obj);
	}
	$scope.className = function(){
		if($scope.reverse){
			return  "icon-arrow-up";
		}else{
			return "icon-arrow-down";
		}
		
	}
	var searchMatch = function (item, query) {
        if (!query) {
            return true;
        }
        return String(item).toLowerCase().indexOf(query.toLowerCase()) !== -1;
    };
	$scope.search = function(){
		$scope.filteredItems = $filter('filter')($scope.dataCache, function (item) {
			
            for(var attr in item) {
                if (searchMatch(item[attr], $scope.query))
                    return true;
            }
            return false;
        });
        $scope.data = $scope.filteredItems;
	}
}

var ModalCtrl = function ($scope) {
  $scope.open = function () {
    $scope.shouldBeOpen = true;
  };

  $scope.close = function () {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.shouldBeOpen = false;
  };

	$scope.save = function () {
		console.log("save")
	};

  $scope.items = ['item1', 'item2'];

  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

};