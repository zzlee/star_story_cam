
var resolve = require('path').resolve
  , path = require('path')
  , fs = require('fs');

//read qrcode message : Start
readQRcode = function(rawStoryFile, callback) {
	var Canvas = require('canvas')
	  , Image = Canvas.Image
	  , qrcode = require('jsqrcode')(Canvas);

	var image = new Image();
	image.onload = function(){
		var result;
		try{
			result = qrcode.decode(image);
			//console.log(result);
			callback(result);
		}catch(e){
			//console.log('null');
			callback(0);
		}
	}
	image.src = resolve(__dirname, rawStoryFile);
	//console.log(image.src);
}
//read qrcode message : End

//search key frame : Start
searchKeyFrame = function(rawStoryFile, videoInfo, callback) {
	var exec = require('child_process').exec
	  , child
	  , err = null
	  , cutTime = 0
	  , i = 0
	  , now = 0
	  , next = 0
	  , continous = 0
	  , frames = videoInfo.nb_frames
	  , width = videoInfo.width
	  , height = videoInfo.height
	  , qrcount = 0;
	
	continousDetect = function(rawStoryFile, cutTime) {
		//console.log(i, 'next loop');
		cutTime = i * 1001 / 30000; //frame count to time
		child = exec('ffmpeg -i ' + resolve(__dirname, rawStoryFile) + ' -y -f image2 -ss ' + cutTime + ' -s ' + width/2 + 'x' + height/2 + ' -vframes 1 ' + resolve(__dirname, 'testQR.png'), function(error, stdout, stderr) {
			if(error) {
				//console.log(error.stack);
				//console.log('Error code: '+error.code);
				//console.log('Signal received: '+error.signal);
				callback(err, null);
			}
		});
		
		child.on('close', function (code) {
			i += 1;
			qrcount++;
			readQRcode(resolve(__dirname, 'testQR.png'), function(next) {
				if(continous > 30) callback(err, (i-30) * 1001 / 30000);
				else if((next - now) == 0) {
					//now = next;
					continous += 1;
					continousDetect(rawStoryFile, cutTime);
				}
				else {
					now = next;
					continous = 0;
					check(rawStoryFile, cutTime);
				}
			});
		});
	}

	check = function(rawStoryFile, cutTime) {
		//console.log(i, 'now loop');
		cutTime = i * 1001 / 30000; //frame count to time
		child = exec('ffmpeg -i ' + resolve(__dirname, rawStoryFile) + ' -y -f image2 -ss ' + cutTime + ' -s ' + width/2 + 'x' + height/2 + ' -vframes 1 ' + resolve(__dirname, 'testQR.png'), function(error, stdout, stderr) {
			if(error) {
				//console.log(error.stack);
				//console.log('Error code: '+error.code);
				//console.log('Signal received: '+error.signal);
				callback(err, null);
			}
		});

		child.on('close', function (code) {
			//call qrcode reader function
			i += 1;		//next frame
			qrcount++;
			//if(i > (frames / 10)) {
			if(i > 30*5) {
				err = 'not found Qr code';
				callback(err, cutTime);
			}
			else {
				readQRcode(resolve(__dirname, 'testQR.png'), function(next) {
					if((now - next) == 1) {
						//callback(err, (i-1) * 1001 / 30000);
						now = next;
						continousDetect(rawStoryFile, cutTime);
					}
					else {
						now = next;
						check(rawStoryFile, cutTime);
					}
				});
			}
		});
	}
	check(rawStoryFile, cutTime);
}
//search key frame : End

//cut out video : Start
videoCut = function(rawStoryFile, outputStoryFile, storyMovieDuration, videoInfo, callback) {
	var exec = require('child_process').exec
	  , child
	  , frames = videoInfo.nb_frames;
	
	searchKeyFrame(resolve(__dirname, rawStoryFile), videoInfo, function(err, cutTime) {
		if(!err) {
			child = exec('ffmpeg -i ' + rawStoryFile + ' -y -ss ' + cutTime + ' -vcodec mpeg4 -acodec copy -q:v 0.01 -t ' + storyMovieDuration + ' ' + outputStoryFile, function(error, stdout, stderr) {
				if(error) {
					//console.log(error.stack);
					//console.log('Error code: '+error.code);
					//console.log('Signal received: '+error.signal);
					callback(err, null);
				}
			});
			
			child.on('close', function (code) {
				fs.unlinkSync(path.join(__dirname, 'testQR.png'));
				callback(err, outputStoryFile);
			});
		}
		else { callback('not found Qr code', null) }
	});
}
//cut out video : End

//read video information : Start
exports.trimStoryMovie = function(rawStoryFile, outputStoryFile, storyMovieDuration, callback) {
	
	if(!(fs.existsSync(rawStoryFile, callback) && outputStoryFile && storyMovieDuration)) {
		callback('err', 'input err!');
	}
	else {
		var probe = require('node-ffprobe');

		probe(rawStoryFile, function(err, probeData) {
			//.streams[0]: video information
			//.streams[1]: audio information
			//.format: container information of the input
			//.metadata: data about data

			//call video cutting function. 
			videoCut(rawStoryFile, outputStoryFile, storyMovieDuration, probeData.streams[0], function(err, result) {
				if(!err) callback(err, result);
				else {
					var exec = require('child_process').exec
					  , child;
					
					child = exec('ffmpeg -i ' + rawStoryFile + ' -y ' + ' -vcodec mpeg4 -acodec copy -q:v 0.01 ' + outputStoryFile, function(error, stdout, stderr) {
					}).on('close', function() {
						fs.unlinkSync(path.join(__dirname, 'testQR.png'));
						callback(err, 'Untrimmed Video Save.');
					});
				}
			});
		});
	}
}
//read video information : End
/*
//winston
var winston = require('winston');
if(!fs.existsSync('./log')) fs.mkdirSync('log');
var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.File({filename: './log/exceptions.log'})]	
});  

global.logger = logger;

trimStoryMovie('D:\\nodejs_work\\star_story_cam\\public\\story_movies\\greeting-50ee77e2fc4d981408000014-20130222T023238273Z\\greeting-50ee77e2fc4d981408000014-20130222T023238273Z__story_raw.mp4', 'D:\\nodejs_work\\star_story_cam\\public\\story_movies\\greeting-50ee77e2fc4d981408000014-20130222T023238273Z\\fmTest_01.avi', 42, function(err, message) {
	if(err) logger.info(new Date() + ' {' + err + ' : ' + message + '}');
	else logger.info('Save to: ' + resolve(__dirname, message));
});
*/
