'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	value('version', '0.1').
	config(function($interpolateProvider) {
		$interpolateProvider.startSymbol('((');
		$interpolateProvider.endSymbol('))');
	});

angular.module('myApp.dataFactory', ['ngResource']).
	factory('Data', function($resource){
		return $resource('phones/:phoneId.json', {}, {
			query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
		});
});