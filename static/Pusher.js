var pusher = new Pusher('25c5f81316b913b402ca');
var privateChannel = pusher.subscribe('private-channel');

Pusher.log = function(message) {
	if (window.console && window.console.log) {
		window.console.log(message);
	}
};

function pusherPush(number){
	
	privateChannel.bind('pusher:subscription_succeeded', function(data) { 
		privateChannel.trigger('client-event', {"message": number});
		ev_cap.moveToSlide(data.message);
	});

	privateChannel.bind('pusher:subscription_error', function(status) {
	  if(status == 408 || status == 503){
	  	console.log("AUTH error: " + status);
	  }
	});
};