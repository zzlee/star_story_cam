$( document ).ready(function() {
    
    
    $('#btnMeter').click(function(){
        
        var imageUrl = $("input[type='text'][name='imageUrl']").val();
        var areaToMeter;
        //$('#imageToMeasure').attr('src',imageUrl);
        
        var sampleImage = null;
        var previewCanvas = document.getElementById("previewCanvas");
        var context = previewCanvas.getContext('2d');
        context.webkitImageSmoothingEnabled = true;
        sampleImage = document.createElement('img');
        sampleImage.src = imageUrl;
        
        var drawPreview = function(area, cbOfDrawPreview) {
            context.drawImage(sampleImage,0,0);
            context.beginPath();
            context.lineWidth="2";
            context.strokeStyle="red";
            context.rect(area.x, area.y, area.width, area.height);
            context.stroke();
            if (cbOfDrawPreview) {
                cbOfDrawPreview();
            }
        };

        
        sampleImage.onload = function(){
            previewCanvas.width = sampleImage.width;
            previewCanvas.height = sampleImage.height;
            
            drawPreview({x: 0, y:0, width:0, height:0});
            
            var mouseIsDown = false;
            var initX = 0, initY = 0;
            
            
            $( "#previewCanvas" ).mousedown(function( event ) {
                
                mouseIsDown = true;
                initX = event.offsetX;
                initY = event.offsetY;
                
//                var msg = "Handler for .mousedown() called at ";
//                msg += event.offsetX + ", " + event.offsetY;
//                $('#trace1').html(msg);
            });
            
            $( "#previewCanvas" ).mousemove(function( event ) {
                
                if (mouseIsDown) {
                    areaToMeter = {
                            x: initX,
                            y: initY,
                            width: event.offsetX - initX,
                            height: event.offsetY - initY
                    };
                    
                    $("#trace1").html("Area to meter:" + JSON.stringify(areaToMeter));
                    
                    drawPreview(areaToMeter);
                }
                
//                var msg = "Handler for .mousemove() called at ";
//                msg += event.offsetX + ", " + event.offsetY;
//                $('#trace2').html(msg);
            });

            $( "#previewCanvas" ).mouseup(function( event ) {
                
                if (mouseIsDown) {
                    mouseIsDown = false; 
                    
                    ExposureMeter.getInstance().getExposureOfArea(imageUrl, areaToMeter, function(errOfGetExposureOfArea, result){
                        if (!errOfGetExposureOfArea){
                            $('#resultText').html('exposure='+result.exposure);
                        }
                        else {
                            $('#resultText').html('Error!:'+errOfGetExposureOfArea);
                        }
                    });

                }

                
//                var msg = "Handler for .mouseup() called at ";
//                msg += event.offsetX + ", " + event.offsetY;
//                $('#trace3').html(msg);
            });

            
            
        };
        
        

        

        //$('#traces').html(new Date() + "<br>" + imageUrl);
    });
    
    
});