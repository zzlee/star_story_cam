var spawn = require('child_process').spawn,
    FC_test32    = spawn('FC_test32', ['1', 'miix-story-test']);

FC_test32.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

FC_test32.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

FC_test32.on('close', function (code) {
  console.log('child process exited with code ' + code);
});