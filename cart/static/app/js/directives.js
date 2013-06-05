'use strict';

/* Directives */


var app = angular.module('myApp.directives', []);
	
	app.directive('appChart', ['redditUser', 'reddit', function() {
		return {
			restrict: 'E',
			template: $('.template-holder').html(),
			link: function(scope, el, attr, $watch){
				console.log(arguments)
				scope.data = {title:null};
				scope.el = el;
				scope.attr = attr;
				console.log('appChart init: ', arguments)
				scope.userdata = ["null"];

				var wrap = scope.el.parent('.el-wrapper');
				var width = $(window).outerWidth(),
    			height = $(window).outerHeight() - 200;
				var svg = d3.select(scope.el[0]).append("svg")
				.attr("width", width)
				.attr("height", height);
			  	
				width = $(wrap).outerWidth();
    			height = $(wrap).outerHeight();
    			svg.attr("width", width).attr("height", height);
				var scale = 100;

				scope.$watch('data', function (data, oldVal) {
					var rect = svg.selectAll("rect").data(scope.data);
					console.log(scope.data)
					rect.enter().append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 20)
					.attr("data-ups", function(d, i) { return d.ups })
					.attr("height", function(d, i) { return d.ups/scale; });

					rect.exit().remove();
					rect.transition().duration(2500).delay(0)
					.attr('x', function(d, i) { return i * 20 + i*5; })
					.attr("y", function(d, i) { return height - d.ups/scale; })
					.style("fill", "steelblue");
				});
				
				$(scope.el).find("#userChoise").bind('change', function(){
					var req = scope.redditUser.get($(this).val());
					req.then(function(res){
						scope.data = res;
					});
				});
			},
			controller: function($scope, reddit, redditUser){
				reddit.then(function(res){
					$scope.data = res;
					var users = [];
					for (var i = 0; i < res.length; i++) {
						users.push(res[i].author);
					};
					$scope.userdata = users;
				});
				$scope.redditUser = redditUser;
			}
		}
	}]);

	app.directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}]).
	directive('bsNavbar', function($location) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs, controller) {
				scope.$watch(function() {
					return $location.path();
				}, function(newValue, oldValue) {
					$('li[data-match-route]', element).each(function(k, li) {
						var $li = angular.element(li),
						// data('match-rout') does not work with dynamic attributes
						pattern = $li.attr('data-match-route'),
						regexp = new RegExp('^' + pattern + '$', ['i']);
						if(regexp.test(newValue)) {
							$li.addClass('active');
						} else {
							$li.removeClass('active');
						}
					});
			  });
			}
		};
	});