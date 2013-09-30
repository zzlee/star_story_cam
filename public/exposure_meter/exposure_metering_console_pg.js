$( document ).ready(function() {
    
    
    $('#btnMeter').click(function(){
        
        var imageUrl = $("input[type='text'][name='imageUrl']").attr('value');
        var areaToMeter = JSON.parse($("input[type='text'][name='area']").attr('value'));
        $('#imageToMeasure').attr('src',imageUrl);

        
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