var EventCapture;
var ev_cap;
$(document).ready(function () {
	EventCapture = function () {
		this.src = $('.goToSlideLabel input')[0];
		this.slide_buttons = ["btnFirst", "btnLast", "btnPrevious", "btnNext"];
		this.current_slide_number = 1;
		this.slide_count = parseInt(this.src.value);
		this.src.value = 1;
	};

	EventCapture.prototype.addMainListener = function(){
		var self = this;
		if	(!document.getElementById('controllerID')){
			this.disabled_triggers = true;
		}
	    //Handle button click events
		for(var i in this.slide_buttons){
			var but = document.getElementsByClassName(this.slide_buttons[i]);
			if (but[0]) {
				but[0].onclick = function(e){
					self.current_slide_number = self.src.value;
					pusherPush(self.current_slide_number);
				};
			}
		}
		//Handle jump to slide event
		this.src.onkeyup = function (e) {
			if (e.keyCode == 13) {
	        	self.current_slide_number = ev_cap.inRange(this.value);
	        	this.value = self.current_slide_number;
	        	pusherPush(self.current_slide_number);
				console.log(this.value);
	    	}
		};

		//Handle arrow keys events
		document.onkeyup = function(e){
				if(e.keyCode == 91){
					selft.current_slide_number-=1;
					pusherPush(self.current_slide_number);
				}
				else if(e.keyCode == 92){
					selft.current_slide_number+=1;
					pusherPush(self.current_slide_number);
				}
		};
	};

	EventCapture.prototype.moveToSlide = function (slideNo) {
		//this.disabled_triggers = true;
		//var e = jQuery.Event("keydown");
		//e.which = 13; // Enter
		//$('.goToSlideLabel input').val(slideNo).trigger(e);
		$(".btnFirst").click();
		for (var i = 1; i < slideNo; i += 1) {
			console.log("clicking next");
			$(".btnNext").click();
		};
		//this.disabled_triggers = false;
	};

	EventCapture.prototype.inRange = function (slide_no) {
		console.log(slide_no);
		if (slide_no < 1) {
			slide_no = 1;
		}
		else if (slide_no > this.slide_count) {
			slide_no = this.slide_count;
		}
		return slide_no;
	};

	$('#controllerPrevious').click(function () {
		var slide_no = parseInt(ev_cap.src.value) - 1;
		ev_cap.src.value = ev_cap.inRange(slide_no);
	});
	$('#controllerNext').click(function () {
		var slide_no = parseInt(ev_cap.src.value) + 1;
		ev_cap.src.value = ev_cap.inRange(slide_no);
	});

	ev_cap = new EventCapture();
	ev_cap.addMainListener();
});