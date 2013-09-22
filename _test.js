
var exposureMeter = require('./exposure_meter.js').getInstance();
var exposure;
exposureMeter.getExposureOfArea(null,null, function(err, _exposure){
    if (!err){
        exposure = _exposure;
        console.log("exposure= "+exposure);
    }
    else {
        console.log("Fail to get the exposure of an area: "+err);
    }
});
