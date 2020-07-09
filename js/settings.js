var video = document.querySelector('video');
var controls = document.getElementById('control');
if (video && controls) {
    var panel = document.createElement('div');
    panel.id = "panel";
    panel.style.height = video.height+"px";
    panel.style.left = video.width+"px";
    panel.style.display = "none";

    // VIDEO SPEED
    var tspeed = document.createElement('p');
    tspeed.innerText = "Video speed ";
    var sspeed = document.createElement('span');
    sspeed.innerText = "(1x)";
    var ispeed = document.createElement('input');
    ispeed.type  = "range";
    ispeed.min   = "0";
    ispeed.value = "4";
    ispeed.max   = "8";
    ispeed.dataset.values = "[0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3]";
    ispeed.oninput = function() {
        var values = JSON.parse(this.dataset.values);
        sspeed.innerText = "("+values[this.value]+"x)";
        document.querySelector('video').playbackRate = values[this.value];
    }
    tspeed.appendChild(sspeed);
    panel.appendChild(tspeed);
    panel.appendChild(ispeed);
    // VIDEO GRAYSCALE
    var tgray = document.createElement('p');
    tgray.innerText = "Video grayscale ";
    var sgray = document.createElement('span');
    sgray.innerText = "(0x)";
    var igray = document.createElement('input');
    igray.type  = "range";
    igray.min   = "0";
    igray.value = "0";
    igray.max   = "1";
    igray.step  = "0.1";
    igray.oninput = function() {
        sgray.innerText = "("+this.value+"x)";
        document.querySelector('video').style.filter = "grayscale("+this.value+")";
    }
    tgray.appendChild(sgray);
    panel.appendChild(tgray);
    panel.appendChild(igray);

    document.querySelector('.content div').insertBefore(panel, controls);

    var settings = document.createElement('button');
    settings.innerText = "Settings";
    settings.style.float = "right";
    settings.onclick = function() {
        if (panel.style.display == "none") {
            panel.style.display = "block";
        } else {
            panel.style.display = "none";
        }
    }
    controls.appendChild(settings);
}