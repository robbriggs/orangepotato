$(document).ready(function () {
	$(".btnNext").click(function () {
	})
});
function moveToSlide (slideNo) {
	var e = jQuery.Event("keydown");
	e.which = 13; // Enter
	//$('.goToSlideLabel input').val(slideNo).trigger(e);
	$(".btnFirst").click();
	for (var i = 1; i < slideNo; i += 1) {
		console.log("clicking next");
		$(".btnNext").click();
	};
};