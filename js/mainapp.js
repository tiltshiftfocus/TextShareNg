var socket = io();

var app = angular.module('TextShareApp',['ionic']);

app.factory('focus', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  })

app.directive('removeOnClick', function() {
    return {
        link: function(scope, elt, attrs) {
            scope.remove = function() {
                console.log(attrs.id);
            };
        }
    }
});

app.directive('whenScrolled', ['$timeout', function($timeout) {
    return function(scope, elm, attr) {
        var raw = elm[0];

        $timeout(function() {
            raw.scrollTop = raw.scrollHeight;
        });

        elm.bind('scroll', function() {
            if (raw.scrollTop <= 100) { // load more items before you hit the top
                var sh = raw.scrollHeight
                scope.$apply(attr.whenScrolled);
                raw.scrollTop = raw.scrollHeight - sh;
            }
        });
    };
}]);

app.service('anchorSmoothScroll', function(){

	this.scrollTo = function(eID) {

        // This scrolling function
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
        	scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
        	for ( var i=startY; i<stopY; i+=step ) {
        		setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        		leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        	} return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
        	setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        	leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
            	return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
        	var elm = document.getElementById(eID);
        	var y = elm.offsetTop;
        	var node = elm;
        	while (node.offsetParent && node.offsetParent != document.body) {
        		node = node.offsetParent;
        		y += node.offsetTop;
        	} return y;
        }

    };

});


app.controller('mainCtrl', mainCtrl);
function mainCtrl($scope, $compile, anchorSmoothScroll, focus){

	//var allmsg = [];

	socket.on('dbmsg', function(data){
        //console.log(data);
		$scope.msgs = data;
		//allmsg = data;
		$scope.$apply();
		//anchorSmoothScroll.scrollTo('bottom');
        focus('m');
	});

	$scope.msgEmit = function(){
		socket.emit('chat message', $scope.message);
		$scope.message = '';
        focus('m');
	}

	$scope.ifInputEmpty = function(){
		if($scope.message == '' || $scope.message == null){
			return true;
		}else
			return false;
	}

	$scope.loadMore = function(){

	}

    $scope.deleteMsg = function(data){
        //console.log(data);
        var idToDel = data.x.id;
        var i = $scope.msgs.length;
        // while(i--){
        //     if($scope.msgs[i].id == idToDel){
        //         $scope.msgs.splice(i,1);
        //     }
        // }
        socket.emit('delete message', idToDel);
    }

    $scope.checkHttp = function(str){
        var tarea = str;
        var tarea_regex = /^(http|https|www)/;
        if(tarea_regex.test(String(tarea).toLowerCase()) == true)
        {
            return true;
        }
        return false;
    }


    socket.on('chat message', function(msg, id){
        $scope.msgs.unshift({"id": id, "msg": msg});
        $scope.$apply();

        //anchorSmoothScroll.scrollTo('bottom');
    });

    socket.on('update message', function(data){
        $scope.msgs = data;
        $scope.$apply();
    });
}
