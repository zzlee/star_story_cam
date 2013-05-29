//ftp_mgr.js of star_story_cam

var ftpMgr = {};

var fs = require('fs');
var path = require('path');
var url=require('url');
var workingPath = process.cwd();
var ftpUserID;
var ftpUserPSW;
var ftpServer;
require('./system_configuration.js').getInstance(function(config){
    ftpUserID = config.STAR_FTP_ID;                     
    ftpUserPSW = config.STAR_FTP_PSW;                   
    ftpServer = url.parse(config.HOST_STAR_SERVER).host;
});

ftpMgr.uploadStoryMovieToMainServer = function(movieProjectID, uploadFinished_cb) {
	var storyMoviePath = path.join(workingPath, 'public/story_movies', movieProjectID, movieProjectID+'__story.avi');

	var ftpContent ='';
	ftpContent += ftpUserID+'\n';
	ftpContent += ftpUserPSW+'\n';
	ftpContent += 'put '+storyMoviePath+'\n';
	ftpContent += 'close\n';
	ftpContent += 'bye\n';
	
	var tempDir = path.join(workingPath, 'temp');
	fs.exists(tempDir, function (exists) {
		if (!exists) {
			fs.mkdirSync(tempDir);
		}
		
		var ftpSettingFilePath = path.join(tempDir, 'ftp-'+movieProjectID+'.txt');
		//console.log('ftpServer= %s', ftpServer);
		
		fs.writeFile(ftpSettingFilePath, ftpContent, function (err) {
			if (!err) {
				var spawn = require('child_process').spawn;
				//var cp    = spawn('cmd',['/c', workingPath+'\\ftp', '-s:_ftp_setting.txt', ftpServer,'\n'],{ encoding: 'utf8'});
				var cp    = spawn('cmd',['/c', 'ftp', '-s:'+ftpSettingFilePath, ftpServer,'\n']);
				
				
				cp.stdout.on('data', function (data) {
					//console.log('stdout: ' + data);
				});

				cp.stderr.on('data', function (errData) {
					//console.log('stderr: ' + data);
					var result ={
						err: errData,
						fileSize: 0
					};
					
					if (uploadFinished_cb ) {
						uploadFinished_cb(result);
					}					
					
					fs.unlink(ftpSettingFilePath);
				});

				cp.on('exit', function (code) {
					logger.info('ftp child process exited with code : ' + code);
					
					fs.stat( storyMoviePath, function(err2, stats){
						if (!err2){
							var result ={
								err: null,
								fileSize: stats.size
							};
							
							if (uploadFinished_cb ) {
								uploadFinished_cb(result);
							}					
						}
						else {
							var result ={
								err: 'Failed to get file size',
								fileSize: 0
							};
							
							if (uploadFinished_cb ) {
								uploadFinished_cb(result);
							}					
						}
						
						fs.unlink(ftpSettingFilePath);
					})
					
					
				});
			}
			else {
				var result ={
					err: 'File to write ftp-xxx.txt: '+err,
					fileSize: 0
				};
				
				if (uploadFinished_cb ) {
					uploadFinished_cb(result);
				}					
			}
		});
	});
	
										
}

module.exports = ftpMgr;

//for test
//ftpMgr.uploadStoryMovieToMainServer('greeting-50c99d81064d2b841200000a-20130129T105730808Z');
