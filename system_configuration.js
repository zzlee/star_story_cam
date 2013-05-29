var xml2js = require('xml2js');
var path = require('path');
var fs = require('fs');

var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;
    
    
    


FM.confuguration = (function(){
    var uInstance = null;
    
    function constructor(constructed_cb){
        
        var workingPath = process.cwd();
        

        var parser = new xml2js.Parser();
        parser.addListener('end', function(result) {
            var resultObj = {};
            var systemConfigXML;
            if (result.systemConfiguration){
                systemConfigXML= result.systemConfiguration;
                if (systemConfigXML.STAR_STORY_CAM_CONTROLLER_ID)
                    resultObj.STAR_STORY_CAM_CONTROLLER_ID = systemConfigXML.STAR_STORY_CAM_CONTROLLER_ID[0];
                if (systemConfigXML.MENCODER_BIN)
                    resultObj.MENCODER_BIN = systemConfigXML.MENCODER_BIN[0];
                if (systemConfigXML.FFMPEG_BIN)
                    resultObj.FFMPEG_BIN = systemConfigXML.FFMPEG_BIN[0];
                if (systemConfigXML.HOST_STAR_SERVER)
                    resultObj.HOST_STAR_SERVER = systemConfigXML.HOST_STAR_SERVER[0];
                if (systemConfigXML.STAR_FTP_ID)
                    resultObj.STAR_FTP_ID = systemConfigXML.STAR_FTP_ID[0];
                if (systemConfigXML.STAR_FTP_PSW)
                    resultObj.STAR_FTP_PSW = systemConfigXML.STAR_FTP_PSW[0];
                constructed_cb(resultObj);
            }
            else{
                constructed_cb(null);                
            }
        });
        fs.readFile( path.join(workingPath, 'system_configuration.xml'), function(err, data) {
            if (!err) {
                parser.parseString(data);
            }
            else {
                console.log( 'Fail to read configuration.xml: '+err );
                console.log( 'If it does not exist, copy from a template in /setup folder ');
                constructed_cb(null);
            }
        });   
        
    };
    
    
    return {
        getInstance: function(gotInstance_cb){
            if(!uInstance){
                constructor(function(resultInstance){
                    uInstance = resultInstance;
                    gotInstance_cb(uInstance);
                });
            }
            else{
                gotInstance_cb(uInstance);
            };
        }
    };
    
})();

//TEST
/*
FM.confuguration.getInstance(function(_rInstance){
    console.dir(_rInstance);
});
setTimeout(function(){
    FM.confuguration.getInstance(function(_rInstance){
        console.dir(_rInstance);
    });
},5000);
*/

module.exports = FM.confuguration;