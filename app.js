
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

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
app.get('/users', user.list);

//GZ
app.get('/internal/commands', routes.command_get_cb);
app.post('/internal/command_responses', routes.commandResponse_post_cb);



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
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


//long polling to Main Server
var connectionMgr = require( './connection_mgr.js' );
var storyCamMgr = require( './story_cam_mgr.js' );
var ftpMgr = require( './ftp_mgr.js' );
  
setTimeout(function(){ 
	connectionMgr.connectToMainServer(process.env.STAR_STORY_CAM_CONTROLLER_ID, 'STORY_CAM_CONTROLLER', function( commandID, resDataBody ){
		
		if (resDataBody.command == "START_RECORDING") {
			storyCamMgr.startRecording(resDataBody.parameters.movieProjectID, function(result){
				var answerObj = {
					err: result.err,
				};
				connectionMgr.answerMainServer(commandID, answerObj);							
			});
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
		};
	
	});
}, 10);

/*
setTimeout(function(){
	storyCamMgr = require('./story_cam_mgr.js');
	console.log('storyCamMgr.startRecording()');
	storyCamMgr.startRecording('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function(resParametes){
		console.log('started recording. Response:');
		console.dir(resParametes);
	});
}, 5000);
*/
