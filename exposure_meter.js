/**
 * @fileoverview Implementation of ExposureMeter
 */


var ExposureMeter = (function() {

    function constructor() {
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
            getExposureOfArea : function(imageUrl, area, cbOfGetExposureOfArea) {
                console.log('getExposureOfArea() is called.');
                
                var spawn = require('child_process').spawn;
                var ls    = spawn('chrome.exe', ['tw.yahoo.com']);

                ls.stdout.on('data', function (data) {
                  console.log('stdout: ' + data);
                });
    
                ls.stderr.on('data', function (data) {
                  console.log('stderr: ' + data);
                });
    
                ls.on('close', function (code) {
                  console.log('child process exited with code ' + code);
                  
                  cbOfGetExposureOfArea(null, 0);
                });
                
                
            }
        };

        return obj;
    }

    return {
        /**  
         * @constructs ExposureMeter
         *
         * The class function that create an instance of ExposureMeter
         */
        getInstance : function() {
            return constructor();
        }
    };
})();

module.exports = ExposureMeter;