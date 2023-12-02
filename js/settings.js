var video = document.querySelector('video');
var controls = document.getElementsByClassName('frame-control')[0];
if (video && controls) {
    var panel = document.createElement('div');
    panel.id = "panel";
    panel.style.height = video.offsetHeight+"px";
    panel.style.left = video.offsetWidth+"px";
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

    var filters = {
        "blur": {"unit": "px", "min": 0, "max": 30, "base": 0, "value": 0},

        "hue-rotate": {"unit": "deg", "min": 0, "max": 360, "base": 0, "value": 0},
        "grayscale": {"unit": "%", "min": 0, "max": 100, "base": 0, "value": 0},
        "invert": {"unit": "%", "min": 0, "max": 100, "base": 0, "value": 0},
        "sepia": {"unit": "%", "min": 0, "max": 100, "base": 0, "value": 0},
        
        "contrast": {"unit": "%", "min": 0, "max": 300, "base": 100, "value": 100},
        "brightness": {"unit": "%", "min": 0, "max": 300, "base": 100, "value": 100},
        "saturate": {"unit": "%", "min": 0, "max": 300, "base": 100, "value": 100},
    }
    var currentFilter = "blur";
    var options = Object.keys(filters);

    var sFilter = document.createElement('p');
    sFilter.innerText = "Filter";
    var selectFilter = document.createElement('select');
    for (var i = 0; i < options.length; i ++) {
        var opt = document.createElement('option');
        opt.value = options[i];
        opt.innerText = options[i].substr(0, 1).toUpperCase()+options[i].substr(1);
        selectFilter.appendChild(opt);
    }
    selectFilter.style.width = "95%";
    selectFilter.onchange = function() {
        currentFilter = selectFilter.value;
        iFilter.min   = filters[currentFilter]['min'];
        iFilter.max   = filters[currentFilter]['max'];
        iFilter.value = filters[currentFilter]['value'];
        iFilter.oninput();
    }
    panel.appendChild(sFilter);
    panel.appendChild(selectFilter);
    // SLIDER
    var iFilter = document.createElement('input');
    iFilter.type  = "range";
    iFilter.step  = "1";
    iFilter.oninput = function() {
        filters[currentFilter]['value'] = this.value;
        sFilter.innerText = "Filter ("+filters[currentFilter]['value']+filters[currentFilter]['unit']+")";
        document.querySelector('video').style.filter = formatFilters();
    }
    selectFilter.onchange();
    panel.appendChild(iFilter);
    function formatFilters() {
        var filterStyle = "";
        for (var i = 0; i < options.length; i ++) {
            if (filters[options[i]]['value'] != filters[options[i]]['base']) {
                filterStyle += options[i]+"("+filters[options[i]]['value']+filters[options[i]]['unit']+") ";
            }
        }
        console.log(filterStyle);
        return filterStyle;
    }

    // FLIP
    var flip = document.createElement('button'), flipped = false;
    flip.id = "flip";
    flip.innerText = "Flip horizontally";
    flip.onclick = function() {
        flipped = !flipped;
        if (flipped == true) {
            video.style.transform = "scaleX(-1)";
        } else {
            video.style.transform = "scaleX(1)";
        }
    }
    panel.appendChild(flip);

    // FRAMERATE
    var tframe = document.createElement('p');
    tframe.innerText = "Framerate control";

    var selectFPS = document.createElement('select');
    var fpsOptions = ["24", "30"];
    for (var i = 0; i < fpsOptions.length; i ++) {
        var opt = document.createElement('option');
        opt.value = fpsOptions[i];
        opt.innerText = fpsOptions[i]+" FPS";
        selectFPS.appendChild(opt);
    }
    selectFPS.style.width = "95%";
    selectFPS.onchange = function() {
        framerate = parseInt(this.value);
        video.onloadedmetadata();
    }
    panel.appendChild(tframe);
    panel.appendChild(selectFPS);

    document.querySelector('.content div').appendChild(panel);

    var settings = document.createElement('button');
    settings.id = "settings";
    settings.innerText = "Settings";
    settings.style.float = "right";
    settings.onclick = function() {
        if (settings.innerText == "Panda game!") {
            window.open(chrome.runtime.getURL('html/panda/index.html'));
            return;
        }
        if (panel.style.display == "none") {
            panel.style.height = video.offsetHeight+"px";
            panel.style.left = video.offsetWidth+"px";
            panel.parentNode.style.position = "relative";
            panel.style.display = "block";
        } else {
            panel.parentNode.style.position = "";
            panel.style.display = "none";
        }
    }
    var currentArtist = document.createElement('span');
    currentArtist.id = "current-artist";

    controls.appendChild(currentArtist);
    controls.appendChild(settings);
}