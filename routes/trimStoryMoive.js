
var resolve = require('path').resolve;

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
			callback(result);
		}catch(e){
			callback(0);
		}
	}
	image.src = resolve(__dirname, rawStoryFile);
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
		cutTime = i * 1001 / 30000; //frame count to time
		child = exec('ffmpeg -i ' + resolve(__dirname, rawStoryFile) + ' -y -f image2 -ss ' + cutTime + ' -s ' + width/2 + 'x' + height/2 + ' -vframes 1 testQR.png', function(error, stdout, stderr) {
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
			readQRcode('testQR.png', function(next) {
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
		cutTime = i * 1001 / 30000; //frame count to time
		child = exec('ffmpeg -i ' + resolve(__dirname, rawStoryFile) + ' -y -f image2 -ss ' + cutTime + ' -s ' + width/2 + 'x' + height/2 + ' -vframes 1 testQR.png', function(error, stdout, stderr) {
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
			if(i > frames) {
				err = 'not found Qr code';
				callback(err, cutTime);
			}
			else {
				readQRcode('testQR.png', function(next) {
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
				callback(err, outputStoryFile);
			});
		}
		else { callback('not found Qr code', null) }
	});
}
//cut out video : End

//read video information : Start
exports.trimStoryMovie = function(rawStoryFile, outputStoryFile, storyMovieDuration, callback) {
	var probe = require('node-ffprobe');

	probe(rawStoryFile, function(err, probeData) {
		//.streams[0]: video information
		//.streams[1]: audio information
		//.format: container information of the input
		//.metadata: data about data

		//call video cutting function. 
		videoCut(rawStoryFile, outputStoryFile, storyMovieDuration, probeData.streams[0], function(err, result) {
			callback(err, result);
		});
	});
}
//read video information : End
/*
trimStoryMovie('M4H03729.MP4', 'fmTest_01.avi', 48, function(err, message) {
	if(err) console.log(err);
	else console.log('Save to: ' + resolve(__dirname, message));
});
*/
