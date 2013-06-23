var EventCapture;
var ev_cap;
$(document).ready(function () {

	EventCapture = function () {
		this.src = $('.goToSlideLabel input')[0];
		this.slide_buttons = ["btnFirst", "btnLast", "btnPrevious", "btnNext"];
		this.current_slide_number = 1;
		this.slide_count = 70; //parseInt($('.goToSlideLabel span').html().substring(1));
		this.src.value = 1;
		this.presenter_slide = 1;
		this.presenter_box = $('<a>Presenter: 1</a>').addClass('presenter_box')
							.css({	position: 'absolute',
									top: '15px', 
									left: '15px', 
									'z-index': '100', 
									backgroundColor: 'rgba(255,255,255,0.75)', 
									color: 'black',
									borderRadius: '3px',
									padding: '5px 10px',
									fontSize: '120%',
									cursor: 'pointer',
									display: 'block',
									width: '100px',
									textAlign: 'center'});
		this.presenter_box.click(function () {
			ev_cap.moveToSlide(ev_cap.presenter_slide);
		});
		$('body').append(this.presenter_box);
		if	(document.getElementById('controllerID')){
			this.is_controller = true;
		}
		else {
			this.is_controller = false;
		}
		this.disabled_triggers = !this.is_controller;
	};

	EventCapture.prototype.setPresenterSlide = function (slide) {
		var ec = this;
		setTimeout(function () {
			ec.presenter_slide = slide;
			var rejoin = '';
			if (slide != ec.current_slide_number) {
				rejoin = '<br />click here to rejoin';
			}
			ec.presenter_box.html('Presenter: ' + slide + rejoin);
		}, 80);
	};

	EventCapture.prototype.addMainListener = function () {
		var self = this;
	    //Handle button click events
		for(var i in this.slide_buttons){
			var but = document.getElementsByClassName(this.slide_buttons[i]);
			if (but[0]) {
				but[0].onclick = function(e){
					var new_slide = parseInt(self.src.value);
					pusherPush(new_slide, self.current_slide_number);
					self.current_slide_number = new_slide;
				};
			}
		}
		//Handle jump to slide event
		this.src.onkeyup = function (e) {
			if (e.keyCode == 13) {
	        	var new_slide_number = ev_cap.inRange(this.value);
	        	pusherPush(new_slide_number, self.current_slide_number);
	        	self.current_slide_number = new_slide_number;
	        	this.value = self.current_slide_number;
				console.log(this.value);
	    	}
		};

		//Handle arrow keys events
		document.onkeyup = function(e){
				if(e.keyCode == 91){
					var new_slide = self.current_slide_number - 1;
					pusherPush(new_slide, self.current_slide_number);
					self.current_slide_number = new_slide;
				}
				else if(e.keyCode == 92){
					var new_slide = self.current_slide_number + 1;
					pusherPush(new_slide, self.current_slide_number);
					self.current_slide_number = new_slide;
				}
		};
	};

	EventCapture.prototype.moveToSlide = function (slideNo) {
		this.disabled_triggers = true;
		this.current_slide_number = parseInt(this.src.value);
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