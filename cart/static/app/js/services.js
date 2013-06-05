'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
	value('version', '0.1').
	factory('ItemsFactory', ['$resource', function($resource) {
	    var Items = $resource('/cart/api/', {}, {
	        get: {
	            method: 'GET'
	        }
	    });
	    return Items;
	}]).
	factory('reddit', ['$http', '$q', function($http, $q) {
		var defer = $q.defer();

		$http({method: 'GET', url: '/cart/redditData/'}).
		success(function(data, status, headers, config) {
			var dataArr = [];
			for (var i = 0; i < data.data.children.length; i++) {
				dataArr.push(data.data.children[i].data)
				
			};			
			defer.resolve(dataArr);
		}).
		error(function(data, status, headers, config) {
			console.log("load error", status);
			return false;
		});
	    return defer.promise
	}]).
	factory('redditUser', ['$http', '$q', function($http, $q, userName) {
		return {
			get: function(userName){
				var defer = $q.defer();
				console.log(userName)
				$http({method: 'GET', url: '/cart/userData/?user=' + userName}).
				success(function(data, status, headers, config) {
					var dataArr = [];
					for (var i = 0; i < data.data.children.length; i++) {
						dataArr.push(data.data.children[i].data)
						
					};			
					defer.resolve(dataArr);
				}).
				error(function(data, status, headers, config) {
					console.log("load error", arguments);
					return false;
				});
			    return defer.promise
			}
		}
	}]);