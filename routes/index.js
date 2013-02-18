
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


var connectionHandler = require('./connection_handler.js');
exports.commandResponse_post_cb = connectionHandler.commandResponse_post_cb;
exports.command_get_cb = connectionHandler.command_get_cb;
