'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	value('version', '0.1');/*.
	config(function($interpolateProvider) {
		$interpolateProvider.startSymbol('((');
		$interpolateProvider.endSymbol('))');
	});*/

angular.module('myApp.dataFactory', ['ngResource']).
	factory('Data', function($resource){
		return $resource('phones/:phoneId.json', {}, {
			query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
		});
	}).
	factory('GetItems', function($resource){
		return $http('/cart/api/', {}, {
		//return $resource('phones/:phoneId.json', {}, {
			query: {
				method: 'GET',
				params: {
					phoneId:'phones'
				},
				isArray: true
			}
		});
	});


	/*$http({method: 'GET', url: '/cart/api/'}).
	//$http({method: 'GET', url: '/cart/stock/'}).
	//var url = 'http://dev.markitondemand.com/Api/Timeseries/jsonp?symbol=AAPL&callback=JSON_CALLBACK'
	//$http.jsonp(url).
		success(function(data, status, headers, config) {
			$scope.data = data;
			$scope.dataCache = data;
			$rootScope.data = data;
		}).
		error(function(data, status, headers, config) {
			console.log("load error", status)
		});*/