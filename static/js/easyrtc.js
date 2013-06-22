/** @class
 *@version 0.8.1 
 *<p>
 * Provides client side support for the easyRTC framework.
 * Please see the easyrtc_client_api.md and easyrtc_client_tutorial.md
 * for more details.</p>
 *
 *</p>
 *copyright Copyright (c) 2013, Priologic Software Inc.
 *All rights reserved.</p>
 *
 *<p>
 *Redistribution and use in source and binary forms, with or without
 *modification, are permitted provided that the following conditions are met:
 *</p>
 * <ul>
 *   <li> Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer. </li>
 *   <li> Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution. </li>
 *</ul>
 *<p>
 *THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 *LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 *CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 *SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 *CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *POSSIBILITY OF SUCH DAMAGE.
 *</p>
 */


var easyRTC = {};

/** Error codes that the easyRTC will use in the errCode field of error object passed
 *  to error handler set by easyRTC.setOnError. The error codes are short printable strings.
 * @type Dictionary.
 */
easyRTC.errCodes = {
    BAD_NAME: "BAD_NAME", // a user name wasn't of the desired form 
    DEVELOPER_ERR: "DEVELOPER_ERR", // the developer using the easyRTC library made a mistake
    SYSTEM_ERR: "SYSTEM_ERR", // probably an error related to the network
    CONNECT_ERR: "CONNECT_ERR", // error occured when trying to create a connection
    MEDIA_ERR: "MEDIA_ERR", // unable to get the local media
    MEDIA_WARNING: "MEDIA_WARNING", // didn't get the desired resolution
    INTERNAL_ERR: "INTERNAL_ERR",
    SIP_ERR: "SIP_ERR"  //something went wrong with a sip session 
};

easyRTC.apiVersion = "0.8.0";

/** Regular expression pattern for user ids. This will need modification to support non US character sets */
easyRTC.userNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,30}[a-zA-Z0-9]$/;

/** @private */
easyRTC.userName = null;

/** @private */
easyRTC.apiKey = "cmhslu5vo57rlocg"; // default key for now

/** @private */
easyRTC.loggingOut = false;

/** @private */
easyRTC.disconnecting = false;

/** @private */
easyRTC.localStream = null;

/** @private */
easyRTC.videoFeatures = true; // default video 

/** @private */
easyRTC.mozFakeStream = null; // used for setting up datachannels with firefox

/** @private */
easyRTC.audioEnabled = true;

/** @private */
easyRTC.videoEnabled = true;

/** @private */
easyRTC.datachannelName = "dc";

/** @private */
easyRTC.debugPrinter = null;

/** @private */
easyRTC.myEasyrtcid = "";

/** @private */
easyRTC.oldConfig = {};

/** @private */
easyRTC.offersPending = {};

easyRTC.sipUA = null;  // JSSIP user agent if SIP is supported.

/** The height of the local media stream video in pixels. This field is set an indeterminate period 
 * of time after easyRTC.initMedia succeeds.
 */
easyRTC.nativeVideoHeight = 0;

/** The width of the local media stream video in pixels. This field is set an indeterminate period 
 * of time after easyRTC.initMedia succeeds.
 */
easyRTC.nativeVideoWidth = 0;

/** @private */
easyRTC.apiKey = "cmhslu5vo57rlocg"; // default key for now

/* temporary hack */
/** @private
 * @param {string} referer */
easyRTC.setReferer = function(referer) {
    easyRTC.referer = referer;
};

/** The name user is in. This only applies to room oriented applications and is set at the same
 * time a token is received.
 */
easyRTC.room = null;

/** Checks if the supplied string is a valid user name (standard identifier rules)
 * @param {String} name
 * @return {Boolean} true for a valid user name
 * @example
 *    var name = document.getElementById('nameField').value;
 *    if( !easyRTC.isNameValid(name)) {
 *        alert("Bad user name");
 *    }
 */
easyRTC.isNameValid = function(name) {
    return easyRTC.userNamePattern.test(name);
};


/**
 * This function sets the name of the cookie that client side library will look for
 * and transmit back to the server as it's easyrtcsid in the first message.
 * @param {type} cookieId
 */
easyRTC.setCookieId = function(cookieId) {
    easyRTC.cookieId = cookieId;
};
/** This function is used to set the dimensions of the local camera, usually to get HD.
 *  If called, it must be called before calling easyRTC.initLocalMedia (explicitly or implicitly).
 *  assuming it is supported. If you don't pass any parameters, it will default to 720p dimensions.
 * @param {Number} width in pixels
 * @param {Number} height in pixels
 * @example
 *    easyRTC.setVideoDims(1280,720);
 * @example
 *    easyRTC.setVideoDims();
 */
easyRTC.setVideoDims = function(width, height) {
    if (!width) {
        width = 1280;
        height = 720;
    }

    easyRTC.videoFeatures = {
        mandatory: {
            minWidth: width,
            minHeight: height,
            maxWidth: width,
            maxHeight: height
        },
        optional: []
    };
};


/** This function requests that screen capturing be used to provide the local media source
 * rather than a webcam. If you have multiple screens, they are composited side by side.
 * @example
 *    easyRTC.setScreenCapture();
 */
easyRTC.setScreenCapture = function() {
    easyRTC.videoFeatures = {
        mandatory: {
            chromeMediaSource: "screen"
        },
        optional: []
    };
};

/** Set the API Key. The API key identifies the owner of the application. 
 *  The API key has no meaning for the Open Source server.
 * @param {String} key 
 * @example
 *      easyRTC.setApiKey('cmhslu5vo57rlocg');
 */
easyRTC.setApiKey = function(key) {
    easyRTC.apiKey = key;
};


/** Set the application name. Applications can only communicate with other applications
 * that share the sname API Key and application name. There is no predefined set of application
 * names. Maximum length is
 * @param {String} name
 * @example
 *    easyRTC.setApplicationName('simpleAudioVideo');
 */
easyRTC.setApplicationName = function(name) {
    easyRTC.applicationName = name;
};



/** Setup the JsSIP User agent.
 * 
 * @param {type} connectConfig is a dictionary that contains the following fields: { ws_servers, uri, password }
 * @returns {undefined}
 */
easyRTC.setSipConfig = function(connectConfig)
{
    easyRTC.sipConfig = connectConfig ? JSON.parse(JSON.stringify(connectConfig)) : null;
};



/** Enable or disable logging to the console. 
 * Note: if you want to control the printing of debug messages, override the
 *    easyRTC.debugPrinter variable with a function that takes a message string as it's argument.
 *    This is exactly what easyRTC.enableDebug does when it's enable argument is true.
 * @param {Boolean} enable - true to turn on debugging, false to turn off debugging. Default is false.
 * @example
 *    easyRTC.enableDebug(true);  
 */
easyRTC.enableDebug = function(enable) {
    if (enable) {
        easyRTC.debugPrinter = function(message) {
            var stackString = new Error().stack;
            var srcLine = "location unknown";
            if (stackString) {
                var stackFrameStrings = new Error().stack.split('\n');
                srcLine = "";
                if (stackFrameStrings.length >= 3) {
                    srcLine = stackFrameStrings[2];
                }
            }
            console.log("debug " + (new Date()).toISOString() + " : " + message + " [" + srcLine + "]");
        };
    }
    else {
        easyRTC.debugPrinter = null;
    }
};


/**
 * Determines if the local browser supports WebRTC GetUserMedia (access to camera and microphone).
 * @returns {Boolean} True getUserMedia is supported.
 */
easyRTC.supportsGetUserMedia = function() {
    return (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia) ? true : false;
};

/**
 * Determines if the local browser supports WebRTC Peer connections to the extent of being able to do video chats.
 * @returns {Boolean} True if Peer connections are supported.
 */
easyRTC.supportsPeerConnection = function() {
    if (!easyRTC.supportsGetUserMedia()) {
        return false;
    }
    if (!(window.mozRTCPeerConnection || window.webkitRTCPeerConnection ||
            window.RTCPeerConnection)) {
        return false;
    }
    try {
        easyRTC.createRTCPeerConnection({"iceServers": []}, null);
    } catch (oops) {
        return false;
    }
    return true;
};


/** @private
 * @param pc_config ice configuration array
 * @param optionalStuff peer constraints.
 */
easyRTC.createRTCPeerConnection = function(pc_config, optionalStuff) {

    if (window.mozRTCPeerConnection) {
        return new mozRTCPeerConnection(pc_config, optionalStuff);
    }
    else if (window.webkitRTCPeerConnection) {
        return new webkitRTCPeerConnection(pc_config, optionalStuff);
    }
    else if (window.RTCPeerConnection) {
        return new RTCPeerConnection(pc_config, optionalStuff);
    }
    else {
        throw "Your browser doesn't support webRTC (RTCPeerConnection)";
    }
};

//
// 
//
if (navigator.mozGetUserMedia) {
    easyRTC.datachannelConstraints = {};
}
else {
    easyRTC.datachannelConstraints = {
        reliable: false
    };
}
/** @private */
easyRTC.haveAudioVideo = {
    audio: false,
    video: false
};

/** @private */
easyRTC.dataEnabled = false;
/** @private */
easyRTC.serverPath = null;
/** @private */
easyRTC.loggedInListener = null;
/** @private */
easyRTC.onDataChannelOpen = null;
/** @private */
easyRTC.onDataChannelClose = null;
/** @private */
easyRTC.lastLoggedInList = {};
/** @private */
easyRTC.receiveDataCB = null;
/** @private */
easyRTC.appDefinedFields = {};

/** @private */
easyRTC.updateConfigurationInfo = function() {
};  // dummy placeholder for when we aren't connected
//
//
//  easyRTC.peerConns is a map from caller names to the below object structure
//     {  startedAV: boolean,  -- true if we have traded audio/video streams
//        dataChannel: RTPDataChannel if present
//        dataChannelRead: true if the data channel can be used for sending yet
//        connectTime: timestamp when the connection was started
//        sharingAudio: true if audio is being shared
//        sharingVideo: true if video is being shared
//        cancelled: temporarily true if a connection was cancelled by the peer asking to initiate it.
//        candidatesToSend: SDP candidates temporarily queued 
//        pc: RTCPeerConnection
//        mediaStream: mediaStream
//	  function callSuccessCB(string) - see the easyRTC.call documentation.
//        function callFailureCB(string) - see the easyRTC.call documentation.
//        function wasAcceptedCB(boolean,string) - see the easyRTC.call documentation.
//     }
//
/** @private */
easyRTC.peerConns = {};

//
// a map keeping track of whom we've requested a call with so we don't try to 
// call them a second time before they've responded.
//
/** @private */
easyRTC.acceptancePending = {};


/* 
 * the maximum length of the appDefinedFields. This is defined on the
 * server side as well, so changing it here alone is insufficient.
 */
/** @private */
var maxAppDefinedFieldsLength = 128;

/**
 * Disconnect from the easyRTC server.
 */
easyRTC.disconnect = function() {
};

/** @private
 * @param caller
 * @param helper
 */
easyRTC.acceptCheck = function(caller, helper) {
    helper(true);
};

/** @private
 * @param easyrtcid
 * @param stream
 */
easyRTC.streamAcceptor = function(easyrtcid, stream) {
};

/** @private
 * @param easyrtcid
 */
easyRTC.onStreamClosed = function(easyrtcid) {
};

/** @private
 * @param easyrtcid
 */
easyRTC.callCancelled = function(easyrtcid) {
};

/** Provide a set of application defined fields that will be part of this instances
 * configuration information. This data will get sent to other peers via the websocket
 * path. 
 * @param {type} fields just be JSON serializable to a length of not more than 128 bytes.
 * @example 
 *   easyRTC.setAppDefinedFields( { favorite_alien:'Mr Spock'});
 *   easyRTC.setLoggedInListener( function(list) {
 *      for( var i in list ) {
 *         console.log("easyrtcid=" + i + " favorite alien is " + list[i].appDefinedFields.favorite_alien);
 *      }
 *   });
 */
easyRTC.setAppDefinedFields = function(fields) {
    var fieldAsString = JSON.stringify(fields);
    if (JSON.stringify(fieldAsString).length <= 128) {
        easyRTC.appDefinedFields = JSON.parse(fieldAsString);
        easyRTC.updateConfigurationInfo();
    }
    else {
        alert("Developer error: your appDefinedFields were too big");
    }
};

/** Default error reporting function. The default implementation displays error messages
 *  in a programatically created div with the id easyRTCErrorDialog. The div has title
 *  component with a classname of easyRTCErrorDialog_title. The error messages get added to a
 *  container with the id easyRTCErrorDialog_body. Each error message is a text node inside a div
 *  with a class of easyRTCErrorDialog_element. There is an "okay" button with the className of easyRTCErrorDialog_okayButton.
 *  @param {String} messageCode An error message code
 *  @param {String} message the error message text without any markup.
 *  @example
 *      easyRTC.showError("BAD_NAME", "Invalid username");
 */
easyRTC.showError = function(messageCode, message) {
    easyRTC.onError({errCode: messageCode, errText: message});
};

/** @private 
 * @param errorObject
 */
easyRTC.onError = function(errorObject) {
    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("saw error " + errorObject.errText);
    }
    var errorDiv = document.getElementById('easyRTCErrorDialog');
    var errorBody;
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = 'easyRTCErrorDialog';

        var title = document.createElement("div");
        title.innerHTML = "Error messages";
        title.className = "easyRTCErrorDialog_title";
        errorDiv.appendChild(title);

        errorBody = document.createElement("div");
        errorBody.id = "easyRTCErrorDialog_body";
        errorDiv.appendChild(errorBody);

        var clearButton = document.createElement("button");
        clearButton.appendChild(document.createTextNode("Okay"));
        clearButton.className = "easyRTCErrorDialog_okayButton";
        clearButton.onclick = function() {
            errorBody.innerHTML = ""; // remove all inner nodes
            errorDiv.style.display = "none";
        };
        errorDiv.appendChild(clearButton);
        document.body.appendChild(errorDiv);
    }
    ;

    errorBody = document.getElementById("easyRTCErrorDialog_body");
    var messageNode = document.createElement("div");

    messageNode.className = 'easyRTCErrorDialog_element';
    messageNode.appendChild(document.createTextNode(errorObject.errText));
    errorBody.appendChild(messageNode);

    errorDiv.style.display = "block";
};


//
// add the style sheet to the head of the document. That way, developers
// can overide it.
//
(function() {
    //
    // check to see if we already have an easyrtc.css file loaded
    // if we do, we can exit immediately.
    //
    var links = document.getElementsByTagName("link");

    for (var cssindex in links) {
        var css = links[cssindex];
        if (css.href && (css.href.match("\/easyrtc.css") || css.href.match("\/easyrtc.css\?"))) {
            return;
        }
    }
    //
    // add the easyrtc.css file since it isn't present
    //
    var easySheet = document.createElement("link");
    easySheet.setAttribute("rel", "stylesheet");
    easySheet.setAttribute("type", "text/css");
    easySheet.setAttribute("href", "/css/easyrtc.css");
    var headSection = document.getElementsByTagName("head")[0];
    var firstHead = headSection.childNodes[0];
    headSection.insertBefore(easySheet, firstHead);
})();

/** @private */
easyRTC.videoBandwidthString = "b=AS:50"; // default video band width is 50kbps

//
// easyRTC.createObjectURL builds a URL from a media stream.
// Arguments:
//     mediaStream - a media stream object.
// The video object in Chrome expects a URL.
//
/** @private 
 * @param mediaStream */
easyRTC.createObjectURL = function(mediaStream) {
    if (window.URL && window.URL.createObjectURL) {
        return window.URL.createObjectURL(mediaStream);
    }
    else if (window.webkitURL && window.webkitURL.createObjectURL) {
        return window.webkit.createObjectURL(mediaStream);
    }
    else {
        var errMessage = "Your browsers does not support URL.createObjectURL.";
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("saw exception " + errMessage);
        }
        throw errMessage;
    }
};


/**
 * A convenience function to ensure that a string doesn't have symbols that will be interpreted by HTML.
 * @param {String} idString
 * @return {String}
 * @example
 *     console.log( easyRTC.cleanId('&hello'));
 */
easyRTC.cleanId = function(idString) {
    var MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    return idString.replace(/[&<>]/g, function(c) {
        return MAP[c];
    });
};




/** Set the callback that will be invoked when the list of people logged in changes.
 * The callback expects to receive a map whose ideas are easyrtcids and whose values are in turn maps
 * supplying user specific information. The inner maps have the following keys:
 *  userName, applicationName, browserFamily, browserMajor, osFamily, osMajor, deviceFamily.
 * @param {Function} listener
 * @example
 *   easyRTC.setLoggedInListener( function(list) {
 *      for( var i in list ) {
 *         ("easyrtcid=" + i + " belongs to user " + list[i].userName);
 *      }
 *   });
 */
easyRTC.setLoggedInListener = function(listener) {
    easyRTC.loggedInListener = listener;
};



/**
 * Sets a callback that is called when a data channel is open and ready to send data.
 * The callback will be called with an easyrtcid as it's sole argument.
 * @param {Function} listener
 * @example
 *    easyRTC.setDataChannelOpenListener( function(easyrtcid) {
 *         easyRTC.sendDataP2P(easyrtcid, "hello");
 *    });
 */
easyRTC.setDataChannelOpenListener = function(listener) {
    easyRTC.onDataChannelOpen = listener;
};


/** Sets a callback that is called when a previously open data channel closes.
 * The callback will be called with an easyrtcid as it's sole argument.
 * @param {Function} listener
 * @example
 *    easyRTC.setDataChannelCloseListener( function(easyrtcid) {
 *            ("No longer connected to " + easyRTC.idToName(easyrtcid));       
 *    });
 */
easyRTC.setDataChannelCloseListener = function(listener) {
    easyRTC.onDataChannelClose = listener;
};

/** Returns the number of live peer connections the client has.
 * @return {Number}
 * @example
 *    ("You have " + easyRTC.getConnectionCount() + " peer connections");
 */
easyRTC.getConnectionCount = function() {
    var count = 0;
    for (var i in easyRTC.peerConns) {
        if (easyRTC.peerConns[i].startedAV) {
            count++;
        }
    }
    return count;
};


/** Sets whether audio is transmitted by the local user in any subsequent calls.
 * @param {Boolean} enabled true to include audio, false to exclude audio. The default is true.
 * @example
 *      easyRTC.enableAudio(false);
 */
easyRTC.enableAudio = function(enabled) {
    easyRTC.audioEnabled = enabled;
};


/**
 *Sets whether video is transmitted by the local user in any subsequent calls.
 * @param {Boolean} enabled - true to include video, false to exclude video. The default is true.
 * @example
 *      easyRTC.enableVideo(false);
 */
easyRTC.enableVideo = function(enabled) {
    easyRTC.videoEnabled = enabled;
};


/**
 * Sets whether webrtc data channels are used to send inter-client messages.
 * This is only the messages that applications explicitly send to other applications, not the webrtc signalling messages.
 * @param {Boolean} enabled  true to use data channels, false otherwise. The default is false.
 * @example
 *     easyRTC.enableDataChannels(true);
 */
easyRTC.enableDataChannels = function(enabled) {
    easyRTC.dataEnabled = enabled;
};


/**
 * Returns a URL for your local camera and microphone.
 *  It can be called only after easyRTC.initMediaSource has succeeded.
 *  It returns a url that can be used as a source by the chrome video element or the &lt;canvas&gt; element.
 *  @return {URL}
 *  @example
 *      document.getElementById("myVideo").src = easyRTC.getLocalStreamAsUrl();
 */
easyRTC.getLocalStreamAsUrl = function() {
    if (easyRTC.localStream === null) {
        alert("Developer error: attempt to get a mediastream without invoking easyRTC.initMediaSource successfully");
    }
    return easyRTC.createObjectURL(easyRTC.localStream);
};


/**
 * Returns a media stream for your local camera and microphone.
 *  It can be called only after easyRTC.initMediaSource has succeeded.
 *  It returns a stream that can be used as an argument to easyRTC.setVideoObjectSrc.
 * @return {MediaStream}
 * @example
 *    easyRTC.setVideoObjectSrc( document.getElementById("myVideo"), easyRTC.getLocalStream());    
 */
easyRTC.getLocalStream = function() {
    return easyRTC.localStream;
};


/**
 *  Sets a video or audio object from a media stream.
 *  Chrome uses the src attribute and expects a URL, while firefox
 *  uses the mozSrcObject and expects a stream. This procedure hides
 *  that from you.
 *  If the media stream is from a local webcam, you may want to add the 
 *  easyRTCMirror class to the video object so it looks like a proper mirror.
 *  The easyRTCMirror class is defined in easyrtc.css, which is automatically added
 *  when you add the easyrtc.js file to an HTML file.
 *  @param {DOMObject} videoObject an HTML5 video object 
 *  @param {MediaStream} stream a media stream as returned by easyRTC.getLocalStream or your stream acceptor.
 * @example
 *    easyRTC.setVideoObjectSrc( document.getElementById("myVideo"), easyRTC.getLocalStream());    
 *     
 */
easyRTC.setVideoObjectSrc = function(videoObject, stream) {

    if (stream) {
        videoObject.autoplay = true;
    }

    if (typeof videoObject.mozSrcObject !== "undefined") {
        videoObject.mozSrcObject = (stream === "") ? null : stream;
    }
    else {
        videoObject.src = (stream === "") ? "" : easyRTC.createObjectURL(stream);
    }
    if (stream) {
        videoObject.play();
    }
};

/** @private
 * @param {String} x */
easyRTC.formatError = function(x) {
    if (x === null || typeof x === 'undefined') {
        message = "null";
    }
    if (typeof x === 'string') {
        return x;
    }
    else if (x.type && x.description) {
        return x.type + " : " + x.description;
    }
    else if (typeof x === 'object') {
        try {
            return JSON.stringify(x);
        }
        catch (oops) {
            var result = "{";
            for (var name in x) {
                if (typeof x[name] === 'string') {
                    result = result + name + "='" + x[name] + "' ";
                }
            }
            result = result + "}";
            return result;
        }
    }
    else {
        return "Strange case";
    }
};




/** Initializes your access to a local camera and microphone.
 *  Failure could be caused a browser that didn't support webrtc, or by the user
 * not granting permission.
 * If you are going to call easyRTC.enableAudio or easyRTC.enableVideo, you need to do it before
 * calling easyRTC.initMediaSource. 
 * @param {Function} successCallback - will be called when the media source is ready.
 * @param {Function} errorCallback - is called with a message string if the attempt to get media failed.
 * @example
 *       easyRTC.initMediaSource(
 *          function() { 
 *              easyRTC.setVideoObjectSrc( document.getElementById("mirrorVideo"), easyRTC.getLocalStream()); 
 *          },
 *          function() {
 *               easyRTC.showError("no-media", "Unable to get local media");
 *          });
 *          
 */
easyRTC.initMediaSource = function(successCallback, errorCallback) {

    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("about to request local media");
    }

    if (errorCallback === null) {
        errorCallback = function(x) {
            var message = "easyRTC.initMediaSource: " + easyRTC.formatError(x);
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter(message);
            }
            easyRTC.showError("no-media", message);
        };
    }

    if (!successCallback) {
        alert("easyRTC.initMediaSource not supplied a successCallback");
        return;
    }

    /** @private
     * @param {String} mode
     * @param {Function} successfunc
     * @param {Function} errorFunc */
    function callGetUserMedia(mode, successfunc, errorFunc) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("about to request local media = " + JSON.stringify(mode));
        }

        if (navigator.getUserMedia) {
            navigator.getUserMedia(mode, successfunc, errorFunc);
        }
        else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia(mode, successfunc, errorFunc);
        }
        else if (navigator.mozGetUserMedia) {
            navigator.mozGetUserMedia(mode, successfunc, errorFunc);
        }
        else {
            errorCallback("Your browser doesn't appear to support WebRTC.");
        }
    }




    /** @private
     * @param {Stream} stream
     *  */
    var onUserMediaSuccess = function(stream) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("getUserMedia success callback entered");
        }
        // the below commented out checks were for Chrome. However, Mozilla nightly started 
        // implementing the getAudioTracks method as well, except their implementation appears to 
        // be asychronous, the audioTracks.length are zero initially and filled later.
        // 
//        if (easyRTC.audioEnabled && stream.getAudioTracks) {
//            var audioTracks = stream.getAudioTracks();
//            if (!audioTracks || audioTracks.length === 0) {
//                errorCallback("The application requested audio but the system didn't supply it");
//                return;
//            }
//        }
//        if (easyRTC.videoEnabled && stream.getVideoTracks) {
//            var videoTracks = stream.getVideoTracks();
//            if (!videoTracks || videoTracks.length === 0) {
//                errorCallback("The application requested video but the system didn't supply it");
//                return;
//            }
//        }

        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("successfully got local media");
        }
        easyRTC.localStream = stream;
        if (easyRTC.haveAudioVideo.video) {
            var videoObj = document.createElement('video');
            videoObj.muted = true;

            var triesLeft = 30;
            var tryToGetSize = function() {
                if (videoObj.videoWidth > 0 || triesLeft < 0) {
                    easyRTC.nativeVideoWidth = videoObj.videoWidth;
                    easyRTC.nativeVideoHeight = videoObj.videoHeight;
                    if (easyRTC.videoFeatures.mandatory &&
                            easyRTC.videoFeatures.mandatory.minHeight &&
                            (easyRTC.nativeVideoHeight != easyRTC.videoFeatures.mandatory.minHeight ||
                                    easyRTC.nativeVideoWidth != easyRTC.videoFeatures.mandatory.minWidth)) {
                        easyRTC.showError(easyRTC.errCodes.MEDIA_WARNING,
                                "requested video size of " + easyRTC.videoFeatures.mandatory.minWidth + "x" + easyRTC.videoFeatures.mandatory.minHeight +
                                " but got size of " + easyRTC.nativeVideoWidth + "x" + easyRTC.nativeVideoHeight);
                    }
                    easyRTC.setVideoObjectSrc(videoObj, "");
                    if (videoObj.removeNode) {
                        videoObj.removeNode(true);
                    }
                    else {
                        var ele = document.createElement('div');
                        ele.appendChild(videoObj);
                        ele.removeChild(videoObj);
                    }

                    // easyRTC.updateConfigurationInfo();
                    if (successCallback) {
                        successCallback();
                    }
                }
                else {
                    triesLeft -= 1;
                    setTimeout(tryToGetSize, 100);
                }
            };
            easyRTC.setVideoObjectSrc(videoObj, stream);
            tryToGetSize();
        }
        else {
            easyRTC.updateConfigurationInfo();
            if (successCallback) {
                successCallback();
            }
        }
    };

    /** @private
     * @param {String} error
     */
    var onUserMediaError = function(error) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("failed to get local media");
        }
        if (errorCallback) {
            errorCallback("Failed to get access to local media. Error code was " + error.code + ".");
        }
        easyRTC.localStream = null;
        easyRTC.haveAudioVideo = {
            audio: false,
            video: false
        };
        easyRTC.updateConfigurationInfo();
    };


    if (!easyRTC.audioEnabled && !easyRTC.videoEnabled) {
        onUserMediaError("At least one of audio and video must be provided");
        return;
    }

    /** @private */
    easyRTC.haveAudioVideo = {
        audio: easyRTC.audioEnabled,
        video: easyRTC.videoEnabled
    };



    if (easyRTC.videoEnabled || easyRTC.audioEnabled) {
        try {
            callGetUserMedia({
                'audio': easyRTC.audioEnabled ? true : false,
                'video': (easyRTC.videoEnabled) ? (easyRTC.videoFeatures) : false
            }, onUserMediaSuccess,
                    onUserMediaError);
        } catch (e) {
            try {

                callGetUserMedia("video,audio", onUserMediaSuccess,
                        onUserMediaError);
            } catch (e) {
                document.body.removeChild(getUserMediaDiv);
                errorCallback("getUserMedia failed with exception: " + e.message);
            }
        }
    }
    else {
        onUserMediaSuccess(null);
    }
};


/**
 * easyRTC.setAcceptChecker sets the callback used to decide whether to accept or reject an incoming call.
 * @param {Function} acceptCheck takes the arguments (callerEasyrtcid, function():boolean ) {}
 * The acceptCheck callback is passed (as it's second argument) a function that should be called with either
 * a true value (accept the call) or false value( reject the call).
 * @example
 *      easyRTC.setAcceptChecker( function(easyrtcid, acceptor) {
 *           if( easyRTC.idToName(easyrtcid) === 'Fred' ) {
 *              acceptor(true);
 *           }
 *           else if( easyRTC.idToName(easyrtcid) === 'Barney' ) {
 *              setTimeout( function() {  acceptor(true)}, 10000);
 *           }
 *           else {
 *              acceptor(false);
 *           }
 *      });
 */
easyRTC.setAcceptChecker = function(acceptCheck) {
    easyRTC.acceptCheck = acceptCheck;
};


/**
 * easyRTC.setStreamAcceptor sets a callback to receive media streams from other peers, independent
 * of where the call was initiated (caller or callee).
 * @param {Function} acceptor takes arguments (caller, mediaStream)
 * @example
 *  easyRTC.setStreamAcceptor(function(easyrtcid, stream) {
 *     document.getElementById('callerName').innerHTML = easyRTC.idToName(easyrtcid);
 *     easyRTC.setVideoObjectSrc( document.getElementById("callerVideo"), stream); 
 *  });
 */
easyRTC.setStreamAcceptor = function(acceptor) {
    easyRTC.streamAcceptor = acceptor;
};


/** Sets the easyRTC.onError field to a user specified function.
 * @param {Function} errListener takes an object of the form { errCode: String, errText: String}
 * @example
 *    easyRTC.setOnError( function(errorObject) {
 *        document.getElementById("errMessageDiv").innerHTML += errorObject.errText;
 *    });
 */
easyRTC.setOnError = function(errListener) {
    easyRTC.onError = errListener;
};


/**
 * Sets the callCancelled callback. This will be called when a remote user 
 * initiates a call to you, but does a "hangup" before you have a chance to get his video stream.
 * @param {Function} callCancelled takes an easyrtcid as an argument and a boolean that indicates whether
 *  the call was explicitly cancelled remotely (true), or actually accepted by the user attempting a call to 
 *  the same party.
 * @example
 *     easyRTC.setCallCancelled( function(easyrtcid, explicitlyCancelled) {
 *        if( explicitlyCancelled ) {
 *            console..log(easyrtc.idToName(easyrtcid) + " stopped trying to reach you");
 *         }
 *         else {
 *            console.log("Implicitly called "  + easyrtc.idToName(easyrtcid));
 *         }
 *     });
 */
easyRTC.setCallCancelled = function(callCancelled) {
    easyRTC.callCancelled = callCancelled;
};

/**  Sets a callback to receive notification of a media stream closing. The usual
 *  use of this is to clear the source of your video object so you aren't left with 
 *  the last frame of the video displayed on it.
 *  @param {Function} onStreamClosed takes an easyrtcid as it's first parameter.
 *  @example
 *     easyRTC.setOnStreamClosed( function(easyrtcid) {
 *         easyRTC.setVideoObjectSrc( document.getElementById("callerVideo"), "");
 *         ( easyRTC.idToName(easyrtcid) + " went away");
 *     });
 */
easyRTC.setOnStreamClosed = function(onStreamClosed) {
    easyRTC.onStreamClosed = onStreamClosed;
};


/**
 * Sets the bandwidth for sending video data.
 * Setting the rate too low will cause connection attempts to fail. 40 is probably good lower limit.
 * The default is 50. A value of zero will remove bandwidth limits.
 * @param {Number} kbitsPerSecond is rate in kilobits per second.
 * @example
 *    easyRTC.setVideoBandwidth( 40);
 */
easyRTC.setVideoBandwidth = function(kbitsPerSecond) {
    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("video bandwidth set to " + kbitsPerSecond + " kbps");
    }
    if (kbitsPerSecond > 0) {
        easyRTC.videoBandwidthString = "b=AS:" + kbitsPerSecond;
    }
    else {
        easyRTC.videoBandwidthString = "";
    }
};


/**
 * Sets a listener for data sent from another client (either peer to peer or via websockets).
 * @param {Function} listener has the signature (easyrtcid, data)
 * @example
 *     easyRTC.setDataListener( function(easyrtcid, data) {
 *         ("From " + easyRTC.idToName(easyrtcid) + 
 *             " sent the follow data " + JSON.stringify(data));
 *     });
 */
easyRTC.setDataListener = function(listener) {
    easyRTC.receiveDataCB = listener;
};


/**
 * Sets the url of the Socket server.
 * The node.js server is great as a socket server, but it doesn't have
 * all the hooks you'd like in a general web server, like PHP or Python
 * plug-ins. By setting the serverPath your application can get it's regular
 * pages from a regular webserver, but the easyRTC library can still reach the
 * socket server.
 * @param {DOMString} socketUrl
 * @example
 *     easyRTC.setSocketUrl(":8080");
 */
easyRTC.setSocketUrl = function(socketUrl) {
    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("webrtc signaling server URL set to " + socketUrl);
    }
    easyRTC.serverPath = socketUrl;
};

/** 
 * Sets the user name associated with the connection.
 * @param {String} userName must obey standard identifier conventions.
 * @returns {Boolean} true if the call succeeded, false if the username was invalid.
 * @example
 *    if ( !easyRTC.setUserName("JohnSmith") ) {
 *        alert("bad user name);
 *    
 */
easyRTC.setUserName = function(userName) {
    if (easyRTC.isNameValid(userName)) {
        easyRTC.userName = userName;
        return true;
    }
    else {
        easyRTC.showError(easyRTC.errCodes.BAD_NAME, "Illegal username " + userName);
        return false;
    }
};

/**
 * Sets the listener for socket disconnection by external (to the API) reasons.
 * @param {Function} disconnectListener takes no arguments and is not called as a result of calling easyRTC.disconnect.
 * @example
 *    easyRTC.setDisconnectListener(function() {
 *        easyRTC.showError("SYSTEM-ERROR", "Lost our connection to the socket server");
 *    });
 */
easyRTC.setDisconnectListener = function(disconnectListener) {
    easyRTC.disconnectListener = disconnectListener;
};



/**
 * Convert an easyrtcid to a user name. This is useful for labelling buttons and messages
 * regarding peers.
 * @param {String} easyrtcid
 * @return {String}
 * @example
 *    console.log(easyrtcid + " is actually " + easyRTC.idToName(easyrtcid));
 */
easyRTC.idToName = function(easyrtcid) {
    if (easyRTC.lastLoggedInList) {
        if (easyRTC.lastLoggedInList[easyrtcid]) {
            if (easyRTC.lastLoggedInList[easyrtcid].userName) {
                return easyRTC.lastLoggedInList[easyrtcid].userName;
            }
            else {
                return easyrtcid;
            }
        }
    }
    return "--" + easyrtcid + "--";
};



/* used in easyRTC.connect */
/** @private */
easyRTC.webSocket = null;
/** @private  */
easyRTC.pc_config = {};
/** @private  */
easyRTC.closedChannel = null;

/**
 * easyRTC.connect(args) performs the connection to the server. You must connect before trying to
 * call other users.
 * @param {String} applicationName is a string that identifies the application so that different applications can have different
 *        lists of users.
 * @param {Function} successCallback (actualName, cookieOwner) - is called on successful connect. actualName is guaranteed to be unique.
 *       cookieOwner is true if the server sent back a isOwner:true field in response to a cookie.
 * @param {Function} errorCallback (msgString) - is called on unsuccessful connect. if null, an alert is called instead.
 */
easyRTC.connect = function(applicationName, successCallback, errorCallback) {
    easyRTC.webSocket = null;
    easyRTC.pc_config = {};
    easyRTC.closedChannel = null;


    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("attempt to connect to webrtc signalling server with application name=" + applicationName);
    }
    var mediaConstraints = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        },
        'optional': [{
                RtpDataChannels: easyRTC.dataEnabled
            }]
    };

    //
    // easyRTC.disconnect performs a clean disconnection of the client from the server.
    //
    easyRTC.disconnectBody = function() {
        easyRTC.loggingOut = true;
        easyRTC.disconnecting = true;
        easyRTC.closedChannel = easyRTC.webSocket;
        if (easyRTC.webSocket) {
            easyRTC.webSocket.disconnect();
        }
        easyRTC.webSocket = 0;
        easyRTC.hangupAll();
        if (easyRTC.loggedInListener) {
            easyRTC.loggedInListener({});
        }
        easyRTC.loggingOut = false;
        easyRTC.disconnecting = false;
        easyRTC.oldConfig = {};
    };

    easyRTC.disconnect = function() {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("attempt to disconnect from webrtc signalling server");
        }


        easyRTC.disconnecting = true;
        easyRTC.hangupAll();
        easyRTC.loggingOut = true;
        // 
        // The hangupAll may try to send configuration information back to the server.
        // Collecting that information is asynchronous, we don't actually close the 
        // connection until it's had a chance to be sent. We allocate 100ms for collecting
        // the info, so 250ms should be sufficient for the disconnecting.
        // 
        setTimeout(function() {
            if (easyRTC.webSocket) {
                try {
                    easyRTC.webSocket.disconnect();
                } catch (e) {
                    // we don't really care if this fails. 
                }
                ;
                easyRTC.closedChannel = easyRTC.webSocket;
                easyRTC.webSocket = 0;

            }
            easyRTC.loggingOut = false;
            easyRTC.disconnecting = false;
            if (easyRTC.loggedInListener) {
                easyRTC.loggedInListener({});
            }
            easyRTC.oldConfig = {};
        }, 250);
    };



    if (errorCallback === null) {
        errorCallback = function(x) {
            alert("easyRTC.connect: " + x);
        };
    }

    var sendMessage = function(destUser, instruction, data, successCallback, errorCallback) {

        if (!easyRTC.webSocket) {
            throw "Attempt to send message without a valid connection to the server."
        }
        else {
            var dataToShip = {
                msgType: instruction,
                senderId: easyRTC.myEasyrtcid,
                targetId: destUser,
                msgData: {
                    from: easyRTC.myEasyrtcid,
                    type: instruction,
                    actualData: data
                }
            };

            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("sending socket message " + JSON.stringify(dataToShip));
            }
            easyRTC.webSocket.json.emit("easyRTCcmd", dataToShip);
        }
    };



    /**
     *Sends data to another user using previously established data channel. This method will
     * fail if no data channel has been established yet. Unlike the easyRTC.sendWS method, 
     * you can't send a dictionary, convert dictionaries to strings using JSON.stringify first. 
     * What datatypes you can send, and how large a datatype depends on your browser.
     * @param {String} destUser (an easyrtcid)
     * @param {Object} data - an object which can be JSON'ed.
     * @example
     *     easyRTC.sendDataP2P(someEasyrtcid, {room:499, bldgNum:'asd'});
     */
    easyRTC.sendDataP2P = function(destUser, data) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("sending p2p message to " + destUser + " with data=" + JSON.stringify(data));
        }

        if (!easyRTC.peerConns[destUser]) {
            easyRTC.showError(easyRTC.errCodes.DEVELOPER_ERR, "Attempt to send data peer to peer without a connection to " + destUser + ' first.');
        }
        else if (!easyRTC.peerConns[destUser].dataChannel) {
            easyRTC.showError(easyRTC.errCodes.DEVELOPER_ERR, "Attempt to send data peer to peer without establishing a data channel to " + destUser + ' first.');
        }
        else if (!easyRTC.peerConns[destUser].dataChannelReady) {
            easyRTC.showError(easyRTC.errCodes.DEVELOPER_ERR, "Attempt to use data channel to " + destUser + " before it's ready to send.");
        }
        else {
            var flattenedData = JSON.stringify(data);
            easyRTC.peerConns[destUser].dataChannel.send(flattenedData);
        }
    };


    /** Sends data to another user using websockets.
     * @param {String} destUser (an easyrtcid)
     * @param {String} data - an object which can be JSON'ed.
     * @example 
     *    easyRTC.sendDataWS(someEasyrtcid, {room:499, bldgNum:'asd'});
     */
    easyRTC.sendDataWS = function(destUser, data) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("sending client message via websockets to " + destUser + " with data=" + JSON.stringify(data));
        }
        if (easyRTC.webSocket) {
            easyRTC.webSocket.json.emit("message", {
                senderId: easyRTC.myEasyrtcid,
                targetId: destUser,
                msgData: data
            });
        }
        else {
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("websocket failed because no connection to server");
            }
            throw "Attempt to send message without a valid connection to the server.";
        }
    };


    /** Sends data to another user. This method uses datachannels if one has been set up, or websockets otherwise.
     * @param {String} destUser (an easyrtcid)
     * @param {String} data - an object which can be JSON'ed.
     * @example 
     *    easyRTC.sendData(someEasyrtcid, {room:499, bldgNum:'asd'});
     */
    easyRTC.sendData = function(destUser, data) {
        if (easyRTC.peerConns[destUser] && easyRTC.peerConns[destUser].dataChannelReady) {
            easyRTC.sendDataP2P(destUser, data);
        }
        else {
            easyRTC.sendDataWS(destUser, data);
        }
    };


    function haveTracks(easyrtcid, checkAudio) {
        var peerConnObj = easyRTC.peerConns[easyrtcid];
        if (!peerConnObj) {
            return true;
        }
        var stream = peerConnObj.stream;
        if (!stream) {
            return false;
        }

        var tracks;
        try {
            if (checkAudio) {
                tracks = stream.getAudioTracks();
            }
            else {
                tracks = stream.getVideoTracks();
            }
        } catch (oops) {
            return true;
        }
        if (!tracks)
            return false;
        return tracks.length > 0;
    }

    /** Determines if a particular peer2peer connection has an audio track.
     * @param easyrtcid - the id of the other caller in the connection.
     * @return {boolean} 
     */
    easyRTC.haveAudioTrack = function(easyrtcid) {
        return haveTracks(easyrtcid, true);
    };


    /** Determines if a particular peer2peer connection has a video track.
     * @param easyrtcid - the id of the other caller in the connection.
     * @return {string} "yes", "no", "unknown"
     */
    easyRTC.haveVideoTrack = function(easyrtcid) {
        return haveTracks(easyrtcid, false);
    };


    /** Value returned by easyRTC.getConnectStatus if the other user isn't connected. */
    easyRTC.NOT_CONNECTED = "not connected";

    /** Value returned by easyRTC.getConnectStatus if the other user is in the process of getting connected */
    easyRTC.BECOMING_CONNECTED = "connection in progress";

    /** Value returned by easyRTC.getConnectStatus if the other user is connected. */
    easyRTC.IS_CONNECTED = "is connected";

    /**
     * Return true if the client has a peer-2-peer connection to another user.
     * The return values are text strings so you can use them in debugging output.
     *  @param {String} otherUser - the easyrtcid of the other user.
     *  @return {String} one of the following values: easyRTC.NOT_CONNECTED, easyRTC.BECOMING_CONNECTED, easyRTC.IS_CONNECTED
     *  @example
     *     if( easyRTC.getConnectStatus(otherEasyrtcid) == easyRTC.NOT_CONNECTED ) {
     *         easyRTC.connect(otherEasyrtcid, 
     *                  function() { console.log("success"); },
     *                  function() { console.log("failure"); });
     *     }
     */
    easyRTC.getConnectStatus = function(otherUser) {
        if (typeof easyRTC.peerConns[otherUser] === 'undefined') {
            return easyRTC.NOT_CONNECTED;
        }
        var peer = easyRTC.peerConns[otherUser];
        if ((peer.sharingAudio || peer.sharingVideo) && !peer.startedAV) {
            return easyRTC.BECOMING_CONNECTED;
        }
        else if (peer.sharingData && !peer.dataChannelReady) {
            return easyRTC.BECOMING_CONNECTED;
        }
        else {
            return easyRTC.IS_CONNECTED;
        }
    };


    //
    // Builds the constraints object for creating peer connections. This used to be
    // inline but it's needed by the jssip connector as well.
    //

    /**
     * @private
     */
    easyRTC.buildPeerConstraints = function() {
        var options = [];

        options.push({'DtlsSrtpKeyAgreement': 'true'}); // for interoperability

        if (easyRTC.dataEnabled) {
            options.push({RtpDataChannels: true});
        }

        return {optional: options};

    };


    /**
     *  Initiates a call to another user. If it succeeds, the streamAcceptor callback will be called.
     * @param {String} otherUser - the easyrtcid of the peer being called.
     * @param {Function} callSuccessCB (otherCaller, mediaType) - is called when the datachannel is established or the mediastream is established. mediaType will have a value of "audiovideo" or "datachannel"
     * @param {Function} callFailureCB (errMessage) - is called if there was a system error interfering with the call.
     * @param {Function} wasAcceptedCB (wasAccepted:boolean,otherUser:string) - is called when a call is accepted or rejected by another party. It can be left null.
     * @example
     *    easyRTC.call( otherEasyrtcid, 
     *        function(easyrtcid, mediaType) {
     *           console.log("Got mediatype " + mediaType + " from " + easyRTC.idToName(easyrtcid);
     *        },
     *        function(errMessage) {
     *           console.log("call to  " + easyRTC.idToName(otherEasyrtcid) + " failed:" + errMessage);
     *        },
     *        function(wasAccepted, easyrtcid) {
     *            if( wasAccepted ) {
     *               console.log("call accepted by " + easyRTC.idToName(easyrtcid));
     *            }
     *            else {
     *                console.log("call rejected" + easyRTC.idToName(easyrtcid));
     *            }
     *        });       
     */
    easyRTC.call = function(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("initiating peer to peer call to " + otherUser +
                    " audio=" + easyRTC.audioEnabled +
                    " video=" + easyRTC.videoEnabled +
                    " data=" + easyRTC.dataEnabled);
        }
        var i;
        //
        // If we are sharing audio/video and we haven't allocated the local media stream yet,
        // we'll do so, recalling ourself on success.
        //
        if (easyRTC.localStream === null && (easyRTC.audioEnabled || easyRTC.videoEnabled)) {
            easyRTC.initMediaSource(function() {
                easyRTC.call(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB);
            }, callFailureCB);
            return;
        }


        if (!easyRTC.webSocket) {
            var message = "Attempt to make a call prior to connecting to service";
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter(message);
            }
            throw message;
        }

        if (easyRTC.sipUA) {
            //
            // The standard sip address starts with "sip:". 
            //
            for (i in easyRTC.sipProtocols) {
                if (otherUser.indexOf(easyRTC.sipProtocols[i]) === 0) {
                    easyRTC.sipCall(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB);
                    return;
                }
            }
        }
        //
        // Mozilla currently requires a media stream to set up data channels.
        // The below code attempts to create a fake data stream if a real data stream isn't being shared.
        // After the fake stream is created, the callback relaunches the easyRTC.call with the original
        // arguments.
        //
        if (navigator.mozGetUserMedia && easyRTC.dataEnabled && easyRTC.videoEnabled === false
                && easyRTC.audioEnabled === false && easyRTC.mozFakeStream === null) {
            navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(s) {
                if (!s) {
                    var message = "Error getting fake media stream for Firefox datachannels: null stream";
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter(message);
                    }
                    callFailureCB(message);
                }
                easyRTC.mozFakeStream = s;
                easyRTC.call(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB);
            }, function(err) {
                var message = "Error getting fake media stream for Firefox datachannels: " + err;
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter(message);
                }
                callFailureCB(message);
            });
            return;
        }

        //
        // If B calls A, and then A calls B before accepting, then A should treat the attempt to 
        // call B as a positive offer to B's offer.
        //
        if (easyRTC.offersPending[otherUser]) {
            wasAcceptedCB(true);
            doAnswer(otherUser, easyRTC.offersPending[otherUser]);
            delete easyRTC.offersPending[otherUser];
            easyRTC.callCancelled(otherUser, false);
            return;
        }

        // do we already have a pending call?
        if (typeof easyRTC.acceptancePending[otherUser] !== 'undefined') {
            message = "Call already pending acceptance";
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter(message);
            }
            callFailureCB(message);
            return;
        }

        easyRTC.acceptancePending[otherUser] = true;

        var pc = buildPeerConnection(otherUser, true, callFailureCB);
        if (!pc) {
            message = "buildPeerConnection failed, call not completed";
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter(message);
            }
            return;
        }
        easyRTC.peerConns[otherUser].callSuccessCB = callSuccessCB;
        easyRTC.peerConns[otherUser].callFailureCB = callFailureCB;
        easyRTC.peerConns[otherUser].wasAcceptedCB = wasAcceptedCB;

        var peerConnObj = easyRTC.peerConns[otherUser];

        var setLocalAndSendMessage = function(sessionDescription) {
            if (peerConnObj.cancelled) {
                return;
            }
            var sendOffer = function(successCB, errorCB) {
                sendMessage(otherUser, "offer", sessionDescription, successCB, callFailureCB);
            };

            pc.setLocalDescription(sessionDescription, sendOffer, callFailureCB);
        };


        pc.createOffer(setLocalAndSendMessage, null, mediaConstraints);
    };



    function limitBandWidth(sd) {
        if (easyRTC.videoBandwidthString !== "") {
            var pieces = sd.sdp.split('\n');
            for (var i = pieces.length - 1; i >= 0; i--) {
                if (pieces[i].indexOf("m=video") === 0) {
                    for (var j = i; j < i + 10 && pieces[j].indexOf("a=") === -1 &&
                            pieces[j].indexOf("k=") === -1; j++) {
                    }
                    pieces.splice(j, 0, (easyRTC.videoBandwidthString + "\r"));
                }
            }
            sd.sdp = pieces.join("\n");
        }
    }



    function hangupBody(otherUser) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("Hanging up on " + otherUser);
        }
        clearQueuedMessages(otherUser);
        if (easyRTC.peerConns[otherUser]) {
            if (easyRTC.peerConns[otherUser].startedAV) {
                try {
                    easyRTC.peerConns[otherUser].pc.close();
                } catch (ignoredError) {
                }

                if (easyRTC.onStreamClosed) {
                    easyRTC.onStreamClosed(otherUser);
                }
            }

            easyRTC.peerConns[otherUser].cancelled = true;

            delete easyRTC.peerConns[otherUser];
            if (easyRTC.webSocket) {
                sendMessage(otherUser, "hangup", {}, function() {
                }, function(msg) {
                    if (easyRTC.debugPrinter) {
                        debugPrinter("hangup failed:" + msg);
                    }
                });
            }
            if (easyRTC.acceptancePending[otherUser]) {
                delete easyRTC.acceptancePending[otherUser];
            }
        }
    }

    /**
     * Hang up on a particular user or all users.
     *  @param {String} otherUser - the easyrtcid of the person to hang up on.
     *  @example
     *     easyRTC.hangup(someEasyrtcid);
     */
    easyRTC.hangup = function(otherUser) {
        hangupBody(otherUser);
        easyRTC.updateConfigurationInfo();
    };


    /**
     * Hangs up on all current connections.
     * @example
     *    easyRTC.hangupAll();
     */
    easyRTC.hangupAll = function() {
        var sawAConnection = false;
        for (otherUser in easyRTC.peerConns) {
            sawAConnection = true;
            hangupBody(otherUser);
            if (easyRTC.webSocket) {
                sendMessage(otherUser, "hangup", {}, function() {
                }, function(msg) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("hangup failed:" + msg);
                    }
                });
            }
        }
        if (sawAConnection) {
            easyRTC.updateConfigurationInfo();
        }
    };




    var buildPeerConnection = function(otherUser, isInitiator, failureCB) {
        var pc;
        var message;

        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("building peer connection to " + otherUser);
        }


        try {
            pc = easyRTC.createRTCPeerConnection(easyRTC.pc_config, easyRTC.buildPeerConstraints());
            if (!pc) {
                message = "Unable to create PeerConnection object, check your ice configuration(" +
                        JSON.stringify(easyRTC.pc_config) + ")";
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter(message);
                }
                throw(message);
            }

            //
            // turn off data channel support if the browser doesn't support it.
            //
            if (easyRTC.dataEnabled && typeof pc.createDataChannel === 'undefined') {
                easyRTC.dataEnabled = false;
            }


            pc.onconnection = function() {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("onconnection called prematurely");
                }
            };

            var newPeerConn = {
                pc: pc,
                candidatesToSend: [],
                startedAV: false,
                isInitiator: isInitiator
            };

            pc.onicecandidate = function(event) {
//                if (easyRTC.debugPrinter) {
//                    easyRTC.debugPrinter("saw ice message:\n" + event.candidate);
//                }
                if (newPeerConn.cancelled) {
                    return;
                }
                if (event.candidate && easyRTC.peerConns[otherUser]) {
                    var candidateData = {
                        type: 'candidate',
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    };
                    if (easyRTC.peerConns[otherUser].startedAV) {
                        sendMessage(otherUser, "candidate", candidateData);
                    }
                    else {
                        easyRTC.peerConns[otherUser].candidatesToSend.push(candidateData);
                    }
                }
            };

            pc.onaddstream = function(event) {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("saw incoming media stream");
                }
                if (newPeerConn.cancelled)
                    return;
                easyRTC.peerConns[otherUser].startedAV = true;
                easyRTC.peerConns[otherUser].sharingAudio = easyRTC.haveAudioVideo.audio;
                easyRTC.peerConns[otherUser].sharingVideo = easyRTC.haveAudioVideo.video;
                easyRTC.peerConns[otherUser].connectTime = new Date().getTime();
                easyRTC.peerConns[otherUser].stream = event.stream;

                if (easyRTC.peerConns[otherUser].callSuccessCB) {
                    if (easyRTC.peerConns[otherUser].sharingAudio || easyRTC.peerConns[otherUser].sharingVideo) {
                        easyRTC.peerConns[otherUser].callSuccessCB(otherUser, "audiovideo");
                    }
                }
                if (easyRTC.audioEnabled || easyRTC.videoEnabled) { // might be a fake audio stream for mozilla data channels
                    updateConfiguration();
                }
                if (easyRTC.streamAcceptor) {
                    easyRTC.streamAcceptor(otherUser, event.stream);
                }
            };

            pc.onremovestream = function(event) {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("saw remove on remote media stream");
                }

                if (easyRTC.peerConns[otherUser]) {
                    easyRTC.peerConns[otherUser].stream = null;
                    if (easyRTC.onStreamClosed) {
                        easyRTC.onStreamClosed(otherUser);
                    }
                    delete easyRTC.peerConns[otherUser];
                    easyRTC.updateConfigurationInfo();
                }

            };
            easyRTC.peerConns[otherUser] = newPeerConn;

        } catch (e) {
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter(JSON.stringify(e));
            }
            failureCB(e.message);
            return null;
        }

        if (easyRTC.videoEnabled || easyRTC.audioEnabled) {
            if (easyRTC.localStream === null) {
                message = "Application program error: attempt to share audio or video before calling easyRTC.initMediaSource.";
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter(message);
                }
                alert(message);
            }
            else {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("adding local media stream to peer connection");
                }
                pc.addStream(easyRTC.localStream);
            }
        }
        else if (easyRTC.dataEnabled && navigator.mozGetUserMedia) { // mozilla needs a fake data stream for channels currently.
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("added fake stream to peer connection");
            }
            pc.addStream(easyRTC.mozFakeStream);
        }

        //
        //  added for interoperability
        //
        if (navigator.mozGetUserMedia) {
            if (!easyRTC.dataEnabled) {
                mediaConstraints.mandatory.MozDontOfferDataChannel = true;
            }
            else {
                delete mediaConstraints.mandatory.MozDontOfferDataChannel;
            }
        }

        if (easyRTC.dataEnabled) {

            function setupChannel(dataChannel) {

                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("saw setupChannel call");
                }
                easyRTC.peerConns[otherUser].dataChannel = dataChannel;

                //dataChannel.binaryType = "blob";

                dataChannel.onmessage = function(event) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("saw dataChannel.onmessage event");
                    }
                    if (easyRTC.receiveDataCB) {
                        easyRTC.receiveDataCB(otherUser, JSON.parse(event.data), null);
                    }
                };
                dataChannel.onopen = function(event) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("saw dataChannel.onopen event");
                    }
                    if (easyRTC.peerConns[otherUser]) {
                        easyRTC.peerConns[otherUser].dataChannelReady = true;

                        if (easyRTC.peerConns[otherUser].callSuccessCB) {
                            easyRTC.peerConns[otherUser].callSuccessCB(otherUser, "datachannel");
                        }
                        if (easyRTC.onDataChannelOpen) {
                            easyRTC.onDataChannelOpen(otherUser);
                        }
                        easyRTC.updateConfigurationInfo();
                    }
                };
                dataChannel.onclose = function(event) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("saw dataChannel.onclose event");
                    }
                    if (easyRTC.peerConns[otherUser]) {
                        easyRTC.peerConns[otherUser].dataChannelReady = false;
                        delete easyRTC.peerConns[otherUser].dataChannel;
                    }
                    if (easyRTC.onDataChannelClose) {
                        easyRTC.onDataChannelClose(openUser);
                    }

                    easyRTC.updateConfigurationInfo();
                };
            }


            if (isInitiator) {
                function initiateDataChannel() {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("called initiateDataChannel");
                    }
                    try {
                        var dataChannel = pc.createDataChannel(easyRTC.datachannelName, easyRTC.datachannelConstraints);
                        setupChannel(dataChannel);
                    } catch (channelErrorEvent) {
                        failureCB(easyRTC.formatError(channelErrorEvent));
                    }
                }

                if (navigator.mozGetUserMedia) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("setup pc.onconnection callback for initiator");
                    }
                    pc.onconnection = initiateDataChannel;
                }
                else {
                    initiateDataChannel();
                }
            }
            else {
                pc.onconnection = function() {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("callee onconnection event seen");
                    }
                };
                pc.ondatachannel = function(event) {
                    // Chrome passes down an event with channel attribute,
                    // whereas Mozilla passes down the channel itself.
                    if (event.channel) {
                        setupChannel(event.channel);
                    }
                    else {
                        setupChannel(event);
                    }
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("received data channel");
                    }
                    easyRTC.peerConns[otherUser].dataChannelReady = true;
                };
            }
        }
        return pc;
    };


    var doAnswer = function(caller, msg) {

        if (!easyRTC.localStream && (easyRTC.videoEnabled || easyRTC.audioEnabled)) {
            easyRTC.initMediaSource(
                    function(s) {
                        doAnswer(caller, msg);
                    },
                    function(err) {
                        easyRTC.showError(easyRTC.errCodes.MEDIA_ERR, "Error getting local media stream: " + err);
                    });
            return;
        }
        else if (easyRTC.dataEnabled && !easyRTC.videoEnabled && !easyRTC.audioEnabled
                && navigator.mozGetUserMedia && easyRTC.mozFakeStream === null) {
            navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(s) {
                if (!s) {
                    easyRTC.showError(easyRTC.errCodes.MEDIA_ERR, "Error getting fake media stream for Firefox datachannels: null stream");
                }
                easyRTC.mozFakeStream = s;
                doAnswer(caller, msg);
            }, function(err) {
                easyRTC.showError(easyRTC.errCodes.MEDIA_ERR, "Error getting fake media stream for Firefox datachannels: " + err);
            });
            return;
        }


        var pc = buildPeerConnection(caller, false, function(message) {
            easyRTC.showError(easyRTC.errCodes.SYSTEM_ERR, message);
        });

        var newPeerConn = easyRTC.peerConns[caller];

        if (!pc) {
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("buildPeerConnection failed. Call not answered");
            }
            return;
        }
        var setLocalAndSendMessage = function(sessionDescription) {
            if (newPeerConn.cancelled)
                return;

            var sendAnswer = function() {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("sending answer");
                }
                sendMessage(caller, "answer", sessionDescription, function() {
                }, easyRTC.onError);
                easyRTC.peerConns[caller].startedAV = true;
                if (pc.connectDataConnection) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("calling connectDataConnection(5002,5001)");
                    }
                    pc.connectDataConnection(5002, 5001);
                }
            };
            pc.setLocalDescription(sessionDescription, sendAnswer, function(message) {
                easyRTC.showError(easyRTC.errCodes.INTERNAL_ERR, "setLocalDescription: " + message);
            });
        };
        var sd = null;

        if (window.mozRTCSessionDescription) {
            sd = new mozRTCSessionDescription(msg.actualData);
        }
        else {
            sd = new RTCSessionDescription(msg.actualData);
        }
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("sdp ||  " + JSON.stringify(sd));
        }
        var invokeCreateAnswer = function() {
            if (newPeerConn.cancelled)
                return;
            pc.createAnswer(setLocalAndSendMessage,
                    function(message) {
                        easyRTC.showError(easyRTC.errCodes.INTERNAL_ERR, "create-answer: " + message);
                    },
                    mediaConstraints);
        };
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("about to call setRemoteDescription in doAnswer");
        }
        try {
            //    limitBandWidth(sd);
            pc.setRemoteDescription(sd, invokeCreateAnswer, function(message) {
                easyRTC.showError(easyRTC.errCodes.INTERNAL_ERR, "set-remote-description: " + message);
            });
        } catch (srdError) {
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("saw exception in setRemoteDescription");
            }
            easyRTC.showError(easyRTC.errCodes.INTERNAL_ERR, "setRemoteDescription failed: " + srdError.message);
        }
    };


    var onRemoteHangup = function(caller) {
        delete easyRTC.offersPending[caller];
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("Saw onremote hangup event");
        }
        if (easyRTC.peerConns[caller]) {
            easyRTC.peerConns[caller].cancelled = true;
            if (easyRTC.peerConns[caller].startedAV) {
                if (easyRTC.onStreamClosed) {
                    easyRTC.onStreamClosed(caller);
                }
            }
            else {
                if (easyRTC.callCancelled) {
                    easyRTC.callCancelled(caller, true);
                }
            }
            try {
                easyRTC.peerConns[caller].pc.close();
            } catch (anyErrors) {
            }
            ;
            delete easyRTC.peerConns[caller];
            easyRTC.updateConfigurationInfo();
        }
        else {
            if (easyRTC.callCancelled) {
                easyRTC.callCancelled(caller, true);
            }
        }
    };


    //
    // The app engine has many machines running in parallel. This means when
    //  a client sends a sequence of messages to another client via the server,
    //  one at a time, they don't necessarily arrive in the same order in which
    // they were sent. In particular, candidates arriving before an offer can throw
    // a wrench in the gears. So we queue the messages up until we are ready for them.
    //
    var queuedMessages = {};

    var clearQueuedMessages = function(caller) {
        queuedMessages[caller] = {
            candidates: []
        };
    };


    var onChannelMessage = function(msg) {

        if (easyRTC.receiveDataCB) {
            easyRTC.receiveDataCB(msg.senderId, msg.msgData);
        }
    };



    var onChannelCmd = function(msg) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("received message from socket server=" + JSON.stringify(msg));
        }

        var caller = msg.senderId;
        var msgType = msg.msgType;
        var actualData = msg.msgData;
        var pc;

        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter('received message of type ' + msgType);
        }

        if (typeof queuedMessages[caller] === "undefined") {
            clearQueuedMessages(caller);
        }

        var processConnectedList = function(connectedList) {
            for (var i in easyRTC.peerConns) {
                if (typeof connectedList[i] === 'undefined') {
                    if (easyRTC.peerConns[i].startedAV) {
                        onRemoteHangup(i);
                        clearQueuedMessages(i);
                    }
                }
            }
        };


        var processCandidate = function(actualData) {
            var candidate = null;
            if (window.mozRTCIceCandidate) {
                candidate = new mozRTCIceCandidate({
                    sdpMLineIndex: actualData.label,
                    candidate: actualData.candidate
                });
            }
            else {
                candidate = new RTCIceCandidate({
                    sdpMLineIndex: actualData.label,
                    candidate: actualData.candidate
                });
            }
            pc = easyRTC.peerConns[caller].pc;
            pc.addIceCandidate(candidate);
        };


        var flushCachedCandidates = function(caller) {
            if (queuedMessages[caller]) {
                for (var i = 0; i < queuedMessages[caller].candidates.length; i++) {
                    processCandidate(queuedMessages[caller].candidates[i]);
                }
                delete queuedMessages[caller];
            }
        };


        var processOffer = function(caller, actualData) {

            var helper = function(wasAccepted) {
                if (easyRTC.debugPrinter) {
                    easyRTC.debugPrinter("offer accept=" + wasAccepted);
                }
                delete easyRTC.offersPending[caller];

                if (wasAccepted) {
                    doAnswer(caller, actualData);
                    flushCachedCandidates(caller);

                }
                else {
                    sendMessage(caller, "reject", {
                        rejected: true
                    }, function() {
                    }, function() {
                    });
                    clearQueuedMessages(caller);
                }
            };

            // 
            // There is a very rare case of two callers sending each other offers
            // before receiving the others offer. In such a case, the caller with the
            // greater valued easyrtcid will delete its pending call information and do a 
            // simple answer to the other caller's offer.
            //
            if (easyRTC.acceptancePending[caller] && caller < easyRTC.myEasyrtcid) {
                delete easyRTC.acceptancePending[caller];
                if (queuedMessages[caller]) {
                    delete queuedMessages[caller];
                }
                if (easyRTC.peerConns[caller].wasAcceptedCB) {
                    easyRTC.peerConns[caller].wasAcceptedCB(true, caller);
                }
                delete easyRTC.peerConns[caller];
                helper(true);
                return;
            }

            easyRTC.offersPending[caller] = actualData;


            if (!easyRTC.acceptCheck) {
                helper(true);
            }
            else {
                easyRTC.acceptCheck(caller, helper);
            }
        };


        if (msgType === 'token') {
            easyRTC.myEasyrtcid = msg.easyrtcid;
            easyRTC.pc_config = msg.iceConfig;
            easyRTC.cookieOwner = msg.isOwner ? true : false;
            easyRTC.room = msg.room ? msg.room : null;

            if (easyRTC.sipConfig) {
                if (!easyRTC.initSipUa) {
                    console.log("Sip connection parameters provided but no sip stuff");
                }
                easyRTC.initSipUa();


            }


            if (successCallback) {
                successCallback(easyRTC.myEasyrtcid, easyRTC.cookieOwner);
            }
        }
        else if (msgType === 'updateInfo') {
            easyRTC.updateConfigurationInfo();
        }
        else if (msgType === 'list') {
            delete actualData.connections[easyRTC.myEasyrtcid];
            easyRTC.lastLoggedInList = actualData.connections;
            processConnectedList(actualData.connections);
            if (easyRTC.loggedInListener) {
                easyRTC.loggedInListener(actualData.connections);
            }
        }
        else if (msgType === 'forwardToUrl') {
            if (actualData.newWindow) {
                window.open(actualData.url);
            }
            else {
                window.location.href = actualData.url;
            }
        }
        else if (msgType === 'offer') {
            processOffer(caller, actualData);
        }
        else if (msgType === 'reject') {
            delete easyRTC.acceptancePending[caller];
            if (queuedMessages[caller]) {
                delete queuedMessages[caller];
            }
            if (easyRTC.peerConns[caller]) {
                if (easyRTC.peerConns[caller].wasAcceptedCB) {
                    easyRTC.peerConns[caller].wasAcceptedCB(false, caller);
                }
                delete easyRTC.peerConns[caller];
            }
        }
        else if (msgType === 'answer') {
            delete easyRTC.acceptancePending[caller];
            if (easyRTC.peerConns[caller].wasAcceptedCB) {
                easyRTC.peerConns[caller].wasAcceptedCB(true, caller);
            }
            easyRTC.peerConns[caller].startedAV = true;
            for (var i = 0; i < easyRTC.peerConns[caller].candidatesToSend.length; i++) {
                sendMessage(caller, "candidate", easyRTC.peerConns[caller].candidatesToSend[i]);
            }

            pc = easyRTC.peerConns[caller].pc;
            var sd = null;
            if (window.mozRTCSessionDescription) {
                sd = new mozRTCSessionDescription(actualData.actualData);
            }
            else {
                sd = new RTCSessionDescription(actualData.actualData);
            }
            if (!sd) {
                throw "Could not create the RTCSessionDescription";
            }
            //            limitBandWidth(sd);
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("about to call initiating setRemoteDescription");
            }
            pc.setRemoteDescription(sd, function() {
                if (pc.connectDataConnection) {
                    if (easyRTC.debugPrinter) {
                        easyRTC.debugPrinter("calling connectDataConnection(5001,5002)");
                    }
                    pc.connectDataConnection(5001, 5002); // these are like ids for data channels
                }
            });
            flushCachedCandidates(caller);
        }
        else if (msgType === 'candidate') {
            if (easyRTC.peerConns[caller] && easyRTC.peerConns[caller].startedAV) {
                processCandidate(actualData.actualData);
            }
            else {
                if (!easyRTC.peerConns[caller]) {
                    queuedMessages[caller] = {
                        candidates: []
                    };
                }
                queuedMessages[caller].candidates.push(actualData.actualData);
            }
        }
        else if (msgType === 'hangup') {
            onRemoteHangup(caller);
            clearQueuedMessages(caller);
        }
        else if (msgType === 'error') {
            easyRTC.showError(actualData.errorCode, actualData.errorText);
        }
    };




    if (!window.io) {
        easyRTC.onError("Your HTML has not included the socket.io.js library");
    }


    easyRTC.webSocket = io.connect(easyRTC.serverPath, {
        'force new connection': true, 'connect timeout': 10000
    });
    if (!easyRTC.webSocket) {
        throw "io.connect failed";
    }
// the below lines were useless. Nobody on the net seems to have gotten connect_failed to work either.
//    easyRTC.webSocket.on('connect_failed', function() {
//        errorCallback("Unable to connect to the easyRTC WordPress Plugin server.");
//    });
//    easyRTC.webSocket.socket.on('connect_failed', function() {
//        errorCallback("Unable to connect to the easyRTC WordPress Plugin server.");
//    });
    easyRTC.webSocket.on('error', function() {
        if (easyRTC.myEasyrtcid) {
            easyRTC.showError(easyRTC.errCodes.SIGNAL_ERROR, "Miscellaneous error from signalling server. It may be ignorable.");
        }
        else {
            errorCallback("Unable to reach the easyRTC signalling server.");
        }
    });



    function  getStatistics(pc, track, results) {
        var successcb = function(stats) {
            for (var i in stats) {
                results[i] = stats[i];
            }
        };
        var failurecb = function(event) {
            results.error = event;
        };
        pc.getStats(track, successcb, failurecb);
    }


    function DeltaRecord(added, deleted, modified) {
        function objectNotEmpty(obj) {
            for (var i in obj) {
                return true;
            }
            return false;
        }

        var result = {};
        if (objectNotEmpty(added)) {
            result.added = added;
        }

        if (objectNotEmpty(deleted)) {
            result.deleted = deleted;
        }

        if (objectNotEmpty(result)) {
            return result;
        }
        else {
            return null;
        }
    }

    function findDeltas(oldVersion, newVersion) {
        var i;
        var added = {}, deleted = {};

        for (i in newVersion) {
            if (oldVersion === null || typeof oldVersion[i] === 'undefined') {
                added[i] = newVersion[i];
            }
            else if (typeof newVersion[i] === 'object') {
                var subPart = findDeltas(oldVersion[i], newVersion[i]);
                if (subPart !== null) {
                    added[i] = newVersion[i];
                }
            }
            else if (newVersion[i] !== oldVersion[i]) {
                added[i] = newVersion[i];

            }
        }
        for (i in oldVersion) {
            if (typeof newVersion[i] === 'undefined') {
                deleted = oldVersion[i];
            }
        }

        return  new DeltaRecord(added, deleted);
    }

    easyRTC.oldConfig = {}; // used internally by updateConfiguration

    //
    // this function collects configuration info that will be sent to the server.
    // It returns that information, leaving it the responsibility of the caller to
    // do the actual sending.
    //
    easyRTC.collectConfigurationInfo = function() {
        var connectionList = {};
        for (var i in easyRTC.peerConns) {
            connectionList[i] = {
                connectTime: easyRTC.peerConns[i].connectTime,
//                sharingAudio: easyRTC.peerConns[i].sharingAudio ? true : false,
//                sharingVideo: easyRTC.peerConns[i].sharingVideo ? true : false,
//                sharingData: easyRTC.peerConns[i].dataChannel ? true : false,
                isInitiator: easyRTC.peerConns[i].isInitiator ? true : false
            };
//
// getStats returns nothing of value at this point so commented out.
// 
//            if (easyRTC.peerConns[i].pc.getStats) {
//                var pc = easyRTC.peerConns[i].pc;
//                pc.getStats(function(dest) {
//                    return function(stats) {
//                        if (stats === {}) {
//                            dest.stats = "none";
//                        }
//                        else {
//                            dest.stats = stats.result();
//                            console.log("In stats");                            
//                        }
//                    };
//                }(connectionList[i]));
//            }
        }

        var newConfig = {
            sharingAudio: easyRTC.haveAudioVideo.audio ? true : false,
            sharingVideo: easyRTC.haveAudioVideo.video ? true : false,
            sharingData: easyRTC.dataEnabled ? true : false,
            nativeVideoWidth: easyRTC.nativeVideoWidth,
            nativeVideoHeight: easyRTC.nativeVideoHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            apiKey: easyRTC.apiKey,
            appDefinedFields: easyRTC.appDefinedFields,
            connectionList: connectionList,
            applicationName: applicationName,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            cookieEnabled: navigator.cookieEnabled,
            os: navigator.oscpu,
            language: navigator.language
        };
        if (easyRTC.cookieId && document.cookie) {
            var cookies = document.cookie.split("[; ]");
            var target = easyRTC.cookieId + "=";

            for (var i in cookies) {
                if (cookies[i].indexOf(target) === 0) {
                    var cookie = cookies[i].substring(target.length);
                    newConfig.easyrtcsid = cookie;
                }
            }
        }

        if (easyRTC.referer) {
            newConfig.referer = easyRTC.referer;
        }

        if (easyRTC.userName) {
            newConfig.userName = easyRTC.userName;
        }
        return newConfig;
    };


    function updateConfiguration() {
        var newConfig = easyRTC.collectConfigurationInfo();
        //
        // we need to give the getStats calls a chance to fish out the data. 
        // The longest I've seen it take is 5 milliseconds so 100 should be overkill.
        //
        var sendDeltas = function() {
            var alteredData = findDeltas(easyRTC.oldConfig, newConfig);

            //
            // send all the configuration information that changes during the session
            //
            if (easyRTC.debugPrinter) {
                easyRTC.debugPrinter("cfg=" + JSON.stringify(alteredData.added));
            }
            if (easyRTC.webSocket) {
                easyRTC.webSocket.json.emit("easyRTCcmd",
                        {
                            msgType: 'setUserCfg',
                            msgData: alteredData.added
                        }
                );
            }
            easyRTC.oldConfig = newConfig;
        };

        if (easyRTC.oldConfig === {}) {
            sendDeltas();
        }
        else {
            setTimeout(sendDeltas, 100);
        }
    }


    easyRTC.webSocket.on("connect", function(event) {
        if (!easyRTC.webSocket.socket.sessionid) {
            //
            // If you try to connect to a server that isn't there, you'll eventually get a 
            // connect event when the server is present, but the connection you get will be
            // broken, no sessionid field. In this scenario, we're going to try starting a
            // fresh connection.
            easyRTC.webSocket.socket.disconnect();
            startChannel(); // try again
            return;
        }

        easyRTC.webSocket.on("message", onChannelMessage);
        easyRTC.webSocket.on("easyRTCcmd", onChannelCmd);  // deprecated
        easyRTC.webSocket.on("easyrtcCmd", onChannelCmd);
        easyRTC.webSocket.on("disconnect", function(code, reason, wasClean) {
            easyRTC.updateConfigurationInfo = function() {
            };
            if (!easyRTC.disconnecting) {
                setTimeout(function() {
                    if (easyRTC.webSocket) {
                        easyRTC.disconnectBody();
                    }
                    if (easyRTC.disconnectListener) {
                        easyRTC.disconnectListener();
                    }
                }, 1000);
            }
        });
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("saw socketserver onconnect event");
        }
        if (easyRTC.webSocket) {
            easyRTC.updateConfigurationInfo = updateConfiguration;
            easyRTC.updateConfigurationInfo();
        }
        else {
            errorCallback("Internal communications failure.");
        }
    }
    );
};

// this flag controls whether the initManaged routine adds close buttons to the caller
// video objects

/** @private */
easyRTC.autoAddCloseButtons = true;

/** By default, the initManaged routine sticks a "close" button on top of each caller
 * video object that it manages. Call this function (before calling initManaged) to disable that particular feature.
 * 
 */
easyRTC.dontAddCloseButtons = function() {
    easyRTC.autoAddCloseButtons = false;
}
/**
 * Provides a layer on top of the easyRTC.initMediaSource and easyRTC.connect, assign the local media stream to
 * the video object identified by monitorVideoId, assign remote video streams to
 * the video objects identified by videoIds, and then call onReady. One of it's
 * side effects is to add hangup buttons to the remote video objects, buttons
 * that only appear when you hover over them with the mouse cursor. This method will also add the 
 * easyRTCMirror class to the monitor video object so that it behaves like a mirror.
 *  @param {String} applicationName - name of the application.
 *  @param {String} monitorVideoId - the id of the video object used for monitoring the local stream.
 *  @param {Array} videoIds - an array of video object ids (strings)
 *  @param {Function} onReady - a callback function used on success.
 *  @param {Function} onFailure - a callbackfunction used on failure (failed to get local media or a connection of the signaling server).
 *  @example
 *     easyRTC.initManaged('multiChat', 'selfVideo', ['remote1', 'remote2', 'remote3'], 
 *              function() {
 *                  console.log("successfully connected.");
 *              });
 */
easyRTC.initManaged = function(applicationName, monitorVideoId, videoIds, onReady, onFailure) {
    var numPEOPLE = videoIds.length;
    var refreshPane = 0;
    var onCall = null, onHangup = null, gotMediaCallback = null, gotConnectionCallback = null;

    if (videoIds === null) {
        videoIds = [];
    }

    // verify that video ids were not typos.    
    if (monitorVideoId && !document.getElementById(monitorVideoId)) {
        easyRTC.showError(easyRTC.errCodes.DEVELOPER_ERR, "The monitor video id passed to initManaged was bad, saw " + monitorVideoId);
        return;
    }

    document.getElementById(monitorVideoId).muted = "muted";

    for (var i in videoIds) {
        var name = videoIds[i];
        if (!document.getElementById(name)) {
            easyRTC.showError(easyRTC.errCodes.DEVELOPER_ERR, "The caller video id '" + name + "' passed to initManaged was bad.");
            return;
        }
    }
    /** Sets an event handler that gets called when the local media stream is
     *  created or not. Can only be called after calling easyRTC.initManaged.
     *  @param {Function} gotMediaCB has the signature function(gotMedia, why)
     *  @example 
     *     easyRTC.setGotMedia( function(gotMediaCB, why) {
     *         if( gotMedia ) {
     *             console.log("Got the requested user media");
     *         }
     *         else {
     *             console.log("Failed to get media because: " +  why);
     *         }
     *     });
     */
    easyRTC.setGotMedia = function(gotMediaCB) {
        gotMediaCallback = gotMediaCB;
    };


    /** Sets an event handler that gets called when a connection to the signalling
     * server has or has not been made. Can only be called after calling easyRTC.initManaged.
     * @param {Function} gotConnectionCB has the signature (gotConnection, why)
     * @example 
     *    easyRTC.setGotConnection( function(gotConnection, why) {
     *        if( gotConnection ) {
     *            console.log("Successfully connected to signalling server");
     *        }
     *        else {
     *            console.log("Failed to connect to signalling server because: " + why);
     *        }
     *    });
     */
    easyRTC.setGotConnection = function(gotConnectionCB) {
        gotConnectionCallback = gotConnectionCB;
    };

    /** Sets an event handler that gets called when a call is established.
     * It's only purpose (so far) is to support transitions on video elements.
     * This function is only defined after easyRTC.initManaged is called.
     * The slot argument is the index into the array of video ids.
     * @param {Function} cb has the signature function(easyrtcid, slot) {}
     * @example
     *   easyRTC.setOnCall( function(easyrtcid, slot) { 
     *      console.log("call with " + easyrtcid + "established");
     *   }); 
     */
    easyRTC.setOnCall = function(cb) {
        onCall = cb;
    };

    /** Sets an event handler that gets called when a call is ended.
     * it's only purpose (so far) is to support transitions on video elements.
     x     * this function is only defined after easyRTC.initManaged is called.
     * The slot is parameter is the index into the array of video ids.
     * Note: if you call easyRTC.getConnectionCount() from inside your callback
     * it's count will reflect the number of connections before the hangup started.
     * @param {Function} cb has the signature function(easyrtcid, slot) {}
     * @example
     *   easyRTC.setOnHangup( function(easyrtcid, slot) { 
     *      console.log("call with " + easyrtcid + "ended");
     *   }); 
     */
    easyRTC.setOnHangup = function(cb) {
        onHangup = cb;
    };


    function getIthVideo(i) {
        if (videoIds[i]) {
            return document.getElementById(videoIds[i]);
        }
        else {
            return null;
        }
    }


    easyRTC.getIthCaller = function(i) {
        if (i < 0 || i > videoIds.length) {
            return null;
        }
        return getIthVideo(i).caller;
    };

    easyRTC.getSlotOfCaller = function(easyrtcid) {
        for (var i = 0; i < numPEOPLE; i++) {
            if (easyRTC.getIthCaller(i) === easyrtcid) {
                return i;
            }
        }
        return -1; // caller not connected
    };

    easyRTC.setOnStreamClosed(function(caller) {
        for (var i = 0; i < numPEOPLE; i++) {
            var video = getIthVideo(i);
            if (video.caller === caller) {
                easyRTC.setVideoObjectSrc(video, "");
                video.caller = "";
                if (onHangup) {
                    onHangup(caller, i);
                }
            }
        }
    });


    //
    // Only accept incoming calls if we have a free video object to display
    // them in. 
    //
    easyRTC.setAcceptChecker(function(caller, helper) {
        for (var i = 0; i < numPEOPLE; i++) {
            var video = getIthVideo(i);
            if (video.caller === "") {
                helper(true);
                return;
            }
        }
        helper(false);
    });



    easyRTC.setStreamAcceptor(function(caller, stream) {
        if (easyRTC.debugPrinter) {
            easyRTC.debugPrinter("stream acceptor called");
        }
        var i, video;
        if (refreshPane && refreshPane.caller === "") {
            easyRTC.setVideoObjectSrc(video, stream);
            if (onCall) {
                onCall(caller);
            }
            refreshPane = null;
            return;
        }
        for (i = 0; i < numPEOPLE; i++) {
            video = getIthVideo(i);
            if (video.caller === caller) {
                easyRTC.setVideoObjectSrc(video, stream);
                if (onCall) {
                    onCall(caller, i);
                }
                return;
            }
        }

        for (i = 0; i < numPEOPLE; i++) {
            video = getIthVideo(i);
            if (!video.caller || video.caller === "") {
                video.caller = caller;
                if (onCall) {
                    onCall(caller, i);
                }
                easyRTC.setVideoObjectSrc(video, stream);
                return;
            }
        }
        //
        // no empty slots, so drop whatever caller we have in the first slot and use that one.
        //
        video = getIthVideo(0);
        if (video) {
            easyRTC.hangup(video.caller);
            easyRTC.setVideoObjectSrc(video, stream);
            if (onCall) {
                onCall(caller, 0);
            }
        }
        video.caller = caller;
    });


    if (easyRTC.autoAddCloseButtons) {
        var addControls = function(video) {
            var parentDiv = video.parentNode;
            video.caller = "";
            var closeButton = document.createElement("div");
            closeButton.className = "closeButton";
            closeButton.onclick = function() {
                if (video.caller) {
                    easyRTC.hangup(video.caller);
                    easyRTC.setVideoObjectSrc(video, "");
                    video.caller = "";
                }
            };
            parentDiv.appendChild(closeButton);
        };

        for (var i = 0; i < numPEOPLE; i++) {
            addControls(getIthVideo(i));
        }
    }

    var monitorVideo = null;

    if (easyRTC.videoEnabled && monitorVideoId !== null) {
        monitorVideo = document.getElementById(monitorVideoId);
        if (!monitorVideo) {
            alert("Programmer error: no object called " + monitorVideoId);
            return;
        }
        monitorVideo.muted = "muted";
        monitorVideo.defaultMuted = true;
    }


    var nextInitializationStep;


    if (easyRTC.debugPrinter) {
        easyRTC.debugPrinter("No sip initialization ");
    }
    nextInitializationStep = function(token, isOwner) {
        if (gotConnectionCallback) {
            gotConnectionCallback(true, "");
        }
        onReady(easyRTC.myEasyrtcid, easyRTC.cookieOwner);
    };

    easyRTC.initMediaSource(
            function() {
                if (gotMediaCallback) {
                    gotMediaCallback(true, null);
                }
                if (monitorVideo !== null) {
                    easyRTC.setVideoObjectSrc(monitorVideo, easyRTC.getLocalStream());
                }
                function connectError(why) {
                    if (gotConnectionCallback) {
                        gotConnectionCallback(false, why);
                    }
                    else {
                        easyRTC.showError(easyRTC.errCodes.CONNECT_ERR, why);
                    }
                    if (onFailure) {
                        onFailure(why);
                    }
                }
                easyRTC.connect(applicationName, nextInitializationStep, connectError);
            },
            function(errmesg) {
                if (gotMediaCallback) {
                    gotMediaCallback(false, errmesg);
                }
                else {
                    easyRTC.showError(easyRTC.errCodes.MEDIA_ERR, errmesg);
                }
                if (onFailure) {
                    onFailure(why);
                }
            }
    );
};