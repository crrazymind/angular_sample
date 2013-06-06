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

	app.directive('appUser', ['grabusers', function() {
		return {
			restrict: 'E',
			template: $('.template-holder').html(),
			link: function(scope, el, attr, $watch){
				scope.data = false;
				scope.el = el;
				scope.attr = attr;
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
				var force = d3.layout.force();
				force.charge(-50)
				    .linkDistance(30)
				    .size([width, height]);

				var color = d3.scale.category20();
				var nodes = [],
					links = [];
				scope.$watch('data', function (data, oldVal) {
					if(!data) return;
					var ind = 0;
					var childInd = 0;
					var userNode, post;

					var initNode = nodes.push({
						user: true,
						title: "initial",
						post: {},
						ind: 0,
						group: 0
					});
					for (var node in data){
						post = data[node];
						userNode = nodes.push({
							user: true,
							title: node,
							post: post,
							ind: ind,
							group: 0
						});

						
						link = links.push({
							source: userNode - 1,
							target: 0,
							value: 1
						});
						for (var item in post){
								//console.log(post[item].num_comments)
								var postItem = nodes.push({
									title: post[item].title,
									user: false,
									post: post[item],
									group: ind
								});

								links.push({
									source: postItem - 1,
									target: userNode - 1,
									value: 1
								});
						}
						ind++;
					}
					links.push({
						source: userNode,
						target: 0,
						value: 1
					});


					force
				      .nodes(nodes)
				      .links(links)
				      .start();

						var link = svg.selectAll(".link")
							.data(links)
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", function(d) { return Math.sqrt(d.value); });

						var node = svg.selectAll(".node")
							.data(nodes)
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", function(d) { return d.user ? 8 : 5 })
							.attr("data-title", function(d) { return d.title })
							.attr("data-ind", function(d) { return d.ind })
							.style("fill", function(d) { return color(d.group); })
							.call(force.drag);

					  node.append("title")
					      .text(function(d) { return d.title; });

					  force.on("tick", function() {
					    link.attr("x1", function(d) { return d.source.x; })
					        .attr("y1", function(d) { return d.source.y; })
					        .attr("x2", function(d) { return d.target.x; })
					        .attr("y2", function(d) { return d.target.y; })
					        .style("stroke", "#FF0000");

					    node.attr("cx", function(d) { return d.x; })
					        .attr("cy", function(d) { return d.y; });
					  });
				});
				
				/*$(scope.el).find("#userChoise").bind('change', function(){
					var req = scope.redditUser.get($(this).val());
					req.then(function(res){
						scope.data = res;
					});
				});*/
			},
			controller: function($scope, grabusers){
				grabusers.then(function(res){
					$scope.data = res;
				});
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