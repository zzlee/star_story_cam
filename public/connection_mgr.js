connectionMgr = {};

connectionMgr.answerMainServer = function( commandID, answerObj, cb ){
	answerObj._command_id = commandID;
	
	$.ajax({
		url: "/internal/command_responses",
		type: "POST",
		headers:  answerObj
	}).done( function (chunk) {
		//console.log('BODY: ');
		//console.dir(chunk);
	}).always(function() {
		if (cb) {
			console.log('cb of answerMainServer is called');
			cb(null);
		}
	});
		
	
};


//long-polling connection to Star Server
connectionMgr.connectToMainServer = function( remoteID, remoteType, getCommand_cb) {
	var dataToSend = {
		remote_id: remoteID,
		remote_type: remoteType
	};
	
	$.ajax({
		url: "/internal/commands",
		type: "GET",
		headers:  dataToSend,
		cache: false
	}).done( function (resData) {
		//console.log('resData: ');
		//console.log(resData);
		if ( resData.type == "COMMAND" ) {
			//process the command sent from Star server
			console.log('COMMAND BODY: '+ resData.body);
			
			var commandID = resData.body._commandID;
			
			if (getCommand_cb) {
				getCommand_cb( commandID, resData.body);				
			}
			
		}			
		//console.log('<done>Connection to Main Server ends');
	}).always(function() {
		//console.log('<always>Connection to Main Server ends');
		console.log('Connection to Main Server ends');
		connectionMgr.connectToMainServer( remoteID, remoteType, getCommand_cb);			
	});
	
	console.log('Connection to Main Server starts');

};
