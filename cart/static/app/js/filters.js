'use strict';

/* Filters */

angular.module('myApp.filters', []).
	filter('interpolate', ['version', function(version) {
		return function(text) {
			console.log(text)
		  return String(text).replace(/\%VERSION\%/mg, version);
		}
	}]).
	filter('date', ['version', function(version) {
		return function(text) {
			console.log(text)
		  return String(text).replace(/\%VERSION\%/mg, version);
		}
	}]);
