#!/bin/env node
/*
Copyright (c) 2013, Priologic Software Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/

// Local includes
easyrtcCfg  = require('./config');          // All server configuration (global)
var g       = require('./lib/general');     // General helper functions
var c       = require('./lib/connection');  // easyRTC connection functions
var p       = require('./lib/present');
var os = require("os");

// Ensure required modules are installed before beginning
if (!g.moduleExists('express') || !g.moduleExists('socket.io') || !g.moduleExists('winston')) {
    console.log('Error: Required modules are not installed. Run \'npm install\' from command line.');
    process.exit(1);
}


// Module dependencies
var fs      = require('fs');                // file system core module
var http    = require('http');              // http server core module
var express = require('express');           // web framework external module
var sio     = require('socket.io');         // web socket external module
var winston = require('winston');           // logging module

// Logging Setup
g.logInit();                                // Initialize logging settings
var logServer   = winston.loggers.get('easyrtcServer');
var logApi      = winston.loggers.get('easyrtcApi');
var logExpress  = winston.loggers.get('express');
var logSocketIo = winston.loggers.get('socketIo');


//  Set express http server options.
var httpApp = express();
httpApp.configure(function() {
    var logStream = {
        write: function(message, encoding){
            logExpress.info(message, { label: 'express'});
        }        
    }
    httpApp.use(express.logger({stream: logStream}));
    httpApp.use(express.static(__dirname + '/static/'));

    if(easyrtcCfg.enableDemos) {
        httpApp.use("/demos", express.static(__dirname + "/demos"));
    }
});

var connection_details = {};
//  Set the environment variables we need.
connection_details.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
connection_details.port = process.env.OPENSHIFT_NODEJS_PORT || 8000;

if (typeof  connection_details.ipaddress === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the app locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
     connection_details.ipaddress = '127.0.0.1';
};
console.log(JSON.stringify(connection_details));

var createRoutes = function() {
        routes = { };

        // Routes for /health, /asciimo and /
        routes['/health'] = function(req, res) {
            res.send('1');
        };

        routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(cache_get('index.html'));
        };

        // SAMPLE USAGE: http://localhost:8000/get-slideshare-id?slideshare_url=http://www.slideshare.net/marketo/slideshare-cheat-sheet
        routes['/get-slideshare-id*'] = function(req, res) {
            res.setHeader('Content-Type', 'application/json');
            if (req.query.slideshare_url) {
                var ss = new SlideShare();
                ss.getId(req.query.slideshare_url, function (id) {
                    if (id) {
                        res.send('{"slideshare_id": ' + id + '}');
                    }
                    else {
                        res.send('{"error": "cannot get slideshare id"}');
                    }
                });
            }
            else {
                res.send('{"error": "invalid slideshare URL"}');
            }
        };

        routes['/slideshare/*'] = function(req, res) {
            var slide_id = req.url.substring(12);
            var slide_page_data = '';
            //var script_src = '<script> $(document).ready(function () { $(".btnNext").click(function () { alert("event captured"); }); }); </script>';
            var script_src = '<script>' + cache_get('static/EventCapture.js') +  '</script>';

            if (!script_src) {
                script_src = '';
            }
            res.setHeader('Content-Type', 'text/html');
            var slide_url = 'http://www.slideshare.net/slideshow/embed_code/' + slide_id;
            var request = http.get(slide_url, function(slide_res) {
                slide_res.on('data', function (chunk) {
                    slide_page_data += chunk;
                });
                slide_res.on('end', function(){
                    slide_page_data = slide_page_data.replace('</head>', script_src + '</head>');
                    res.send(slide_page_data);
                });
            });
            request.on('error', function(err) {
                console.log(err);
                res.status(302);
                console.log('redirecting to http://' + slide_url);
                res.setHeader('Location', 'http://' + slide_url);
                res.end();
            });
        };
    };

// Start either the HTTP or HTTPS web service
logServer.info('Starting easyRTC Server (v' + easyrtcCfg.easyrtcVersion +')', { label: 'easyrtcServer'});
if (easyrtcCfg.sslEnable) {  // Start SSL Server (https://)
    var https = require('https');
    var sslOptions = {
        key:  fs.readFileSync(easyrtcCfg.sslKeyFile),
        cert: fs.readFileSync(easyrtcCfg.sslCertFile)
    };

    var server = https.createServer(sslOptions, httpApp).listen(easyrtcCfg.sslPort);

    logServer.info('HTTPS (SSL) Server started on port: ' + easyrtcCfg.sslPort, { label: 'easyrtcServer'});

    // Optionally listen in on an http port and forward requests to secure port
    if (easyrtcCfg.sslForwardFromHttp) {
        var forwardingServer = express();
        forwardingServer.all('*', function(req, res) {
            return res.redirect("https://" + req.host + (easyrtcCfg.sslPort==443 ? '' :':' + easyrtcCfg.sslPort) + req.url);
        });
        forwardingServer.listen(easyrtcCfg.httpPort);
    }    
} else {    // Start HTTP server (http://)

    var server = http.createServer(httpApp).listen(connection_details.port, connection_details.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), connection_details.ipaddress, connection_details.port);
        });
    logServer.info('HTTP Server started on port: ' + connection_details.port, { label: 'easyrtcServer'});
}


// Start socket server
var io = sio.listen(server, {
        'logger': {
            debug: function(message){ logSocketIo.debug(message, { label: 'socket.io'}); },
            info:  function(message){ logSocketIo.info( message, { label: 'socket.io'}); },
            warn:  function(message){ logSocketIo.warn( message, { label: 'socket.io'}); },
            error: function(message){ logSocketIo.error(message, { label: 'socket.io'}); }
        },
        'browser client minification': easyrtcCfg.socketIoClientMinifyEnabled,
        'browser client etag': easyrtcCfg.socketIoClientEtagEnabled,
        'browser client gzip': easyrtcCfg.socketIoClientGzipEnabled   // true is faster but causes crashes on some windows boxes
});
logServer.info('Socket Server started', { label: 'easyrtcServer'});


// Start experimental STUN server (if enabled)
if (easyrtcCfg.experimentalStunServerEnable) {
    g.experimentalStunServer();
}


// Shared variable to hold server and socket information.
easyrtc = {
    serverStartTime: Date.now(),
    connections: {}
};


// Upon a socket connection, a socket is created for the life of the connection
io.sockets.on('connection', function (socket) {
    logServer.debug('easyRTC: Socket [' + socket.id + '] connected with application: [' + easyrtcCfg.defaultApplicationName + ']', { label: 'easyrtc', easyrtcid:connectionEasyRtcId, applicationName:easyrtcCfg.defaultApplicationName});
    var connectionEasyRtcId = socket.id;
    c.onSocketConnection(io, socket, connectionEasyRtcId);

    // Incoming messages: Custom message. Allows applications to send socket messages to other connected users.
    socket.on('message', function(msg) {
        logServer.debug('easyRTC: Socket [' + socket.id + '] message received', { label: 'easyrtc', easyrtcid:connectionEasyRtcId, applicationName: easyrtc.connections[connectionEasyRtcId].applicationName, data:msg});
        c.onSocketMessage(io, socket, connectionEasyRtcId, msg);
    });

    // Incoming easyRTC commands: Used to forward webRTC negotiation details and manage server settings.
    socket.on('easyRTCcmd', function(msg) {
        logServer.debug('easyRTC: Socket [' + socket.id + '] command received', { label: 'easyrtc', easyrtcid:connectionEasyRtcId, data:msg});
        c.onEasyRtcCmd(io, socket, connectionEasyRtcId, msg);
    });

    // Upon a socket disconnecting (either directed or via time-out)
    socket.on('disconnect', function(data) {
        logServer.debug('easyRTC: Socket [' + socket.id + '] disconnected', { label: 'easyrtc', easyrtcid:connectionEasyRtcId});
        c.onSocketDisconnect(io, socket, connectionEasyRtcId);
    });
});


// Checks to see if there is a newer version of easyRTC available
if (easyrtcCfg.updateCheckEnable) {
    g.updateCheck(http);
}

initializeServer = function() {
        createRoutes();
        app = httpApp ;
        app.configure(function() {
                app.use('/demos', express.static(__dirname+'/demos'));
                app.use(express.static(__dirname + '/static/'));
        });

        //  Add handlers for the app (from the routes).
        for (var r in routes) {
            app.get(r, routes[r]);
            console.log(r);
        }
    };

cache_get = function(key) { return fs.readFileSync(key); };

var SlideShare = function () {
    var self = this;
}
SlideShare.prototype.getId = function(original_url, callback) {
    var page_data = '';
    var request = http.get(original_url, function(slide_res) {
        slide_res.on('data', function (chunk) {
            page_data += chunk;
        });
        slide_res.on('end', function(){
            var prefix = 'slideshow/embed_code';
            var id = page_data.substring(page_data.indexOf(prefix) + prefix.length + 1);
            id = id.substring(0, id.indexOf('"'));
            callback(id);
        });
    });
    request.on('error', function(err) {
        console.log(err);
        callback(undefined);
    });
};

SlideShare.test = new SlideShare();
SlideShare.test.getId('http://www.slideshare.net/ashwan/meet-the-new-slideshare-embed', function (id) {
    console.log('SlideShare ID: ' + id);
});

initializeServer();
