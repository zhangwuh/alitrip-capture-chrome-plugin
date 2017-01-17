var urlQueue = new Map();
var searchJourneyRegex = new RegExp("[?&]searchJourney(=([^&#]*)|&|#|$)");
var tripTypeRegex = new RegExp("[?&]tripType(=([^&#]*)|&|#|$)");

if(localStorage["pushto"] == undefined){
  localStorage["pushto"] = "";
}
if(localStorage["host"] == undefined){
  localStorage["host"] = "sijipiao.alitrip.com";
}
if(localStorage["pattern"] == undefined){
  localStorage["pattern"] = "https://sijipiao.alitrip.com/ie/flight_search_result_poller.do?*searchMode=2*";
}
if(localStorage["interval"] == undefined){
  localStorage["interval"] = 20;
}
var pushto = null;
var host = null;
var pattern = null;
var interval = null;
var timer = null;
var cookie = '';
setCookie();
reset();



function setCookie(){
  console.info("start to reset cookie value");
  chrome.cookies.getAll({domain: '.alitrip.com'},function(cookies){
    var array = new Array();
    $.each(cookies,function(i,item){
      array.push(item.name + "=" + item.value);
    });
    cookie = array.join("; ");
    console.info("cookie is " + cookie);
  });
}

function extractParam(url,regex){
  var results = regex.exec(url);
  if(results != null && results.length >=2){
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  return null;
}

function extractSearchJourney(url){
  return extractParam(url,searchJourneyRegex);
}

function extractTripType(url){
  return extractParam(url,tripTypeRegex);
}

function searchKey(url){
  return extractSearchJourney(url);
}

function pushToQueue(url){
	var _searchKey = searchKey(url);
  var tripType = extractTripType(url);
	if(_searchKey != null){
		urlQueue.set(_searchKey,{"url":url,"timestamp":new Date().getTime(),"cookie":cookie,"searchJourney":_searchKey,"tripType":tripType});
	}
}


function pushToServer(){
	if(urlQueue.size == 0){
		return;
	}
	var data = new Array();
	for(u of urlQueue.values()){
		data.push(u);
	}
	console.info("start to push " + data.length + " urls to gather");
	$.ajax({
			type:"post",
	    	url:pushto,
	    	data:JSON.stringify(data),
	    	contentType: "application/json; charset=utf-8",
    		dataType: "json",
    		async: false, 
	    	complete: function(){
          console.info(JSON.stringify(data) + " pushed to server");
     			urlQueue.clear();
     			pushLock = false;
     			console.info("queue cleared");
   			}
	    });
}

chrome.tabs.onUpdated.addListener(function(id, info, tab){
    if (tab.url.toLowerCase().indexOf(host) > -1){ //sijipiao.alitrip.com
        chrome.pageAction.show(tab.id);
    }
});

chrome.webRequest.onCompleted.addListener(
  function(details) {
    console.info(details.url);
    pushToQueue(details.url);
  },{
  	urls: [ pattern ] //https://sijipiao.alitrip.com/ie/flight_search_result_poller.do?*searchMode=2*
  }
);

function reset(){
   pushto = localStorage["pushto"];
   host = localStorage["host"];
   pattern = localStorage["pattern"];
   interval = localStorage["interval"];
   resetInterval();
}

function resetInterval(){
  if(timer != null){
    clearInterval(myTimer);
  }
  timer = setInterval(pushToServer,interval * 1000);//push to server side every 10s
}
setInterval(setCookie,3600 * 1000);


