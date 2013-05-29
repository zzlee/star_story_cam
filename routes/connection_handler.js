var connectionHandler = {};

var events = require("events");
var eventEmitter = new events.EventEmitter();


connectionHandler.commandResponse_post_cb = function(req, res) {

	var commandID = req.body._command_id;
	var responseParameters = req.body;

	eventEmitter.emit('RESPONSE_'+commandID, responseParameters);
	logger.info('Got response ' + commandID + 'from ' + this.name + ' :' );
	logger.info(JSON.stringify(responseParameters));
	
	res.send('');
};


connectionHandler.sendRequestToRemote = function( targetID, reqToRemote, cb ) {
	//TODO: make sure reqToRemote is not null
	reqToRemote._commandID = reqToRemote.command + '__' + targetID + '__' + (new Date()).getTime().toString();
	eventEmitter.emit('COMMAND_'+targetID, reqToRemote);
	
	eventEmitter.once('RESPONSE_'+reqToRemote._commandID, cb);
};

connectionHandler.command_get_cb = function(req, res) {
	//console.log('['+ new Date() +']Got long-polling HTTP request from remote: '+ req.headers.remote_id );
	logger.info('['+ new Date() +']Got long-polling HTTP request from remote: '+ req.headers.remote_id );
	//console.dir(req);
	
	var messageToRemote = new Object();
	
	var callback = function(reqToRemote){
		//logger.info(reqToRemote);
		clearTimeout(timer);
		messageToRemote.type = "COMMAND";
		messageToRemote.body = reqToRemote;
		res.send(messageToRemote);
	};

	var timer = setTimeout(function(){ 
		eventEmitter.removeListener('COMMAND_'+req.headers.remote_id, callback);
		messageToRemote.type = "LONG_POLLING_TIMEOUT";
		messageToRemote.body = null;
		res.send(messageToRemote);
	}, 30000);	
	//}, 5000);	
	
	eventEmitter.once('COMMAND_'+req.headers.remote_id, callback);	
};

module.exports = connectionHandler;