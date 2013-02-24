storyCamMgr = {};

var fs = require('fs');
var path = require('path');
var workingPath = process.env.STAR_STORY_CAM_CONTROLLER_PROJECT;
var http = require('http');
var url = require('url');
var starServerURL = process.env.HOST_STAR_SERVER;


var connectionHandler = require('./routes/connection_handler.js');

var transfromMovieFromAvcToH264 = function(miixMovieProjectID, finishTranscoding_cb) {

	var projectDir = path.join(workingPath, 'public/story_movies', miixMovieProjectID);
	var sourcePath;
	var targetPath = path.join(projectDir, miixMovieProjectID+'__story_raw.mp4');
	
	var avcToH264 = function(source, target, finishTranscoding_cb) {
			var spawn = require('child_process').spawn;
			var cp    = spawn('mencoder',[source, '-speed', '2', '-ovc', 'copy', '-o',target]);
			
			
			cp.stdout.on('data', function (data) {
				//console.log('stdout: ' + data);
			});

			cp.stderr.on('data', function (errData) {
				//console.log('stderr: ' + errData);
			});

			cp.on('exit', function (code) {
			
				fs.exists(targetPath, function (exists) {
					if (finishTranscoding_cb ) {
						if (exists) {
							finishTranscoding_cb(null);
						}		
						else {
							finishTranscoding_cb('Fail to transform avc to H264');
						}
					}							
				});
			});
	
	
	
	}
	
	fs.readdir( projectDir, function(err, files){
		var avcFile = null;
		if (err) {
			if (finishTranscoding_cb) {
				finishTranscoding_cb(err);
			}
		}
		else {
			for (var i=0; i < files.length; i++) {
				if ( files[i].toString().split('.').pop() == 'avc' ) {
					avcFile = files[i];
				}
			}
			
			if ( avcFile == null ) {
				if (finishTranscoding_cb) {
					finishTranscoding_cb('No avc file exists!');
				}
			}
			else {
				sourcePath = path.join(projectDir, avcFile);
				console.log( 'sourcePath= %s', sourcePath);
				avcToH264( sourcePath, targetPath, function(err2){
					if (finishTranscoding_cb) {
						finishTranscoding_cb(err2);
					}
				});
			}
		}
		
	});

}

var informMainServerAboutAvailableStoryMovie = function(miixMovieProjectID, finishInforming_cb) {
	var options = {
		host: url.parse(starServerURL).hostname,
		headers: {miix_movie_project_id: miixMovieProjectID},
		path: '/internal/story_cam_controller/available_story_movie',
		method: 'POST'
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
		logger.info('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			logger.info('BODY: ' + chunk);
		}).on('end', function() {
			if (finishInforming_cb) {
				finishInforming_cb(null);
			}
			//logger.info('['+ movieProjectID +'] Successfully answered Star Server');
		});
	});

	httpReq.on('error', function(e) {
		//logger.info('['+ movieProjectID +'] Http error on answering Star Server: ' + e.message);
		if (finishInforming_cb) {
			finishInforming_cb(e.message);
		}

	});

	// write data to request body
	//httpReq.write( JSON.stringify(dataToAnswerServer) );
	httpReq.end();


}

storyCamMgr.startRecording = function( miixMovieProjectID, startedRecording_cb ) {

	console.log("story cam starts recording");
	storyCamMgr.currentStoryMoive = miixMovieProjectID;
	
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

var qrcode = require('./routes/trimStoryMoive.js');

storyCamMgr.stopRecording = function( stoppedRecording_cb ) {

	console.log("story cam stops recording");
	
	var storyCamID = 'browser_controlling_cam_0';

	var commandParameters = null;
	
	connectionHandler.sendRequestToRemote( storyCamID, { command: "STOP_RECORDING", parameters: commandParameters }, function(responseParameters) {
	
		transfromMovieFromAvcToH264( storyCamMgr.currentStoryMoive, function(err) {
			//JF
			var miixMovieProjectID = storyCamMgr.currentStoryMoive;
			var source =  path.join(workingPath, 'public/story_movies', miixMovieProjectID, miixMovieProjectID+'__story_raw.mp4');
			var target =  path.join(workingPath, 'public/story_movies', miixMovieProjectID, miixMovieProjectID+'__story.avi');

		    qrcode.trimStoryMovie(source, target, 48, function(err, message) {
				//console.dir(responseParameters);
				if(err) logger.info(new Date() + ' {' + err + ' : ' + message + '}');
				else logger.info('Save to: ' + target);
				
				//GZ
				informMainServerAboutAvailableStoryMovie(storyCamMgr.currentStoryMoive);
			});
			
			
		});
		
		if (stoppedRecording_cb )  {
			stoppedRecording_cb(responseParameters);
		}
	
	});
	
}

module.exports = storyCamMgr;

/*
//test 
transfromMovieFromAvcToH264('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function(err){
	console.log('transfromMovieFromAvcToH264() err= %s', err);
});

//winston
var winston = require('winston');
var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.File({filename: './log/exceptions.log'})]	
});  

global.logger = logger; 

informMainServerAboutAvailableStoryMovie('greeting-50ee77e2fc4d981408000014-20130222T023238273Z');
*/
