/**
 * @fileoverview Implementation of ExposureMeter
 */


var ExposureMeterBroker = (function() {
    var uInstance = null;    

    function constructor() {
        
        var callbacks = {};
        
        var obj = {
            // ==public service of ExposureMeter
            
                
            /**  
             * @method getExposureOfArea
             * @memberof ExposureMeter#
             * 
             * Get the exposure value of a specific area in an image
             * 
             * @param {String} imageUrl The url of the image to measure its exposure 
             * 
             * @param {Object} area The area in the image where the mean of exposure values are taken
             * 
             * @param {Function} cbOfGetExposureOfArea The callback fucntion called when it finishes calculating the final exposure value
             */
            getExposureOfArea: function(imageUrl, area, cbOfGetExposureOfArea) {
                //console.log('getExposureOfArea() is called.');
                var sessionId = (new Date()).getTime() + '-' + Math.round(Math.random()*10000000);
                
                var queryString = '?imageUrl='+imageUrl
                                 +'&area_x='+area.x
                                 +'&area_y='+area.y
                                 +'&area_width='+area.width
                                 +'&area_height='+area.height
                                 +'&sessionId='+sessionId;
                
                var spawn = require('child_process').spawn;
                var ls    = spawn('chrome.exe', ['http://localhost:3001/exposure_meter/exposure_metering_agent.html'+queryString]);

    
                ls.stderr.on('data', function (data) {
                    //console.log('stderr: ' + data);
                    logger.info('child process launching Chrome.exe outputsed stderr:' + code);
                });
    
                ls.on('close', function (code) {
                    //console.log('child process exited with code ' + code);
                    logger.info('child process launching Chrome.exe exited with code ' + data);
                    
                    callbacks[sessionId] = cbOfGetExposureOfArea;
                    
                    setTimeout(function(){
                        if (callbacks[sessionId]){
                            callbacks[sessionId] = "ERROR_OF_TIME_OUT";
                            cbOfGetExposureOfArea("Time out for calculating exposure!", null);
                        }
                    }, 10*1000); //time out in 10 sec
    
                });
                
            },
            
            setAnswerForSession: function(sessionId, err, answerObj, cbOfSetAnswerForSession){
                
                //console.log("ExposureMeterBroker.setAnswerForSession() is called");
                
                var callback = callbacks[sessionId];
                
                if ( typeof(callback) == 'function' ) {
                    callback(err, answerObj);
                    cbOfSetAnswerForSession(null);
                    callbacks[sessionId] = null;
                    //delete callbacks[sessionId];
                }
                else if ( callback=='ERROR_OF_TIME_OUT' ) {
                    cbOfSetAnswerForSession('Did not call the corresponding callback due to time out of its operation.');
                }
                else {
                    cbOfSetAnswerForSession('Cannot find the specific callback!');
                }
                
            }
        };

        return obj;
    }

    return {
        /**  
         * @constructs ExposureMeter
         *
         * The class function get the unique instance of ExposureMeter
         */
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            
            return uInstance;
        }
    };
})();

module.exports = ExposureMeterBroker;