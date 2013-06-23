var pusher = new Pusher('25c5f81316b913b402ca');
var privateChannel = pusher.subscribe('private-channel');
var pusherPush;
/*
Pusher.log = function(message) {
	if (window.console && window.console.log) {
		window.console.log(message);
	}
};
*/
$(document).ready(function () {
	privateChannel.bind('pusher:subscription_succeeded', function(data) { 
		//ev_cap.moveToSlide(data.message);
		console.log('pusher subscription succeeded');
		pusherPush = function (number){
			if (!ev_cap.disabled_triggers && ev_cap.is_controller) {
				privateChannel.trigger('client-move-to-slide', {"slide_number": number});
			}
		};
		privateChannel.bind('client-move-to-slide', function(data) { 
			ev_cap.moveToSlide(data.slide_number);
		});
	});
	privateChannel.bind('pusher:subscription_error', function(status) {
	  if(status == 408 || status == 503){
	  	console.log("AUTH error: " + status);
	  }
	});
});