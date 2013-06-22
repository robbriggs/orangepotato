window.onload = function(e){
	//Retrieve data
	var ev_han = new EventCapture();
	ev_han.addMainListener();
	
	//Push it to pusher
	var Pusher = require('pusher');
	
	var pusher = new Pusher({
 		appId: '47190',
 		key: '25c5f81316b913b402ca',
 		secret: '2a8185337a8dac32ab35'
	});

	pusher.trigger('my_channel', 'my_event', {
	  "message": "hello world"
	});

};
