$( document ).ready(function() {
    //$("p").html("Hello world!!");
    var imageUrl, area;
    var sessionId;
    
    //read the query string
    var strUrl = location.search;
    var getPara, ParaVal;
    var aryPara = [];
    
    var answerServer = function(objToAnswer, cbOfAnswerServer){
        
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
        
    }
    else {
        alert('Missing one of the following parameters: imageUrl area_x area_y area_width area_height sessionId');
        //TODO: answer the server about this error
        
        //close the browser
        window.open('', '_self', ''); 
        window.close();
    }
});
