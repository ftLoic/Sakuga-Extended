/*
Source:
Niku Kikai
https://github.com/KisaragiAyano/web-scripts
Thanks to him for letting me use his scripts for Sakuga Extended!
*/

var id,
    framerate = 24,
    frames = frame = 0,
    frames_html5 = 1/40,
    frames_arr = [],
    video = document.querySelector('video'),
    img = document.querySelector('.content img'),
    isGif = (img && /.gif$/.test(img.src) && !/Firefox\//.test(navigator.userAgent)), // Not supported
    gif, seek, control, text_frm, slider, play_gif, artistPartsConfirmed = 0, artistFrames;
try {
    id = /show\/([0-9]+)/.exec(location.href)[1];
} catch {}
    
// From Sakuga Encode
function accurate_from_frame(n) {
    var ct = 0, f;
    for (var i = 0; i < n; i++) {
        f = frames_arr[i % frames_arr.length];
        ct += f;
    }
    return parseFloat((ct).toFixed(3));
}
function accurate_from_time(v) {
    var ct = 0;
    for (var i = 0; i < Math.ceil(video.duration * (frames_arr.length+1)); i++) {
        f = frames_arr[i % frames_arr.length];
        ct = parseFloat((ct+f).toFixed(3));
        if (ct > v) {
            break;
        }
    }
    return i;
}
function toTitleCase(toTransform) {
    return toTransform.replace(/\b([a-z])/g, function (_, initial) {
        return initial.toUpperCase();
    });
}
function loadFrames() {
    artistFrames = [];
    artistPartsConfirmed = 0;

    var exp = /([0-9]*:[0-9]{2}|start)s?[ ]*(-|–|~|〜|to)[ ]*([0-9]*:[0-9]{2}|end)s?[ ]*(\(.*\))?[ ]*(:| :| )[ ]*(should be|might be|maybe|may be|could be|looks? like|can be|looks)?(is also|is confirmed|also is|is |by |-)?[ ]*([A-Za-z0-9-_ ]{1,27})(.*presume.*|.*\?.*)?(\.|$|\n|\()/gi;
    var comments = document.querySelectorAll('div.comment');

    for (var i = 0; i < comments.length; i ++) {
        var testComment = comments[i].cloneNode(true);
        if (i > 0 && testComment.querySelector('blockquote')) { // Don't read quotes if it's not the first comment
            testComment.querySelector('blockquote').remove();
        }
        console.log(testComment.querySelector('.body').innerHTML.replace(/<br>/g, "\n").replace(/<[^\>]+>/g, ""));
        var matches = (testComment.querySelector('.body').innerHTML.replace(/<br>/g, "\n").replace(/<[^\>]+>/g, "")+"\n").matchAll(exp);
        for (var match of matches) {
            console.log(match);
            var artist = toTitleCase(match[8].trim().replace(/[_]/g, " "));
            if (artist.length > 0 && artist.length < 27) {
                if (match[6] != undefined || match[9] != undefined) {
                    artist += " (?)";
                }
                if (match[1].toLowerCase() == "start") match[1] = "00:00";
                if (match[3].toLowerCase() == "end") match[3] = "10:00";
                var partsStart = match[1].split(":");
                var partsEnd = match[3].split(":");
                var frameStart = parseFloat(partsStart[0])*60+parseFloat(partsStart[1]);
                var frameEnd = parseFloat(partsEnd[0])*60+parseFloat(partsEnd[1]);
                artistFrames.push([frameStart, frameEnd, artist]);
                artistPartsConfirmed ++;
            }
        }
    }
    console.log(artistFrames);
    if (artistPartsConfirmed == 0) artistPartsConfirmed = -1;
    updateArtist();
}
function updateText() {
    var artist = "";
    for (var i = 0; i < artistFrames.length; i ++) {
        if (video.currentTime >= artistFrames[i][0] && video.currentTime-1 <= artistFrames[i][1]) {
            artist = artistFrames[i][2];
        }
    }

    var text = "Current artist: "+artist;
    if (artist != "") {
        if (document.getElementById('currentArtist').innerText != text) {
            document.getElementById('currentArtist').innerText = "Current artist: "+artist;
        }
    } else {
        document.getElementById('currentArtist').innerText = "";
    }
}
function updateArtist() {
    if (artistPartsConfirmed == -1) return;
    if (document.querySelectorAll('.tag-type-artist') && document.querySelectorAll('.tag-type-artist').length == 1) {
        artistPartsConfirmed = -1;
        return;
    }
    
    if (artistPartsConfirmed > 0) {
        if (document.getElementById('currentArtist')) updateText();
        else setTimeout(updateText, 50);
    }
}

// Remove private pools
var script = document.createElement('script');
script.src = chrome.runtime.getURL('js/framesScript.js');
(document.head || document.documentElement).appendChild(script);

// Show anyway
if (document.querySelector('.status-notice') && !video) {
    var hash = /MD5: ([a-z0-9]{32})/g.exec(document.querySelector('.status-notice').innerText);
    if (hash) {
        hash = hash[1];
        var size = /Size: ([0-9]+)x([0-9]+)/g.exec(document.getElementById('stats').innerText);
        let div = document.createElement('div');
        div.id = "deleted-video"
        div.style.marginBottom = "1em";
        div.style.display = "none";
    
        var a = document.createElement('a');
        a.href = "#";
        a.innerText = "Show anyway";
        a.onclick = function() {
            video.play();
            div.style.display = "block";
        }
    
        video = document.createElement('video');
        video.loop = true;
        video.controls = true;
        video.width = size[1];
        video.height = size[2];
        video.src = "https://www.sakugabooru.com/data/"+hash+".mp4";
        video.onerror = function() {
            if (video.src.indexOf(".mp4") > 0) {
                console.log("Switch to webm");
                video.src = video.src.replace(".mp4", ".webm");
            }
        }
        var loaded = false;
        video.onloadeddata = function() {
            if (loaded) return;
            loaded = true;
            document.querySelector('.status-notice').append(" (");
            document.querySelector('.status-notice').append(a);
            document.querySelector('.status-notice').append(")");
        }
        div.appendChild(video);
        document.getElementById('right-col').prepend(div);
    }
}

if (video || isGif) {
    var el = video;

    if (isGif) {
        el = img;

        var gif_control = document.createElement('div');
        gif_control.style.width = (el.width != 0) ? el.width+'px' : el.offsetWidth+'px';
        gif_control.style.display = "flex";
        gif_control.classList.add('control');
        
        play_gif = document.createElement('button');
        play_gif.innerText = " || ";
        slider = document.createElement('input');
        slider.type = "range";
        slider.min = slider.max = "0";
        slider.style.flex = "1";

        gif_control.appendChild(play_gif);
        gif_control.appendChild(slider);
        document.querySelector('.content').insertBefore(gif_control, document.querySelector('.content div[style="margin-bottom: 1em;"]'));
    }

    control = document.createElement('div'),
    text_frm = document.createElement('label');

    control.style.width = (el.width != 0) ? el.width+'px' : el.offsetWidth+'px';
    control.classList.add('control');
    text_frm.style.display = 'inline-block';
    text_frm.style.textAlign = 'center';
    text_frm.style.width = '120px';
    
    let arrows = ['<<<', '<<', '<', null, '>', '>>', '>>>'];
    for (let i = 0; i < arrows.length; i ++) {
        if (arrows[i] == null) {
            control.appendChild(text_frm);
        } else {
            let btn = document.createElement('button');
            btn.innerText = arrows[i];
            btn.onclick = function() {
                seek(i-3);
            }
            control.appendChild(btn);
        }
    }
    document.querySelector('.content').insertBefore(control, document.querySelector('.content div[style="margin-bottom: 1em;"]'));
}
if (video) {
    function show_frm() {
        text_frm.innerText = frame+" / "+frames;
        updateArtist();
    }
    // Frame seeker
    var frame = 0, seeking = video.currentTime;
    seek = function(n) {
        if (seeking == video.currentTime) {
            frame += n;
        } else {
            frame = accurate_from_time(video.currentTime)+n;
        }
        video.pause();
        frame = Math.max(0, Math.min(frames, frame)); // Limit 0 and max frame
        var frameTime = accurate_from_frame(frame);
        video.currentTime = frameTime+frames_html5; // HTML5 players are dumb, we have to move a little forward
        
        show_frm();
        seeking = video.currentTime;
    }
    // Shortcuts
    document.onkeydown = function(e) {
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            if ((!e.ctrlKey && (e.key == "D" || e.key == "d")) || e.key == "," || e.key == "?" || e.key == "<") seek(-1);
            if ((!e.ctrlKey && (e.key == "F" || e.key == "f")) || e.key == "." || e.key == ";" || e.key == ">") seek(1);
            if (!e.ctrlKey && e.key == "-") document.getElementById('flip').click();
            if (document.activeElement.tagName !== "VIDEO") {
                if (e.key == "ArrowLeft") seek(-1);
                if (e.key == "ArrowRight") seek(1);
            }
        }
    }


    chrome.storage.sync.get(['optionalInfo'], function(data) {
        if (data.optionalInfo != undefined && data.optionalInfo.default_player == true) {
            video.controls = true;
            if (document.querySelector('.vjs-control-bar')) document.querySelector('.vjs-control-bar').style.display = "none";
            if (document.querySelector('.vjs-text-track-display')) document.querySelector('.vjs-text-track-display').style.display = "none";
            if (document.querySelector('.vjs-big-play-button')) document.querySelector('.vjs-big-play-button').style.display = "none";
            video.autoplay = true;
            video.onclick = function() {
                if (video.paused) video.play();
                else video.pause();
            }
        }
    });


    // Video first loading
    video.onloadedmetadata = function() {
        if (framerate == 30) {
            frames_arr = [0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033]
            frames_html5 = 1/50;
        } else {
            frames_arr = [0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042];
            frames_html5 = 1/40;
        }
        frame = accurate_from_time(video.currentTime);
        frames = accurate_from_time(video.duration);
        show_frm();
        loadFrames();
    }
    video.onloadedmetadata();

    video.onplay = function() {
        seeking = -1;
    }
    video.ontimeupdate = function() {
        if (seeking == video.currentTime) {
            return;
        }
        frame = accurate_from_time(video.currentTime);
        show_frm();

        if (id == "133675" && typeof(settings) != "undefined") {
            if (video.currentTime > 3.1 && video.currentTime < 4.4) {
                settings.innerText = "Panda game!";
            } else {
                settings.innerText = "Settings";
            }
        }
    }
    var comments = document.querySelectorAll('div.comment');
    var exp = /([0-9]+:[0-9.]+)/g;
    for (var i = 0; i < comments.length; i ++) {
        if (comments[i].innerText.match(exp)) {
            comments[i].querySelector('.body').innerHTML = comments[i].querySelector('.body').innerHTML.replaceAll(exp, '<span class="timecode">$1</span>');
        }
    }
    // Load timecodes
    var timecodes = document.querySelectorAll('.timecode');
    for (var i = 0; i < timecodes.length; i ++) {
        let m = timecodes[i].innerText.split(":");
        let s = parseFloat(m[0])*60+parseFloat(m[1]);
        if (s < 0 || s > video.duration) {
            timecodes[i].classList.remove('timecode');
        } else {
            timecodes[i].onclick = function() {
                video.currentTime = s;
                if (window.scrollY > document.getElementById('right-col').offsetTop+video.height/2) {
                    location.href = "#";
                    location.href = "#right-col";
                }
            }
        }
    }
}

if (isGif) { // Gif
    window.onload = function() {
        img.src = img.src.replace('://sakugabooru.com', '://www.sakugabooru.com');
        gif = new SuperGif({gif: img});
        gif.load(function() {
            seek = function(i) {
                frame = frame + i;
                if (frame < 0) frame = 0;
                if (frame > frames) frame = frames;
                seek_frm();
            }
            function show_frm() {
                text_frm.innerText = frame+" / "+frames;
                slider.value = frame;
            }
            function seek_frm() {
                play_gif.innerText = "►";
                gif.pause();
                frame %= frames+1;
                gif.move_to(frame);
                show_frm();
            }
            slider.oninput = function() {
                gif.pause();
                frame = slider.value;
                gif.move_to(frame);
                show_frm();
            }
            
            frames = gif.get_length()-1;
            slider.max = frames;
            show_frm();
            
            gif.get_canvas().onclick = play_gif.onclick = function() {
                if (gif.get_playing()) {
                    play_gif.innerText = "►";
                    gif.pause();
                } else {
                    play_gif.innerText = " || ";
                    gif.play();
                }
            }
            gif.get_canvas().onwheel = function(e) {
                if (e.shiftKey) {
                    if (e.deltaY > 0) seek(1);
                    if (e.deltaY < 0) seek(-1);
                }
            }
            setInterval(function() {
                frame = gif.get_current_frame();
                show_frm();
            }, 250);
            document.onkeydown = function(e) {
                if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
                    var key = (e || window.event).key;
                    if (key == "D" || key == "d" || key == "," || key == "?" || key == "<" || key == "ArrowLeft") seek(-1);
                    if (key == "F" || key == "f" || key == "." || key == ";" || key == ">" || key == "ArrowRight") seek(1);
                    if (!e.ctrlKey && e.key == "-") document.getElementById('flip').click();
                    if (key == " ") play_gif.onclick();
                }
            };
        });
    }
}