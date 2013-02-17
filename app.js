
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
  app.set('port', process.env.PORT || 3000);
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
		};
	
	});
}, 10);

