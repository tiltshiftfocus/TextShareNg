var socket = io();

var app = angular.module('ShareMsgApp',[]);

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
function mainCtrl($scope, $compile, anchorSmoothScroll){

	//var allmsg = [];

	socket.on('dbmsg', function(data){
		$scope.msgs = data;
		//allmsg = data;
		$scope.$apply();
		anchorSmoothScroll.scrollTo('bottom');
	});

	$scope.msgEmit = function(){
		socket.emit('chat message', $scope.message);
		$scope.message = '';
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
        console.log(data);
        var idToDel = data.x.id;
        var i = $scope.msgs.length;
        while(i--){
            if($scope.msgs[i].id == idToDel){
                $scope.msgs.splice(i,1);
            }
        }
        socket.emit('delete message', idToDel);
    }
	

	socket.on('chat message', function(msg, id){
  	//angular.element('#messages').append($('<li>').text(msg));
  	// var elem = angular.element( document.querySelector( '#messages' ) );
   //  var eleCompile = '';
  	// if(msg.substring(0,4) == 'http'){
   //      eleCompile = $compile('<li><p><a href="\''+msg+'\'">'+ msg +'</a><button data-id="'+id+'" id="deleteBtn" ng-click="deleteMsg(this)">Delete</button></p></li>')($scope);
  	// 	elem.append(eleCompile);	
  	// }else{
   //      eleCompile = $compile('<li><p>'+ msg +'<button ng-disabled="false" data-id="'+id+'" id="deleteBtn" ng-click="deleteMsg(this)">Delete</button></p></li>')($scope); 
  	// 	elem.append(eleCompile);	
  	// }
  	// $scope.$apply();

    $scope.msgs.push({"id": id, "msg": msg});
    $scope.$apply();

  	anchorSmoothScroll.scrollTo('bottom');
  });
}