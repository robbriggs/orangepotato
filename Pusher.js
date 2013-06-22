function PusherMain(){
	this.pusher = new Pusher('25c5f81316b913b402ca');
	this.channel = pusher.subscribe('my_channel');
};

PusherMain.prototype.bind = function(data){
	this.channel.bind('my_event', function(data) {
		alert(data.message);
    });
};

Pusher.log = function(message) {
	if (window.console && window.console.log) {
		window.console.log(message);
	}
};