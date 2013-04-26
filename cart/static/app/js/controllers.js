'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);

function getData($scope, $http, $compile){
	$scope.data = {};
	$http({method: 'GET', url: '/static/json.json'}).
		success(function(data, status, headers, config) {
			$scope.data = data;

		}).
		error(function(data, status, headers, config) {

		});
	$scope.sortKey = '-title';
	$scope.reverse = true;
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
}