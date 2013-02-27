var projectPath = 'D:\\nodejs_projects\\star_story_cam';

storyCam = {};


storyCam.userId = 0;

storyCam.init = function() {
	storyCam.tt = document.getElementById("ATT");	
}


storyCam.startRecording = function( miixMovieProjectID, startedRecording_cb ) {

	//console.log("story cam starts recording miixMovieProject " + miixMovieProjectID);
	
	var recordpath = projectPath+'\\public\\story_movies\\'+miixMovieProjectID;
	
	var error;
	var ok = storyCam.tt.RecordOn(storyCam.userId, recordpath);
	
	if ( ok ) {
		error = null;
		$('#status').html('Recording....');
	}
	else {
		error = 'Fail to start recording';
	};
	
	var result ={
		err: error
	};

	if (startedRecording_cb) {
		startedRecording_cb(result);
	}
}

storyCam.stopRecording = function( stoppedRecording_cb ) {

	//console.log("story cam stops recording");
	
	var error;
	var ok = storyCam.tt.RecordOff(storyCam.userId);
	$('#status').html('---');;
	
	if ( ok ) {
		error = null;
	}
	else {
		error = 'Fail to start recording';
	};

	
	//alert("story cam stops recording");
	var result ={
		err: error
	};
	if (stoppedRecording_cb) {
		stoppedRecording_cb(result);
	}

}
