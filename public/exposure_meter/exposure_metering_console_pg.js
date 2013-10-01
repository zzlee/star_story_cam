$( document ).ready(function() {
    
    
    $('#btnMeter').click(function(){
        
        var imageUrl = $("input[type='text'][name='imageUrl']").val();
        var areaToMeter = JSON.parse($("input[type='text'][name='area']").val());
        //$('#imageToMeasure').attr('src',imageUrl);
        
        var sampleImage = null;
        var previewCanvas = document.getElementById("previewCanvas");
        var context = previewCanvas.getContext('2d');
        context.webkitImageSmoothingEnabled = true;
        sampleImage = document.createElement('img');
        sampleImage.src = imageUrl;
        sampleImage.onload = function(){
            previewCanvas.width = sampleImage.width;
            previewCanvas.height = sampleImage.height;
            context.drawImage(sampleImage,0,0);
            context.beginPath();
            context.lineWidth="2";
            context.strokeStyle="red";
            context.rect(areaToMeter.x, areaToMeter.y, areaToMeter.width, areaToMeter.height);
            context.stroke();
        }
        

        
        ExposureMeter.getInstance().getExposureOfArea(imageUrl, areaToMeter, function(errOfGetExposureOfArea, result){
            if (!errOfGetExposureOfArea){
                $('#traces').html('exposure='+result.exposure);
            }
            else {
                $('#traces').html('Error!:'+errOfGetExposureOfArea);
            }
        });

        //$('#traces').html(new Date() + "<br>" + imageUrl);
    });
    
    
});