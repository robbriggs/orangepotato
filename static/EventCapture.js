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
			pusher.trigger('presentation_channel', 'move_to_slide', {
  				"current_slide_number": self.current_slide_number
			});
		};
	}
	//Handle text input event
	this.src.onkeyup = function (e) {
		if (e.keyCode == 13) {
        	self.current_slide_number = this.value;
        	pusher.trigger('presentation_channel', 'move_to_slide', {
  				"current_slide_number": self.current_slide_number
			});
    	}
	};
};

EventCapture.moveToSlide = function (slideNo) {
	var e = jQuery.Event("keydown");
	e.which = 13; // Enter
	//$('.goToSlideLabel input').val(slideNo).trigger(e);
	$(".btnFirst").click();
	for (var i = 1; i < slideNo; i += 1) {
		console.log("clicking next");
		$(".btnNext").click();
	};
};