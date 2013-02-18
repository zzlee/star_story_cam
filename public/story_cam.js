storyCam = {};

storyCam.startRecording = function( miixMovieProjectID, startedRecording_cb ) {

	console.log("story cam starts recording miixMovieProject " + miixMovieProjectID);
	var result ={
		err: null
	};
	if (startedRecording_cb) {
		startedRecording_cb(result);
	}
}

storyCam.stopRecording = function( stoppedRecording_cb ) {

	console.log("story cam stops recording");
	//alert("story cam stops recording");
	var result ={
		err: null
	};
	if (stoppedRecording_cb) {
		stoppedRecording_cb(result);
	}

}
