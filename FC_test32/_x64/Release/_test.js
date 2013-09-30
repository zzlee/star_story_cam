
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

var spawn = require('child_process').spawn;
console.time('FC_test-record');

var FC_test = spawn('FC_test.exe', [30, 'test_record', 1.0, 27, -1]);

FC_test.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

FC_test.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

FC_test.on('close', function (code) {
  console.log('child process exited with code ' + code);
  console.timeEnd('FC_test-record');
});
