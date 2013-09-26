
//var exposureMeter = require('./exposure_meter.js').getInstance();
//var exposure;
//exposureMeter.getExposureOfArea(null,null, function(err, _exposure){
//    if (!err){
//        exposure = _exposure;
//        console.log("exposure= "+exposure);
//    }
//    else {
//        console.log("Fail to get the exposure of an area: "+err);
//    }
//});

var gm = require('gm');

gm( fileCropped )
.resize(_resizeTo.width, _resizeTo.height)
.write(fileResized, function (err) {
    if (!err) {
        logger.info('File cropping/resizing done');
        fs.unlink(fileCropped);
        if ( _callback2 )
            _callback2();
    }
    else  {
        logger.info(err);
        res.send( {err:'Fail to resize the image file: '+err } );
    }
});
