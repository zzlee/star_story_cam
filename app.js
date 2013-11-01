
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var schedule = require('node-schedule');
var workingPath = process.cwd();

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);


//GZ
app.get('/internal/commands', routes.connectionHandler.command_get_cb);
app.post('/internal/command_responses', routes.connectionHandler.commandResponse_post_cb);

app.put('/internal/responses_of_serverside_browser_session/:moduleId/:sessionId', routes.serverSideBrowserHandler.putResponsesOfServersideBrowserSession);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


//winston
var winston = require('winston');

//JF
if(!fs.existsSync('./log')) fs.mkdirSync('log');

var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.File({filename: './log/exceptions.log'})]	
});  

global.logger = logger; 


//long polling to Main Server
var connectionMgr = require( './connection_mgr.js' );
var storyCamMgr = require( './story_cam_mgr.js' );
var ftpMgr = require( './ftp_mgr.js' );
var awsS3 = require('./aws_s3.js');

var storyCamControllerID;
require('./system_configuration.js').getInstance(function(config){
    storyCamControllerID = config.SERVER_ID;                               
});

var recordLimit = 0;
var recordExecute = function(control){
	switch(control)
	{
		case 'on':
			recordLimit += 1;
			break;
		case 'off':
			recordLimit = 0;
			break;
	}
};

setTimeout(function(){ 
	connectionMgr.connectToMainServer(1, function( commandID, resDataBody ){
		
		if (resDataBody.command == "START_RECORDING") {
			//recordExecute('on');
			//if(recordLimit == 1){
				storyCamMgr.startRecording(resDataBody.parameters.movieProjectID, function(result){
					var answerObj = {
						err: result.err,
					};
					connectionMgr.answerMainServer(commandID, answerObj);
					//console.log(recordLimit);
					//recordExecute('off');
				});
				
			//}
		}
		else if (resDataBody.command == "STOP_RECORDING") {
			storyCamMgr.stopRecording( function(result){
				var answerObj = {
					err: result.err,
				};
				connectionMgr.answerMainServer(commandID, answerObj);							
			});
		}	
		else if (resDataBody.command == "UPLOAD_STORY_MOVIE_TO_MAIN_SERVER") {
			ftpMgr.uploadStoryMovieToMainServer(resDataBody.parameters.movieProjectID, function(result){
				answerObj = {
					err: result.err,
					file_size: result.fileSize
				};
				connectionMgr.answerMainServer(commandID, answerObj);
			});
		}
        else if (resDataBody.command == "UPLOAD_STORY_MOVIE_TO_S3") {
            //upload to S3
        	var movieProjectID = resDataBody.parameters.movieProjectID;
            var storyMovieLocalPath = path.join(workingPath, 'public/story_movies', movieProjectID, movieProjectID+'__story.avi');
            var s3Path =  '/user_project/' + movieProjectID + '/'+ movieProjectID+'__story.avi';
            //console.log('s3Path = %s', s3Path);
            awsS3.uploadToAwsS3(storyMovieLocalPath, s3Path, 'video/x-msvideo', function(err,result){
                if (!err){
                    logger.info('Story movie was successfully uploaded to S3 '+s3Path);
                 }
                else {
                    logger.info('Story movie failed to be uploaded to S3 '+s3Path);
                }
                
                answerObj = {
                        err: err
                };
                connectionMgr.answerMainServer(commandID, answerObj);
            });
        }
        else if (resDataBody.command == "CONNECTION_TEST") {
            console.log("Got the command "+resDataBody.command+" with parameters");
            console.dir(resDataBody.parameters);            
            
            answerObj = {
                testPara1: "test 1",
                testPara2: "test 2"
            };
            connectionMgr.answerMainServer(commandID, answerObj);
        }
        else if (resDataBody.command == "START_SHUTTER") {
			//recordExecute('on');
			//if(recordLimit == 1){
				storyCamMgr.startShutter(resDataBody.parameters, function(result){
					var answerObj = {
						err: result.err,
					};
					connectionMgr.answerMainServer(commandID, answerObj);
					//console.log(recordLimit);
					//recordExecute('off');
				});
				
			//}
		}
	
	});
}, 10);


// close process and restart by supervior
logger.info('start story camera: ' + new Date());

var rule_0900 = new schedule.RecurrenceRule();
rule_0900.dayOfWeek = [new schedule.Range(0, 6)];
rule_0900.hour = 9;
rule_0900.minute = 0;

var restart_0900 = schedule.scheduleJob(rule_0900, function(){
    logger.info('close story camera: ' + new Date());
    process.exit(1);
});

var rule_1200 = new schedule.RecurrenceRule();
rule_1200.dayOfWeek = [new schedule.Range(0, 6)];
rule_1200.hour = 12;
rule_1200.minute = 0;

var restart_1200 = schedule.scheduleJob(rule_1200, function(){
    logger.info('close story camera: ' + new Date());
    process.exit(1);
});


//setTimeout(function() {
//    var exposureMeterBroker = require('./exposure_meter_broker.js').getInstance();
//    var imageUrl = '/exposure_meter/test/grey_scale_sample.jpg';
//    var area = {x:110, y:110, width: 20, height: 20};
//    
//    exposureMeterBroker.getExposureOfArea(imageUrl, area, function(err, result){
//        //console.log('exposure=');
//        //console.dir(exposure);
//        console.log('exposure='+result.exposure);
//        
//    });
//    
//}, 3000);


//setTimeout(function() {
//    storyCamMgr = require('./story_cam_mgr.js');
//    console.log('storyCamMgr.startRecording()');
//    storyCamMgr.startRecording('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function( resParametes) {
//        console.log('started recording. Response:');
//        console.dir(resParametes);
//    });
//}, 5000);

