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
	}]).
	filter('costFilter', function(version) {
		return function(data) {
		  return +data;
		}
	}).
	filter('capitalize', function() {
	    return function(input, scope) {
	        return input.substring(0,1).toUpperCase()+input.substring(1);
	    }
	}).
	filter('modalItemsFilter', function() {
    	return function(input, scope) {
    		console.log(input)
    		if(input && input[0] === "$"){
    			return '';
    		}
	        return input === "id" ? 'hide' : '';
	    }
	}).
	filter('CheckedFilter', function() {
    	return function(input, scope) {
	        return !!input ? 'checked="checked"' : '';
	    }
	}).
	filter('ToHTMLDate', function() {
    	return function(input, scope) {
    		var date = new Date(input);
    		//2013-10-10T23:20:50.52
	        return ([date.getFullYear(), dec(date.getMonth()), dec(date.getDay())].join('-') +'T'+ [dec(date.getHours()), dec(date.getMinutes()), dec(date.getSeconds())].join(':'));
	    }
	});


function dec(data){
	return data < 10 ? ('0' + data) : data;
}
var re = /глава (\d+(\.\d)*)/i