var video = document.querySelector('video');
var controls = document.getElementsByClassName('control')[0];

if (video && controls) {
    chrome.storage.sync.get(['optionalInfo'], function(data) {
        optionalInfo = data.optionalInfo;
        document.onkeypress = function(e) {
            if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
                if ((!e.ctrlKey && e.key.toUpperCase() === optionalInfo['screenshot_key'])) capture();
            }
        }
    });
}

function capture() {
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob(function(screenshotBlob){
        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': screenshotBlob
                })
            ]);
        } catch (error) {
            console.error(error);
        }
    },'image/png');
}