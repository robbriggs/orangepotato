var pusher = new Pusher('25c5f81316b913b402ca');
var channel = pusher.subscribe('test_channel');
channel.bind('my_event', function(data) {
      ev_cap.moveToSlide(data.current_slide_number);
});

function pusherPush(number){
	pusher.trigger('presentation_channel', 'move_to_slide', {
  		"current_slide_number": number
	});
};