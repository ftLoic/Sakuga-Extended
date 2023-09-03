function reloadBooru() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
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
document.getElementById('score').onchange = document.getElementById('tags').onchange = document.getElementById('recommendations').onchange = document.getElementById('default_player').onchange = document.getElementById('allow_screenshot').onchange = function() {
    optionalInfo[this.id] = this.checked;
    chrome.storage.sync.set({optionalInfo: optionalInfo});
    reloadBooru();
}
document.getElementById('theme').onchange = function() {
    chrome.storage.sync.set({theme: this.value}); 
    reloadBooru();
}
document.getElementById('screenshot_key').onclick = function() {
    var btnScreenshotKey = document.getElementById('screenshot_key');
    btnScreenshotKey.value = "...";
    document.addEventListener('keypress', function newScreenshotKey(event) {
        var keyName = event.key.toUpperCase();
        optionalInfo[btnScreenshotKey.id] = keyName;
        btnScreenshotKey.value = keyName;
        chrome.storage.sync.set({optionalInfo: optionalInfo});
        reloadBooru();
        document.removeEventListener('keypress', newScreenshotKey, false);
    }, false);

    // Version prompt
    // var newKey = prompt("Enter new screenshot key");
    // if (newKey) {
    //     optionalInfo[this.id] = newKey;
    //     this.value = newKey;
    //     chrome.storage.sync.set({optionalInfo: optionalInfo});
    //     reloadBooru();
    // }
}

var optionalInfo;
chrome.storage.sync.get(['optionalInfo'], function(data) {
    optionalInfo = data.optionalInfo;
    if (optionalInfo == undefined) {
        optionalInfo = {'score': true, 'tags': true, 'recommendations': true, 'default_player': false, 'allow_screenshot': true, 'screenshot_key': 'S'};
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
    if (optionalInfo['allow_screenshot'] == true) {
        document.getElementById('allow_screenshot').checked = true;
    }
    if (optionalInfo['screenshot_key']) {
        document.getElementById('screenshot_key').value = optionalInfo['screenshot_key'];
    }
});
chrome.storage.sync.get(['theme'], function(data) {
    if (data.theme != undefined) {
        document.getElementById('theme').value = data.theme;
    }
});
