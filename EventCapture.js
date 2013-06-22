function EventCapture(){
	this.slide_buttons = ["btnFirst", "btnLast", "btnPrevious", "btnNext", "btnFullScreen", "btnLeaveFullScreen"];
};

EventCapture.prototype.addMainListener = function(){
	for(var i in this.slide_buttons){
		var a = document.getElementsByClassName(this.slide_buttons[i]);
		//a[0] is dom el
		a[0].onclick = function(e){
			var action = this.className;
			console.log(action);
		}
	}
};

window.onload = function(e){
	var ev_han = new EventCapture();
	ev_han.addMainListener();
};
