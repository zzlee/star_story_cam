var serverSideBrowserHandler = {};



//PUT /internal/responses_of_serverside_browser_session/:moduleId/:sessionId
serverSideBrowserHandler.putResponsesOfServersideBrowserSession = function(req, res) {
    var sessionId = req.params.sessionId;
    var moduleId = req.params.moduleId;
    
    var exposureMeter = require('../exposure_meter.js').getInstance();
    
    switch(moduleId)
    {
    case 'EXPOSURE_METER':
        exposureMeter.setAnswerForSession(sessionId, req.body.err, req.body.answerObj, function(errOfSetAnswerForSession){
            if (!errOfSetAnswerForSession){
                res.send(200);
            }
            else {
                res.send(500, errOfSetAnswerForSession);
            }
        });

        break;
    case 'HDR':
        res.send(200);
        break;
    default:    
        res.send(200);
    }
    
    
};

module.exports = serverSideBrowserHandler;