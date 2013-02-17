connectionMgr = {};

var fs = require('fs');
var http = require('http');
var url = require('url');

var starServerURL = process.env.HOST_STAR_SERVER;

connectionMgr.answerMainServer = function( commandID, answerObj, cb ){
	answerObj._command_id = commandID;
	var options = {
		host: url.parse(starServerURL).hostname,
		port: url.parse(starServerURL).port,
		headers: answerObj,
		path: '/internal/command_responses',
		method: 'POST'
	};

	var httpReqToAnswerServer = http.request(options, function(res) {
		logger.info('STATUS: ' + res.statusCode);
		logger.info('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			logger.info('BODY: ' + chunk);
		}).on('end', function() {
			if (cb) {
				cb(null);
			}
			//logger.info('['+ movieProjectID +'] Successfully answered Star Server');
		});
	});

	httpReqToAnswerServer.on('error', function(e) {
		//logger.info('['+ movieProjectID +'] Http error on answering Star Server: ' + e.message);
		if (cb) {
			cb(e.message);
		}

	});

	// write data to request body
	//httpReqToAnswerServer.write( JSON.stringify(dataToAnswerServer) );
	httpReqToAnswerServer.end();


};


//long-polling connection to Star Server
connectionMgr.connectToMainServer = function( remoteID, remoteType, getCommand_cb) {
	var dataToSend = {
		remote_id: remoteID,
		remote_type: remoteType
	};
	
	
	
	var options = {
		host: url.parse(starServerURL).hostname,
		path: '/internal/commands',
		headers: dataToSend,
		method: 'GET'
	};
	var port = url.parse(starServerURL).port;
	if (port) {
		options.port = port;
	}
	else {
		options.port = 80;
	}

	var httpReq = http.request(options, function(res) {
		logger.info('STATUS: ' + res.statusCode);
		//logger.info('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (_resData) {
			//logger.info('resData: '+_resData);
			console.log('resData: ');
			console.dir(_resData);
			var resData = JSON.parse(_resData);
			if ( resData.type == "COMMAND" ) {
				//process the command sent from Star server
				logger.info('COMMAND BODY:', resData.body);
				
				var commandID = resData.body._commandID;
				
				if (getCommand_cb) {
					getCommand_cb( commandID, resData.body);				
				}
				
			}			
		}).on('end', function() {
			//logger.info('Connection to Main Server ends');
			console.log('Connection to Main Server ends');
			connectionMgr.connectToMainServer( remoteID, remoteType, getCommand_cb);			
		});
	});

	httpReq.on('error', function(e) {
		//logger.error('error send http GET to Main Server; trying resending...', e);
		console.log('error send http GET to Main Server; trying resending...', e);
		connectionMgr.connectToMainServer( remoteID, remoteType, getCommand_cb);
		/*
		setTimeout(function(){ 
			connectToMainServer( remoteID, remoteType);
		}, 10);
		*/
	});

	//logger.info('Connection to Main Server starts');
	console.log('Connection to Main Server starts');
	httpReq.end();

};

module.exports = connectionMgr;