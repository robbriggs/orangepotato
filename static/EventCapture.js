var EventCapture;
var ev_cap;
$(document).ready(function () {
	EventCapture = function () {
		this.src = $('.goToSlideLabel input')[0];
		this.slide_buttons = ["btnFirst", "btnLast", "btnPrevious", "btnNext"];
		this.current_slide_number = 1;
		this.slide_count = 70; //parseInt($('.goToSlideLabel span').html().substring(1));
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
					self.current_slide_number-=1;
					pusherPush(self.current_slide_number);
				}
				else if(e.keyCode == 92){
					self.current_slide_number+=1;
					pusherPush(self.current_slide_number);
				}
		};
	};

	EventCapture.prototype.moveToSlide = function (slideNo) {
		this.disabled_triggers = true;
		slideNo = parseInt(slideNo);
		var i = this.current_slide_number;
		console.log('slide count: ' + this.slide_count);
		console.log('current slide: ' + this.current_slide_number + ', desired slide: ' + slideNo);
		if (slideNo <= 1) {
			console.log("clicking first " + i);
			$(".btnFirst").click();
		}
		else if (slideNo === this.slide_count) {
			console.log("clicking last " + i);
			$(".btnLast").click();
		}
		else {
			while (i < slideNo) {
				console.log("clicking next " + i);
				$(".btnNext").click();
				i += 1;
			};
			while (i > slideNo) {
				console.log("clicking previous " + i);
				$(".btnPrevious").click();
				i -= 1;
			};
		}
		this.current_slide_number = slideNo;
		this.disabled_triggers = false;
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