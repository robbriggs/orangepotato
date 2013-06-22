var pusher = new Pusher('25c5f81316b913b402ca');
var channel = pusher.subscribe('test_channel');
channel.bind('my_event', function(data) {
      alert(data.current_slide_number);
});
