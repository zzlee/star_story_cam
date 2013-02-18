storyCamMgr = {};

var connectionHandler = require('./routes/connection_handler.js');

storyCamMgr.startRecording = function( miixMovieProjectID, startedRecording_cb ) {

	console.log("story cam starts recording");
	
	var storyCamID = 'browser_controlling_cam_0';

	var commandParameters = {
		movieProjectID: miixMovieProjectID
	};
	
	connectionHandler.sendRequestToRemote( storyCamID, { command: "START_RECORDING", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (startedRecording_cb )  {
			startedRecording_cb(responseParameters);
		}
	});
			
}

storyCamMgr.stopRecording = function( stoppedRecording_cb ) {

	console.log("story cam stops recording");
	
	var storyCamID = 'browser_controlling_cam_0';

	var commandParameters = null;
	
	connectionHandler.sendRequestToRemote( storyCamID, { command: "STOP_RECORDING", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (stoppedRecording_cb )  {
			stoppedRecording_cb(responseParameters);
		}
	});
	
}

module.exports = storyCamMgr;