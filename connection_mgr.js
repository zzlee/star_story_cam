connectionMgr = {};

var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var request = require("request");


var starServerURL;
var remoteID;
require('./system_configuration.js').getInstance(function(config){
    starServerURL = config.HOST_STAR_SERVER;
    remoteID = config.STAR_STORY_CAM_CONTROLLER_ID;
});

connectionMgr.answerMainServer = function( commandID, answerObj, cb ){
    
	answerObj._command_id = commandID;
	answerObj._remote_id = remoteID;
    
    request({
        method: 'POST',
        uri: starServerURL + '/internal/command_responses',
        body:  answerObj,
        json: true
        
    }, function(error, response, body){
        logger.info('status code of sending answer to star_server: ' + response.statusCode);
    });

};


//long-polling connection to Star Server
connectionMgr.connectToMainServer = function( remoteID, remoteType, getCommand_cb) {
	var dataToSend = {
		'remote_id': remoteID,
		'remote_type': remoteType
	};
	
	request({
        method: 'GET',
        uri: starServerURL + '/internal/commands',
        qs: dataToSend,
        json: true
        
    }, function(error, response, body){

        logger.info('Connection to Main Server ends');
        connectionMgr.connectToMainServer( remoteID, remoteType, getCommand_cb);            

        
        if (body) {
            if ( body.type == "COMMAND" ) {
                //process the command sent from Star server
                logger.info('COMMAND BODY:', body.body);
                    
                var commandID = body.body._commandID;
                
                if (getCommand_cb) {
                    getCommand_cb( commandID, body.body);                
                }
            }           
        }
                
    });

	

};

module.exports = connectionMgr;