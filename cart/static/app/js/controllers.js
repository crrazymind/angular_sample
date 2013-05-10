'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	controller('view1Contr', [function($scope, $http, $compile, $filter) {}])
	.controller('MyCtrl2', [function($scope, $http, $compile, $filter) {
		//console.log(arguments)
		//tab2init.call(arguments);
	}]);

function getData($scope, $http, $compile, $filter, $dialog, $rootScope, GetItems){
	$scope.data = {};
	console.log(arguments)
	$http({method: 'GET', url: '/cart/api/'}).
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
		});
	$scope.sortKey = '-id';
	$scope.reverse = true;
	$scope.query = "";
	$scope.newCounter = 0;

	$scope.addRow = function(){
		var obj = {
			"cost":10,
			"title":"Trololo",
			"eta": new Date().toUTCString(),
			"duration":0,
			"id": "new",
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

	$scope.editDialogOpen = function(item){
		var itemToEdit = item;
		$dialog.dialog(angular.extend($scope.dialogOptions,{
			resolve: {
				item: function() {
					return angular.copy(itemToEdit);
				},
				callback: function(){
					return function onAction(data, result){
						if(item.id !== result.id) item.id = result.id;
					}
				}
			}
		})).open()
		.then(function(result){
			if(result) {
				angular.copy(result, itemToEdit);                
			}
			itemToEdit = undefined;
		});
	}

	$scope.dialogOptions = {
		backdropFade: true,
		dialogFade:true,
		controller: 'DialogController',
    	templateUrl: 'partials/dialog.html'
	};
}

// the dialog is injected in the specified controller
function DialogController($scope, $http, dialog, item, resultCallback){
	var editItem = [];
	for(var i in item){
		if(i !== "$$hashKey" && i !== "id")
		editItem.push({"key": i, "value": item[i]})
	}
  	$scope.dialogItem =  editItem;
  	$scope.origItem =  item;
	$scope.url = '/cart/apiSet/';

	$scope.save = function(result) {
		for (var i = 0; i < result.length; i++) {
			$scope.origItem[result[i].key] = result[i].value
		};
		$scope.saveData($scope.origItem.id, $scope.origItem, resultCallback)
		dialog.close($scope.origItem);
		var e = window.event;
		if(e.type === "click") e.preventDefault();
	};


	$scope.close = function(){
		dialog.close(undefined);
	};

	$scope.saveData = function (id, data, callback) {
		data.eta = new Date(data.eta).toUTCString();
		if(id === "new") id = "new/"+ id;
		$http({
		    method: 'POST',
		    url: $scope.url + id,
		    data: JSON.stringify(data),
		    headers: {
		    	'Content-Type': 'application/x-www-form-urlencoded',
		    	'X-CSRFToken': getCookie('csrftoken')
		   	}
		}).success(function(resData, status) {
			callback.apply($scope, [data, resData])

		}).error(function(data, status) {
			console.log(data, 'submit error')
		})
	};
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function tab2init($scope, $http, $compile, $filter, $rootScope){
	    var timeline;
        var data;
            data = [
                {
                    'start': new Date(2010,7,23),
                    'content': 'Conversation<br><img src="img/comments-icon.png" style="width:32px; height:32px;">'
                },
                {
                    'start': new Date(2010,7,23,23,0,0),
                    'content': 'Mail from boss<br><img src="img/mail-icon.png" style="width:32px; height:32px;">'
                },
                {
                    'start': new Date(2010,7,24,16,0,0),
                    'content': 'Report'
                },
                {
                    'start': new Date(2010,7,26),
                    'end': new Date(2010,8,2),
                    'content': 'Traject A'
                },
                {
                    'start': new Date(2010,7,28),
                    'content': 'Memo<br><img src="img/notes-edit-icon.png" style="width:48px; height:48px;">'
                },
                {
                    'start': new Date(2010,7,29),
                    'content': 'Phone call<br><img src="img/Hardware-Mobile-Phone-icon.png" style="width:32px; height:32px;">'
                },
                {
                    'start': new Date(2010,7,31),
                    'end': new Date(2010,8,3),
                    'content': 'Traject B'
                },
                {
                    'start': new Date(2010,8,4,12,0,0),
                    'content': 'Report<br><img src="img/attachment-icon.png" style="width:32px; height:32px;">'
                }
            ];

            if($rootScope.data){
            	data = [];
            	for (var i = 0; i < $rootScope.data.length; i++) {
            		var date = new Date($rootScope.data[i].eta);
            		data.push({
	                    'start': date.setHours(date.getHours() - $rootScope.data[i].duration),
	                    'end': new Date($rootScope.data[i].eta),
	                    'content': $rootScope.data[i].title
            		})
            	};
            }
            // specify options
            var options = {
                'width':  '100%',
                'height': '300px',
                'editable': true,   // enable dragging and editing events
                'style': 'box'
            };

            // Instantiate our timeline object.
            timeline = new links.Timeline(document.getElementById('mytimeline'));

            function onRangeChanged(properties) {
                /*document.getElementById('info').innerHTML += 'rangechanged ' +
                        properties.start + ' - ' + properties.end + '<br>';*/
            }

            // attach an event listener using the links events handler
            links.events.addListener(timeline, 'rangechanged', onRangeChanged);

            // Draw our timeline with the created data and options
            timeline.draw(data, options);

}