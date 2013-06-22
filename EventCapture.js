function EventCapture(){
	this.src = document.getElementsByClassName("goToSlideLabel")[0].getElementsByTagName("input")[0];
	this.slide_buttons = ["btnFirst", "btnLast", "btnPrevious", "btnNext"];
	this.current_slide_number = 0;
};

EventCapture.prototype.addMainListener = function(){
	var self = this;
    //Handle button click events
	for(var i in this.slide_buttons){
		var but = document.getElementsByClassName(this.slide_buttons[i]);
		but[0].onclick = function(e){
			self.current_slide_number = self.src.value;
			pusher.trigger('test_channel', 'my_event', {
  				"current_slide_number": self.current_slide_number
			});
		};
	}
	//Handle text input event
	this.src.onkeyup = function (e) {
		if (e.keyCode == 13) {
        	self.current_slide_number = this.value;
        	pusher.trigger('test_channel', 'my_event', {
  				"current_slide_number": self.current_slide_number
			});
    	}
	};
};
