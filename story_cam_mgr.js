storyCamMgr = {};

storyCamMgr.startRecording = function( movieProjectID, startedRecording_cb ) {

	console.log("story cam starts recording");
	var result ={
		err: null
	};
	if (startedRecording_cb) {
		startedRecording_cb(result);
	}
}

storyCamMgr.stopRecording = function( stoppedRecording_cb ) {

	console.log("story cam stops recording");
	var result ={
		err: null
	};
	if (stoppedRecording_cb) {
		stoppedRecording_cb(result);
	}


}

module.exports = storyCamMgr;