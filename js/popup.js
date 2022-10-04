function reloadBooru() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        console.log("test");
        console.log(tabs);
        for (var tab = 0; tab < tabs.length; tab ++) {
            if (tabs[tab].url && tabs[tab].url.indexOf("sakugabooru.com") > -1) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[tab].id},
                    files: ['js/popup-script.js']
                });
            }
        }
    });
}
document.getElementById('score').onchange = document.getElementById('tags').onchange = document.getElementById('recommendations').onchange = document.getElementById('default_player').onchange = function() {
    optionalInfo[this.id] = this.checked;
    chrome.storage.sync.set({optionalInfo: optionalInfo}); 
    reloadBooru();
}
document.getElementById('theme').onchange = function() {
    chrome.storage.sync.set({theme: this.value}); 
    reloadBooru();
}

var optionalInfo;
chrome.storage.sync.get(['optionalInfo'], function(data) {
    optionalInfo = data.optionalInfo;
    if (optionalInfo == undefined) {
        optionalInfo = {'score': true, 'tags': true, 'recommendations': true, 'default_player': false};
    }
    if (optionalInfo['score'] != false) {
        document.getElementById('score').checked = true;
    }
    if (optionalInfo['tags'] != false) {
        document.getElementById('tags').checked = true;
    }
    if (optionalInfo['recommendations'] != false) {
        document.getElementById('recommendations').checked = true;
    }
    if (optionalInfo['default_player'] == true) {
        document.getElementById('default_player').checked = true;
    }
});
chrome.storage.sync.get(['theme'], function(data) {
    if (data.theme != undefined) {
        document.getElementById('theme').value = data.theme;
    }
});
