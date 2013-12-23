
var execFile = require('child_process').execFile;
/*
console.time('FC_test-record');
execFile('FC_test.exe', [30, 'test_record', 0, 27], function(error, stdout, stderr){
    //logger.info('image content: ' + path.join(__dirname, dest));
    //cutImage_cb('done');
    console.dir(error);
    console.dir(stdout);
    console.dir(stderr);
    console.timeEnd('FC_test-record');
});
*/
// -o miix -e 1.0 -g 10.0 -t [5.5,9.0,6.0] -f 27
var fileset = {};
var times = 1;
var spawn = require('child_process').spawn;
console.time('FC_test-record');

var FC_test = spawn('ImageShutterByTimeTrigger.exe', 
                    ['-o', new Date().getTime(), '-e', 0.0, 
                     '-g', 0.0, '-f', 27, '-t', '[4.5,8.0,7.0]']);
// var FC_test = spawn('FC_test.exe', 
                   // [30, 'test_record', 1.0, 27, -1]);

FC_test.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    // fileset['user' + times] = data.toString().replace(/\r?\n/g,'').split(",");
    times+=1;
});

FC_test.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});

FC_test.on('close', function (code) {
    console.log('child process exited with code ' + code);
    console.timeEnd('FC_test-record');
    // console.dir(fileset);
});


// var option = {
    // arr: [5.5, 9.1, 9.0]
// };

// var action = '[';
// for(var i=0; i<option.arr.length; i++)
// {
    // action += option.arr[i].toString();
    // (i != option.arr.length-1)?action+=',':action+=']';
// }
// console.log(action);

// function logArrayElements(element, index, array) {
    // console.log("a[" + index + "] = " + element);
    // action += element.toString();
    // (index != array.length-1)?action+=',':action+=']';
// }
// option.arr.forEach(logArrayElements);
// console.log(option.arr.toString());
// console.log('['+option.arr.toString().replace(' ','')+']');
// console.log(action);
// logs:
// a[0] = 2
// a[1] = 5
// a[2] = 9


