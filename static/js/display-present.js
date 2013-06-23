// MATTS AUDIO SYNC CODE
$(document).ready(function () {
	silentConnect();
	console.log(selfEasyrtcid);
	var c_socket = location.pathname.substring(3,23);
	performCall(c_socket);
});