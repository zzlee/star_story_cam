$( document ).ready(function() {
    //$("p").html("Hello world!!");
    var imageUrl; 
    var area = {};
    var sessionId;
    
    //read the query string
    var strUrl = location.search;
    var getPara, ParaVal;
    var aryPara = [];
    
    var answerServer = function(sessionId, errToAnswer, objToAnswer, cbOfAnswerServer){
        var moduleId = "EXPOSURE_METER";
        $.ajax( "/internal/responses_of_serverside_browser_session/" + moduleId + "/" + sessionId, {
            type: "PUT",
            data: {
                err: errToAnswer,
                answerObj: objToAnswer
            },
            success: function(data, textStatus, jqXHR ){
                cbOfAnswerServer(null);
            },
            error: function(jqXHR, textStatus, errorThrown){
                cbOfAnswerServer("Failed to answer server: "+errorThrown);
            }
        });

    };
    
    if (strUrl.indexOf("?") != -1) {
        var getSearch = strUrl.split("?");
        getPara = getSearch[1].split("&");
        for (i = 0; i < getPara.length; i++) {
            ParaVal = getPara[i].split("=");
            //aryPara.push(ParaVal[0]);
            aryPara[ParaVal[0]] = ParaVal[1];
        }
        //alert("a="+aryPara.a+" b="+aryPara.b);
    }
    
    if (aryPara.imageUrl && aryPara.area_x && aryPara.area_y && aryPara.area_width && aryPara.area_height && aryPara.sessionId){
        
        
        
        imageUrl = aryPara.imageUrl;
        area.x = aryPara.area_x;
        area.y = aryPara.area_y;
        area.width = aryPara.area_width;
        area.height = aryPara.area_height;
        sessionId = aryPara.sessionId;
        
        var traceString = "imageUrl="+imageUrl+"<br>  area="+JSON.stringify(area)+"<br>  sessionId="+sessionId;
        
        $('#imageToMeasure').attr('src',imageUrl);
        $('#traces').html(traceString);
        
        setTimeout(function(){
            answerServer(sessionId, null, {message: 'hello'}, function(){
                //close the browser
//                window.open('', '_self', ''); 
//                window.close();
            });

        }, 2000);
        

        
    }
    else {
        alert('Missing one of the following parameters: imageUrl area_x area_y area_width area_height sessionId');
        //TODO: answer the server about this error
        answerServer(sessionId, 'Missing one of the following parameters to browser: imageUrl area_x area_y area_width area_height sessionId', null, function(){
            //close the browser
            window.open('', '_self', ''); 
            window.close();
        });
        
    }
});
