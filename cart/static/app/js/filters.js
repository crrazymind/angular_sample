'use strict';

/* Filters */
angular.module('myApp.filters', []).
	filter('interpolate', ['version', function(version) {
		return function(text) {
		  return String(text).replace(/\%VERSION\%/mg, version);
		}
	}]).
	filter('dateFilter', ['dateFilter', function(version) {
		return function(date) {
			var newDate = new Date(date).toUTCString();
		  return newDate;
		}
	}]).filter('costFilter', ['dateFilter', function(version) {
		return function(data) {
		  return +data;
		}
	}]);
