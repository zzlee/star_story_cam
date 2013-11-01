var exposureTime = [
    //0-5
    2.414, 2.414, 2.414, 2.414, 1.0, 1.0,
    //6-11
    1.0, 1.0, 1.0, 1.80, 1.00, 1.00,
    //12-17
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
    //18-23
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0
];

var gainTime = [
    //0-5
    -1.0, -1.0, -1.0, -1.0, -1.0, 38.0,
    //6-11
    -1.0, -1.0, -1.0, 8.0, 8.0, 8.0,
    //12-17
    -1.0, -1.0, -1.0, -1.0, -1.0, 17,
    //18-23
    17, 17, 17, 17, 17, 17
];

var frameRate = 27.0;

storyCamMgr = {};

var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();
var http = require('http');
var url = require('url');
var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var starServerURL;

var awsS3 = require('./aws_s3.js');
var request = require('request');
var async = require('async');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var exe_recording = path.join(__dirname + '/FC_test32/x64/Release/FC_test.exe');
// var exe_shutter = path.join(__dirname + '/FC_test32/x64/Release/FC_ImageRetrieved_test.exe');
var exe_shutter = path.join(__dirname + '/FC_test32/Release_x64/ImageShutterByTimeTrigger.exe');
var recordLimit = 0;
// var starServerURL;

require('./system_configuration.js').getInstance(function(config){
    starServerURL = config.HOST_STAR_SERVER;
});

require('./system_configuration.js').getInstance(function(config){
    starServerURL = config.HOST_STAR_SERVER;
});

var connectionHandler = require('./routes/connection_handler.js');

var transfromMovieFromAvcToH264 = function(miixMovieProjectID, finishTranscoding_cb) {

	var projectDir = path.join(workingPath, 'public/story_movies', miixMovieProjectID);
	var sourcePath;
	var targetPath = path.join(projectDir, miixMovieProjectID+'__story_raw.mp4');
	
	var avcToH264 = function(source, target, finishTranscoding_cb) {
			var spawn = require('child_process').spawn;
			var cp    = spawn('mencoder',[source, '-speed', '1', '-ovc', 'copy', '-o',target]);
			
			
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
	
	
	
	};
	
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
				//console.log( 'sourcePath= %s', sourcePath);
				avcToH264( sourcePath, targetPath, function(err2){
					if (finishTranscoding_cb) {
						finishTranscoding_cb(err2);
					}
				});
			}
		}
		
	});

};

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


};

storyCamMgr.startRecording = function( miixMovieProjectID, startedRecording_cb ) {

	//console.log("story cam starts recording");
	logger.info("story cam starts recording");
	storyCamMgr.currentStoryMoive = miixMovieProjectID;
	
	var storyCamID = 'browser_controlling_cam_0';

	var commandParameters = {
		movieProjectID: miixMovieProjectID
	};
    
	recordLimit += 1;
    
    //var recordID = miixMovieProjectID + storyCamMgr.playTime;
	
	/*
    var PGRrecord = spawn(exe_recording, ['20', storyCamMgr.playTime + '.mp4']);

    PGRrecord.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	PGRrecord.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});
    PGRrecord.on('close', function (code) {
        //console.log('child process exited with code ' + code);
        //move file to specify folder
		logger.info('Record end: ' + storyCamMgr.playTime);
        var source = fs.createReadStream(storyCamMgr.playTime + '-0000.mp4');
        var dest = fs.createWriteStream('./public/story_movies/' + storyCamMgr.playTime + '__story_raw.mp4');
        source.pipe(dest);
        source.on('end', function() { 
            fs.unlinkSync(storyCamMgr.playTime + '-0000.mp4');
        });
    });
	*/
	if(recordLimit == 1) {
		storyCamMgr.playTime = new Date().getTime();
		//console.log(storyCamMgr.playTime);
        logger.info('Record start: ' + storyCamMgr.playTime);
		
		execFile(exe_recording, ['30', storyCamMgr.playTime, exposureTime[new Date(storyCamMgr.playTime).getHours()], frameRate, gainTime[new Date(storyCamMgr.playTime).getHours()]], function(err, stdout, stderr){
			//console.log('stdout: ' + stdout);
			logger.info('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			logger.info('stderr: ' + stderr);
			logger.info('Record end: ' + storyCamMgr.playTime);
			var source = fs.createReadStream(storyCamMgr.playTime + '-0000.mp4');
			//var dest = fs.createWriteStream('./public/story_movies/' + storyCamMgr.playTime + '__story_raw.mp4');
			var dest = fs.createWriteStream('./public/story_movies/' + storyCamMgr.playTime + '__story.avi');
			source.pipe(dest);
			source.on('end', function() { 
				fs.unlinkSync(storyCamMgr.playTime + '-0000.mp4');
				recordLimit = 0;
				
				var target =  path.join(workingPath, 'public/story_movies', storyCamMgr.playTime+'__story.avi');
				var s3Path =  '/camera_record/' + storyCamMgr.playTime + '/'+ storyCamMgr.playTime+'__story.avi';
                awsS3.uploadToAwsS3(target, s3Path, 'video/x-msvideo', function(err,result){
                    if (!err){
                        logger.info('Story movie was successfully uploaded to S3 '+s3Path);
                     }
                    else {
                        logger.info('Story movie failed to be uploaded to S3 '+s3Path);
                    }
                    
                    answerObj = {
                            err: err
                    };
                    //connectionMgr.answerMainServer(commandID, answerObj);
                    // console.log(starServerURL + '/available_street_movies/' + storyCamMgr.playTime);
                    request.put(starServerURL + '/available_street_movies/' + storyCamMgr.playTime);
                });
				
			});
		});
	}
	
	connectionHandler.sendRequestToRemote( storyCamID, { command: "START_RECORDING", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (startedRecording_cb )  {
			startedRecording_cb(responseParameters);
		}
	});
			
};

var qrcode = require('./routes/trimStoryMoive.js');

storyCamMgr.stopRecording = function( stoppedRecording_cb ) {

	//console.log("story cam stops recording");
	logger.info("story cam stops recording");
	
	var storyCamID = 'browser_controlling_cam_0';

	var commandParameters = null;
	
	connectionHandler.sendRequestToRemote( storyCamID, { command: "STOP_RECORDING", parameters: commandParameters }, function(responseParameters) {
	
		transfromMovieFromAvcToH264( storyCamMgr.currentStoryMoive, function(err) {
			//JF
			var miixMovieProjectID = storyCamMgr.currentStoryMoive;
			//var source =  path.join(workingPath, 'public/story_movies', miixMovieProjectID, miixMovieProjectID + storyCamMgr.playTime+'__story_raw.mp4');
			//var target =  path.join(workingPath, 'public/story_movies', miixMovieProjectID, miixMovieProjectID + storyCamMgr.playTime+'__story.avi');
            var source =  path.join(workingPath, 'public/story_movies', storyCamMgr.playTime + '__story_raw.mp4');
            var target =  path.join(workingPath, 'public/story_movies', storyCamMgr.playTime+'__story.avi');
            
		    qrcode.trimStoryMovie(source, target, 48, function(err, message) {
				//console.dir(responseParameters);
				if(err) logger.info(new Date() + ' {' + err + ' : ' + message + '}');
				else logger.info('Save to: ' + target);
				
				//GZ
				informMainServerAboutAvailableStoryMovie(storyCamMgr.currentStoryMoive);
                
                //JF
                //add upload amazon and put to star server.
                var s3Path =  '/user_project/' + storyCamMgr.playTime + '/'+ storyCamMgr.playTime+'__story.avi';
                awsS3.uploadToAwsS3(target, s3Path, 'video/x-msvideo', function(err,result){
                    if (!err){
                        logger.info('Story movie was successfully uploaded to S3 '+s3Path);
                     }
                    else {
                        logger.info('Story movie failed to be uploaded to S3 '+s3Path);
                    }
                    
                    answerObj = {
                            err: err
                    };
                    //connectionMgr.answerMainServer(commandID, answerObj);
                    request.put(starServerURL + '/available_street_movies/' + storyCamMgr.playTime);
                });
			});
			
			
		});
		
		if (stoppedRecording_cb )  {
			stoppedRecording_cb(responseParameters);
		}
	
	});
	
};

storyCamMgr.startShutter = function( shutterSetting, startedShutter_cb ) {
    
    // console.log("story cam starts shutter");
    
    storyCamMgr.playTime = new Date().getTime();
    logger.info('story cam starts shutter, Record start: ' + storyCamMgr.playTime);
    
    var programAction = shutterSetting.actionSetting;
	var storyCamID = 'browser_controlling_cam_0';
	var commandParameters = {
		movieProjectID: shutterSetting.miixMovieProjectID
	};
    storyCamMgr.currentStoryMoive = shutterSetting.miixMovieProjectID;
    
    var livePhotos = [];
    var times = 0;
    var shutterOption = new EventEmitter();
    
    var timeTrigger = function(actionTime){
        console.log('shutter time: ' + times + ', duration: ' + actionTime);
        // var delay = actionTime * 1000;

        // setTimeout(function(){
            // /* shutter on */
            // var filename = storyCamMgr.playTime + '-' + times;
            // filename = path.join(workingPath, 'public/live_photos', filename);
            // execFile(exe_shutter, [filename, exposureTime[new Date(storyCamMgr.playTime).getHours()], frameRate, gainTime[new Date(storyCamMgr.playTime).getHours()]], function(err, stdout, stderr){
                // var photosArr = stdout.toString().split(",");
                // logger.info('live photos: ' + photosArr);
                // logger.info('live photos miss: ' + stderr);
                // livePhotos.push(photosArr);
                // times++;
                /* (times != programAction.length)?timeTrigger(programAction[times]):shutterOption.emit('close', 'done'); */
                // (times != programAction.length)?'':shutterOption.emit('close', 'done');
            // });
            // times++;
            // (times != programAction.length)?timeTrigger(programAction[times]):'';
        // }, delay);
        
        var filename = path.join(workingPath, 'public/live_photos', storyCamMgr.playTime.toString());
        var action = '[' + actionTime.toString().replace(' ','') + ']';
        
        var shutter = spawn(exe_shutter, [
                            '-o', filename, 
                            '-e', exposureTime[new Date(storyCamMgr.playTime).getHours()], 
                            '-g', gainTime[new Date(storyCamMgr.playTime).getHours()], 
                            '-f', frameRate, 
                            '-t', action
                            ]);

        shutter.stdout.on('data', function (data) {
            // console.log('stdout: ' + data);
            livePhotos.push(data.toString().replace(/\r?\n/g,'').split(","));
        });
        shutter.stderr.on('data', function (data) { /* console.log('stderr: ' + data); */ });
        shutter.on('close', function (code) {
            // console.log('child process exited with code ' + code);
            shutterOption.emit('close', 'done');
        });
        
    };
    // timeTrigger(programAction[times]);
    timeTrigger(programAction);
    
    shutterOption.once('close', function(status){
        // console.dir(livePhotos);
        var part = 0;
        
        var uploadAwsS3 = function(source, s3_cb){
            var target = source;
            var s3Filename = source.split("\\");
            var s3Path = '/camera_record/' + storyCamMgr.playTime + '/'+ s3Filename[s3Filename.length-1];
            awsS3.uploadToAwsS3(target, s3Path, 'image/jpeg', function(err, res){
                if (!err){
                    logger.info('Live photo was successfully uploaded to S3 '+s3Path);
                }
                else {
                    logger.info('Live photo failed to be uploaded to S3 '+s3Path);
                }
                s3_cb(null, 'done');
            });
        };
        
        var uploadConsole = function(target, event){
            event.push(function(callback){ uploadAwsS3(target, callback); });
        };
        
        var execute = [];
        for(var i=0; i<livePhotos.length; i++) {
            for(var j=0; j<livePhotos[i].length; j++) {
                uploadConsole(livePhotos[i][j], execute);
            }
        }
        
        async.series(execute, function(err, res){
            // (err)?console.dir(err):console.dir(res);
            // (err)?validExpired_cb(err, null):validExpired_cb(null, 'done');
            // request.put(starServerURL + '/available_street_movies/' + storyCamMgr.playTime);
            // console.log(starServerURL + '/available_street_movies/' + storyCamMgr.playTime);
            request.put(starServerURL + '/available_street_photos/' + storyCamMgr.playTime);
            // console.log(starServerURL + '/available_street_photos/' + storyCamMgr.playTime);
            logger.info('Send PUT request to server: '+ starServerURL + '/available_street_photos/' + storyCamMgr.playTime);
        });
        
    });
    
};

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
