var pusher = new Pusher('25c5f81316b913b402ca');
var channel = pusher.subscribe('private-presentation-channel');
channel.bind('client-move-to-slide', function(data) {
	console.log('Received message to move to slide ' + self.current_slide_number);
    ev_cap.moveToSlide(data.current_slide_number);
});

function pusherPush(number){
	channel.trigger('private-presentation-channel', 'client-move-to-slide', {
  		"current_slide_number": number
	});
	console.log('moving to slide ' + number);
};