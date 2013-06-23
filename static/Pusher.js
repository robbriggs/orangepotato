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
		pusherPush = function (number, curr_slide){
			if (!ev_cap.disabled_triggers && ev_cap.is_controller) {
				privateChannel.trigger('client-move-to-slide', {"desired_slide": number, "current_slide": curr_slide});
			}
		};
		privateChannel.bind('client-move-to-slide', function(data) {
			console.log('my slide: ' + ev_cap.current_slide_number + ', presenter slide: ' + data.current_slide);
			ev_cap.setPresenterSlide(data.desired_slide);
			if (ev_cap.current_slide_number == data.current_slide) {
				ev_cap.moveToSlide(data.desired_slide);
			}
		});
	});
	privateChannel.bind('pusher:subscription_error', function(status) {
	  if(status == 408 || status == 503){
	  	console.log("AUTH error: " + status);
	  }
	});
});