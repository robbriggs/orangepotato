//
//Copyright (c) 2013, Priologic Software Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.
//
var selfEasyrtcid = "";

function disable(id) {
    if(document.getElementById(id)){
        document.getElementById(id).disabled = "disabled";
    }
}


function enable(id) {
    if(document.getElementById(id)){
        document.getElementById(id).disabled = "";
    }
}


function connect() {
    console.log("Initializing.");
    easyRTC.enableVideo(false);
    easyRTC.setLoggedInListener();
    easyRTC.initMediaSource(
        function(){        // success callback
            easyRTC.connect("OrangePotato", loginSuccess, loginFailure);
        },
        function(errmesg){
            easyRTC.showError("MEDIA-ERROR", errmesg);
        }  // failure callback
        );
}

// Connects without audio
function silentConnect() {
    console.log("Initializing.");
    easyRTC.setLoggedInListener();
    easyRTC.enableVideo(false);
    // easyRTC.enableAudio(false);
    easyRTC.connect("OrangePotato", bgLoginSuccess, loginFailure);
}

function terminatePage() {
    easyRTC.disconnect();
}


function hangup() {
    easyRTC.hangupAll();
    disable('hangupButton');
}


function performCall(otherEasyrtcid) {
    easyRTC.hangupAll();
    var acceptedCB = function(accepted, caller) {
        if( !accepted ) {
            easyRTC.showError("CALL-REJECTED", "Sorry, your call to " + easyRTC.idToName(caller) + " was rejected");
            enable('otherClients');
        }
    }
    var successCB = function() {
        // enable('hangupButton');
    }
    var failureCB = function() {
        enable('otherClients');
    }
    easyRTC.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}


function loginSuccess(easyRTCId) {
    // disable("connectButton");
    // enable("disconnectButton");
    enable('otherClients');
    sdisplayQR(easyRTCId);
}

function bgLoginSuccess(easyRTCId) {
    enable('otherClients');
    displayQR(easyRTCId);
    console.log(easyRTC.myEasyrtcid);
}

function displayQR(easyRTCId) {
    if(typeof(QRCode) == "undefined"){ return; }
    selfEasyrtcid = easyRTCId;
    var domain = (location.hostname == "localhost") ? "localhost:8000" : location.hostname;
    var address = 'http://'+domain+"/c/"+easyRTCId
    new QRCode(document.getElementById("qrcode"), {

        text: address,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    $('#ch-qrcode-a').attr("href",address);
}

function loginFailure(message) {
    easyRTC.showError("LOGIN-FAILURE", message);
}


function disconnect() {
    document.getElementById("iam").innerHTML = "logged out";
    easyRTC.disconnect();
    console.log("disconnecting from server");
    enable("connectButton");
    // disable("disconnectButton");
}

easyRTC.setStreamAcceptor( function(caller, stream) {
    var audio = document.getElementById('callerAudio');
    easyRTC.setVideoObjectSrc(audio,stream);
    enable("hangupButton");
});


easyRTC.setOnStreamClosed( function (caller) {
    easyRTC.setVideoObjectSrc(document.getElementById('callerAudio'), "");
    disable("hangupButton");
});

var puburl;
var slideshareurl;

easyRTC.setAcceptChecker(function(caller, cb) {
    console.log("Accept incoming call from " + caller + " ?");
    var url = 'http://'+location.hostname +":"+location.port+ "/p/" + caller + '/' + slideshareurl;
    console.log(url);
    puburl = url;

    var acceptTheCall = function(wasAccepted) {
        cb(wasAccepted);
    }
    acceptTheCall(true);
    console.log("I accepted a call!")
    showPresURL();
} );

$(document).ready(function () {
    $('.alert').hide();
    $('#ch-qrcode-form').hide();
    $('#ph-qrcode-form').hide();
    $('#new_present_form').submit(function (e) {
        e.preventDefault();
        var id = $('#slideshare_url').val();
        id = id.substring(id.indexOf('embed_code') + 10);
        id = id.substring(0, id.indexOf('"'));
        window.location = '/slideshare' + id;
    });

    silentConnect();
    console.log(selfEasyrtcid);
});

function slidesharesubpress() {
    var theyvegivenme = $('#slideshare_url').val();
    
    if (theyvegivenme == "")
        theyvegivenme = '/ashwan/meet-the-new-slideshare-embed';

    $.getJSON('/get-slideshare-id?slideshare_url='+theyvegivenme, function(data) {
        if (data.error) {
            $('#slideshare_url_control_group').addClass("error");
            $('#slideshare_url').val("Invalid url, try again");
        }else{
            $('#pres-url-form').fadeOut('slow', function() {
                $('#ch-qrcode-form').fadeIn('slow', function() {});
                slideshareurl = data.slideshare_id;
            });
        }
    });
}

function slideshareurlpress() {
    if ( $('#slideshare_url_control_group').hasClass("error") ) {
        $('#slideshare_url_control_group').removeClass("error");
        $('#slideshare_url').val("");
    }
}

function showPresURL() {
    $('#presurl').val(puburl);
    $('#ch-qrcode-form').fadeOut('slow', function() {
        $('#ph-qrcode-form').fadeIn('slow', function() {});
    });
}

function pressubpress() {
    console.log(puburl);
    open(puburl);
}

function createIframe(url){
    $('container').append('<iframe src="'+url+'"></iframe>');
}
