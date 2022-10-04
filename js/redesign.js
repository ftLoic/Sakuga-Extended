chrome.storage.sync.get(['theme'], function(data) {
    if (data.theme != undefined && data.theme != "classic") {
        var link = document.createElement('link');
        link.href = chrome.runtime.getURL('css/designs/'+data.theme+'.css');
        link.rel = "stylesheet";
        document.documentElement.appendChild(link);
        
        var link = document.createElement('link');
        link.href = chrome.runtime.getURL('css/post_redesign.css');
        link.rel = "stylesheet";
        document.documentElement.appendChild(link);
    } 
});