/**
 * @fileoverview Implementation of ExposureMeter on the browser side
 */


var ExposureMeter = (function() {
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
                
                //initiate canvas related variables
                var sampleImage = null;
                var sampleCanvas = document.createElement('canvas');
                sampleCanvas.setAttribute("id","sampleCanvas"); 
                var exposure;
                
                var context = sampleCanvas.getContext('2d');
                context.webkitImageSmoothingEnabled = true;
                sampleImage = new Image();
                sampleImage.src = imageUrl;
                sampleImage.onload = function(){
                    sampleCanvas.width = sampleImage.width;
                    sampleCanvas.height = sampleImage.height;
                    context.drawImage(sampleImage,0,0);
                    
                    var sampleData = context.getImageData(area.x, area.y ,area.width, area.height);
                    var totalPixelNumber = sampleData.data.length/4;
                    var R, G, B; //Red, Green, Blue
                    var Y; //luma
                    var Y_total = 0;
                    
                    for ( var i=0; i<sampleData.data.length; i+=4) {
                        R = sampleData.data[i];
                        G = sampleData.data[i+1];
                        B = sampleData.data[i+2];
                        Y = Math.round(0.2126*R + 0.7152*G + 0.0722*B);
                        Y_total += Y;
                    }
                    
                    var exposure = Y_total/totalPixelNumber;
                    
                    cbOfGetExposureOfArea(null, {sampleCanvas: sampleCanvas, exposure: exposure});
                };
                sampleImage.onerror = function(){
                    cbOfGetExposureOfArea("Failed to load the background image "+imageUrl, null);
                    //console.log("Failed to load the background image "+imageUrl);
                };
                sampleImage.onabort = function(){
                    cbOfGetExposureOfArea("Failed to load the background image "+imageUrl+" (aborted)", null);
                    //console.log("Failed to load the background image "+imageUrl+" (aborted)");
                };

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

