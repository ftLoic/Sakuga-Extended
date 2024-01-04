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
    video, gif, img, isGif,
    gifManager, seek, seeking, refreshFrameInfo, slider, gifButton,
    artistPartsConfirmed = 0, artistFrames;

// From Sakuga Encode
function timeFromFrame(n) {
    var ct = 0, f;
    for (var i = 0; i < n; i++) {
        f = frames_arr[i % frames_arr.length];
        ct += f;
    }
    return parseFloat((ct).toFixed(3));
}
function frameFromTime(v) {
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
function timestampFromSeconds(seconds) {
    if (isNaN(seconds)) {
        return "0:00";
    }

    seconds = parseFloat(seconds).toFixed(1);
    let minutes = Math.floor(seconds / 60);
    seconds = parseFloat((seconds % 60).toFixed(1));

    minutes = String(minutes).padStart(1, "0");
    if (Number.isInteger(seconds)) {
        seconds = String(seconds).padStart(2, "0");
    } else {
        seconds = String(seconds).padStart(4, "0");
    }
    return minutes + ":" + seconds;
}
function updateArtist() {
    if (artistPartsConfirmed < 1) return;

    function updateText() {
        var artist = "";
        const currentTime = parseFloat(video.currentTime.toFixed(1));
        for (var i = 0; i < artistFrames.length; i ++) {
            if (currentTime >= artistFrames[i][0] && currentTime <= artistFrames[i][1]) {
                artist = artistFrames[i][2];
            }
        }
    
        var text = "Current artist: "+artist;
        if (artist != "") {
            if (document.getElementById('current-artist').innerText != text) {
                document.getElementById('current-artist').innerText = "Current artist: "+artist;
            }
        } else {
            document.getElementById('current-artist').innerText = "";
        }
    }

    if (document.getElementById('current-artist')) {
        updateText();
    } else {
        setTimeout(updateText, 50);
    }
}
function readShortcuts(e) {
    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        if ((!e.ctrlKey && (e.key == "D" || e.key == "d")) || e.key == "," || e.key == "?" || e.key == "<") {
            seek(-1 - e.altKey - e.shiftKey);
        }
        if ((!e.ctrlKey && (e.key == "F" || e.key == "f")) || e.key == "." || e.key == ";" || e.key == ">") {
            seek(1 + e.altKey + e.shiftKey);
        }
        if (!e.ctrlKey && e.key == "-") {
            document.getElementById('flip').click();
        }
        if (document.activeElement.tagName !== "VIDEO") {
            if (e.key == "ArrowLeft") {
                seek(-1 - e.altKey - e.shiftKey);
            }
            if (e.key == "ArrowRight") {
                seek(1 + e.altKey + e.shiftKey);
            }
        }
    }
}
function buildControls() {
    let el;
    if (video) {
        el = video;
    } else {
        el = gif;
    }

    const frameControl = document.createElement('div');
    frameControl.style.width = (el.width != 0) ? el.width+'px' : el.offsetWidth+'px';
    frameControl.classList.add('frame-control');

    const frameInfo = document.createElement('div');
    frameInfo.classList.add('frame-info');

    const frameInfoTop = document.createElement('div');
    const frameInfoBottom = document.createElement('div');
    frameInfoBottom.style.marginTop = '1px';

    const currentFrame = document.createElement('input');
    currentFrame.id = 'current-frame';
    currentFrame.type = 'number';
    currentFrame.dir = 'rtl';
    currentFrame.min = 0;
    currentFrame.max = 9999;
    currentFrame.step = 1;
    currentFrame.style.width = '70px';
    currentFrame.classList.add('input-number');
    currentFrame.onchange = function (e) {
        seek(parseInt(e.target.value) - frame);
    }

    const totalFrame = document.createElement('label');
    totalFrame.id = 'total-frame';
    
    const currentTimestamp = document.createElement('input');
    currentTimestamp.id = 'current-timestamp';
    currentTimestamp.type = 'text';
    currentTimestamp.readOnly = true;
    currentTimestamp.style.width = '70px';
    currentTimestamp.classList.add('input-number');
    currentTimestamp.onclick = function () {
        this.select();
    }

    const totalTimestamp = document.createElement('label');
    totalTimestamp.id = 'total-timestamp';
    
    const arrows = ['<<<', '<<', '<', null, '>', '>>', '>>>'];
    for (let i = 0; i < arrows.length; i ++) {
        if (arrows[i] == null) {
            frameInfoTop.appendChild(currentFrame);
            frameInfoTop.appendChild(totalFrame);

            if (video) {
                frameInfoBottom.appendChild(currentTimestamp);
                frameInfoBottom.appendChild(totalTimestamp);
            }

            frameInfo.appendChild(frameInfoTop);
            frameInfo.appendChild(frameInfoBottom);
            
            frameControl.appendChild(frameInfo);
        } else {
            let btn = document.createElement('button');
            btn.innerText = arrows[i];
            btn.classList.add('frame-button');
            btn.onclick = function() {
                seek(i-3);
            }
            frameControl.appendChild(btn);
        }
    }

    // Insert controllers above video
    const videoContainer = document.querySelector('.content div:not([id]):first-of-type');
    const deletedVideoContainer = document.getElementById('deleted-video');
    if (deletedVideoContainer) {
        deletedVideoContainer.appendChild(frameControl);
    } else if (videoContainer) {
        videoContainer.parentNode.insertBefore(frameControl, videoContainer.nextSibling);
    }
    
    if (gif) {
        const gifControl = document.createElement('div');
        gifControl.style.width = (gif.width != 0) ? gif.width+'px' : gif.offsetWidth+'px';
        gifControl.style.display = "flex";
        gifControl.classList.add('frame-control');
        
        gifButton = document.createElement('button');
        gifButton.innerText = " || ";

        slider = document.createElement('input');
        slider.type = "range";
        slider.min = slider.max = "0";
        slider.style.flex = "1";

        gifControl.appendChild(gifButton);
        gifControl.appendChild(slider);
        
        videoContainer.parentNode.insertBefore(gifControl, frameControl);
    }
}
function buildCommentModifiers() {
    const comments = document.querySelectorAll('div.comment');
    const exp = /([0-9]+:[0-9]+([.,][0-9])?)/g;
    for (let i = 0; i < comments.length; i ++) {
        if (comments[i].innerText.match(exp)) {
            comments[i].querySelector('.body').innerHTML = comments[i].querySelector('.body').innerHTML.replaceAll(exp, '<span class="timecode">$1</span>');
        }
    }

    // Load timecodes
    const timecodes = document.querySelectorAll('.timecode');
    for (let i = 0; i < timecodes.length; i ++) {
        let m = timecodes[i].innerText.replace(/,/g, ".").split(":");
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

    // Reload picture events
    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('js/pictureEvents.js');
    (document.head || document.documentElement).appendChild(script);
}
function loadADs() {
    const sourceDiv = document.querySelector('#stats ul li');
    if (sourceDiv && sourceDiv.innerText.startsWith("Source: ")) {
        const source = sourceDiv.innerText.substring(8);
        const artists = [...document.querySelectorAll('#tag-sidebar li.tag-type-artist')];
        const exp = /(?:^|,|\(|\/)\s*(?<roles>(?:Solo\s*)?(?:CD|SB|ED|AD|AAD|CAD|EAD|Animation Director|[A-Za-z]+ AD|[A-Za-z]+ Animation Director|KA|2nd KA|2nd Key Animator)(?:\s*[,\/]\s*(?:Solo\s*)?(?:CD|SB|ED|AD|AAD|CAD|EAD|Animation Director|[A-Za-z]+ AD|[A-Za-z]+ Animation Director|KA|2nd KA|2nd Key Animator))*)\s*:\s*(?<names>(?:[^,\/\)]{1,30})(?![^,\/\)])(?:,\s*[^:,)]+(?=,|$|\)))*)/gi;

        function findArtist(name) {
            const fullName = artists.find(li => li.querySelector('a:last-of-type').childNodes[0].nodeValue == name);
            if (fullName) {
                return fullName;
            }

            const lastName = artists.find(li => li.querySelector('a:last-of-type').childNodes[0].nodeValue.endsWith(name));
            if (lastName) {
                return lastName;
            }

            return null;
        }
    
        const matches = source.toLowerCase().trim().matchAll(exp);
        for (let match of matches) {
            console.log(match);

            const role = match.groups.roles.trim()
                .replace(/\s*[/,]\s*/g, "/")
                .replace(/chief animation director/g, "CAD")
                .replace(/animation director/g, "AD")
                .replace(/key animator/g, "KA");

            const names = match.groups.names.split(/,/g).map(name => name.trim());

            for (let name of names) {
                console.log(role, name);

                const artist = findArtist(name);

                console.log(artist);
                if (artist) {
                    // artist.classList.remove('tag-type-artist');
                    // artist.classList.add('tag-type-ad');
    
                    const hintSpan = document.createElement('span');
                    hintSpan.classList.add('role-hint');
                    hintSpan.innerText = ` (${role.toLowerCase()})`;
                    
                    artist.querySelector('a:last-of-type').appendChild(hintSpan);
                } else {
                    if (!document.querySelector('#tag-sidebar.untagged')) {
                        const sidebarParent = document.getElementById('tag-sidebar').parentNode;
    
                        const h5 = document.createElement('h5');
                        h5.innerText = "Not tagged";
    
                        const notice = document.createElement('p');
                        notice.setAttribute('style', "color: #777 !important;font-size: 10px;margin-top: 4px;");
                        notice.innerText = "These artists are automatically retrieved from the Source field, but their level of contribution is either unknown or not significant enough to be tagged.";
    
                        const untaggedSidebar = document.createElement('div');
                        untaggedSidebar.id = "tag-sidebar";
                        untaggedSidebar.classList.add('untagged');
                        
                        sidebarParent.appendChild(h5);
                        sidebarParent.appendChild(untaggedSidebar);
                        sidebarParent.appendChild(notice);
                    }
    
                    const artistTag = document.createElement('li');
                    artistTag.classList.add('tag-type-artist');
    
                    const artistTagHelp = document.createElement('a');
                    artistTagHelp.href = "/artist/show?name=" + name.replace(/ /g, "_");
                    artistTagHelp.innerText = "?";
    
                    const artistTagLink = document.createElement('a');
                    artistTagLink.href = "/post?tags=" + name.replace(/ /g, "_");
                    artistTagLink.innerText = name;
    
                    const hintSpan = document.createElement('span');
                    hintSpan.classList.add('role-hint');
                    hintSpan.innerText = ` (${role.toLowerCase()})`;
    
                    artistTagLink.appendChild(hintSpan);
                    artistTag.appendChild(artistTagHelp);
                    artistTag.appendChild(artistTagLink);
    
                    document.querySelector('#tag-sidebar.untagged').appendChild(artistTag);
                }
            }
        }
    }
}
function loadTimestamps() {
    artistFrames = [];
    artistPartsConfirmed = 0;

    var exp = /([0-9]*:[0-9]{2}([.,][0-9])?|start)s?[ ]*(-|–|~|〜|to)[ ]*([0-9]*:[0-9]{2}([.,][0-9])?|end)s?[ ]*(\(.*\))?[ ]*(:| :| )[ ]*(should be|might be|maybe|may be|could be|looks? like|can be|looks)?(is also|is confirmed|also is|is |by |-)?[ ]*([a-zA-Z0-9+-_ \u00C0-\u024F\u1E00-\u1EFF]{1,30})(.*presume.*|.*\?.*)?(\.|$|\n|\()/gi;
    var comments = document.querySelectorAll('div.comment');

    for (var i = 0; i < comments.length; i ++) {
        var testComment = comments[i].cloneNode(true);
        if (i > 0 && testComment.querySelector('blockquote')) { // Don't read quotes if it's not the first comment
            testComment.querySelector('blockquote').remove();
        }
        // console.log(testComment.querySelector('.body').innerHTML.replace(/<br>/g, "\n").replace(/<[^\>]+>/g, "\n"));
        var matches = (testComment.querySelector('.body').innerHTML.replace(/<br>/g, "\n").replace(/<[^\>]+>/g, "\n")+"\n").matchAll(exp);
        for (var match of matches) {
            // console.log(match);
            var artist = match[10].trim().replace(/[_]/g, " ");
            if (artist.length > 0 && artist.length < 27) {
                if (match[8] != undefined || match[11] != undefined) {
                    artist += " (?)";
                }
                if (match[1].toLowerCase() == "start") match[1] = "00:00";
                if (match[4].toLowerCase() == "end") match[4] = "10:00";
                var partsStart = match[1].split(":");
                var partsEnd = match[4].split(":");
                var frameStart = parseFloat(partsStart[0])*60+parseFloat(partsStart[1]);
                var frameEnd = parseFloat(partsEnd[0])*60+parseFloat(partsEnd[1]);
                artistFrames.push([frameStart, frameEnd, artist]);
                artistPartsConfirmed ++;
            }
        }
    }
    // console.log(artistFrames);

    updateArtist();
}
function loadVideoEvents() {
    // Video first loading
    video.onloadedmetadata = function() {
        if (framerate == 30) {
            frames_arr = [0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.033, 0.034, 0.033, 0.034, 0.033]
            frames_html5 = 1/50;
        } else {
            frames_arr = [0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042, 0.041, 0.042, 0.042];
            frames_html5 = 1/40;
        }

        frame = frameFromTime(video.currentTime);
        frames = frameFromTime(video.duration);
        if (document.getElementById('current-frame')) {
            document.getElementById('current-frame').max = frames;
        }

        refreshFrameInfo();
    }
    // Init video anyway before the first loading event
    video.onloadedmetadata();

    video.onplay = function() {
        seeking = -1;
    }
    // Refresh frames
    video.ontimeupdate = function() {
        if (seeking == video.currentTime) {
            return;
        }

        frame = frameFromTime(video.currentTime);
        refreshFrameInfo();

        // Panda game
        if (id == "164035" && typeof(settings) != "undefined") {
            if (video.currentTime > 3.1 && video.currentTime < 4.4) {
                settings.innerText = "Panda game!";
            } else {
                settings.innerText = "Settings";
            }
        }
    }
}

function initFrameScript() {
    video = document.querySelector('#right-col video');
    gif = document.querySelector('#right-col img[src$=".gif"]');
    img = document.querySelector('#right-col img:not([src$=".gif"])');
    isGif = (gif && !/Firefox\//.test(navigator.userAgent)); // Not supported on Firefox

    try {
        id = /show\/([0-9]+)/.exec(location.href)[1];
    } catch {
        console.log("Could not get post ID");
    }

    if (video || isGif) {
        // Shortcuts
        document.onkeydown = readShortcuts;
    
        buildControls();
    }
    
    if (video) {
        // Use default player
        if (video.classList.contains('video-js') || video.classList.contains('vjs-tech')) {
            chrome.storage.sync.get(['optionalInfo'], function(data) {
                if (data.optionalInfo != undefined && data.optionalInfo.default_player == true) {
                    var messageListener = function (e) {
                        if (e.data == "VIDEO_RESET") {
                            video = document.querySelector('#right-col video');
                            loadVideoEvents();
                        }
                        window.removeEventListener('message', messageListener);
                    }
                    window.addEventListener('message', messageListener);
    
                    // Kill videojs
                    var script = document.createElement('script');
                    script.src = chrome.runtime.getURL('js/resetVideo.js');
                    (document.head || document.documentElement).appendChild(script);
                }
            });
        }

        // Frame seeker
        seeking = video.currentTime;
        refreshFrameInfo = function () {
            updateArtist();
        
            if (!document.getElementById('current-frame')) {
                return;
            }
        
            // Frame labels
            if (document.activeElement != document.getElementById('current-frame')) {
                document.getElementById('current-frame').value = frame;
            }
            document.getElementById('total-frame').innerText = frames;
            
            // Timestamp labels
            if (document.activeElement != document.getElementById('current-timestamp')) {
                document.getElementById('current-timestamp').value = timestampFromSeconds(document.querySelector('video').currentTime);
            }
            document.getElementById('total-timestamp').innerText = timestampFromSeconds(document.querySelector('video').duration);
        }
        seek = function (n) {
            if (seeking == video.currentTime) {
                frame += n;
            } else {
                frame = frameFromTime(video.currentTime)+n;
            }
            video.pause();
            frame = Math.max(0, Math.min(frames, frame)); // Limit 0 and max frame
            var frameTime = timeFromFrame(frame);
            video.currentTime = frameTime+frames_html5; // HTML5 players are dumb, we have to move a little forward
            
            refreshFrameInfo();
            seeking = video.currentTime;
        }
    
        loadVideoEvents();
        loadADs();
        loadTimestamps();
        buildCommentModifiers();
    }
    
    if (isGif) {
        window.onload = function() {
            gifManager = new SuperGif({gif: gif});
            gifManager.load(function() {
                seek = function(i) {
                    frame = frame + i;
                    if (frame < 0) frame = 0;
                    if (frame > frames) frame = frames;
                    seek_frm();
                }
                function refreshFrameInfo() {
                    if (!document.getElementById('current-frame')) {
                        return;
                    }
                
                    // Frame labels
                    if (document.activeElement != document.getElementById('current-frame')) {
                        document.getElementById('current-frame').value = frame;
                    }
                    document.getElementById('total-frame').innerText = frames;
                    
                    slider.value = frame;
                }
                function seek_frm() {
                    gifButton.innerText = "►";
                    gifManager.pause();
                    frame %= frames+1;
                    gifManager.move_to(frame);
                    refreshFrameInfo();
                }
                slider.oninput = function() {
                    gifManager.pause();
                    frame = slider.value;
                    gifManager.move_to(frame);
                    refreshFrameInfo();
                }
                
                frames = gifManager.get_length()-1;
                slider.max = frames;
                refreshFrameInfo();
                
                gifManager.get_canvas().onclick = gifButton.onclick = function() {
                    if (gifManager.get_playing()) {
                        gifButton.innerText = "►";
                        gifManager.pause();
                    } else {
                        gifButton.innerText = " || ";
                        gifManager.play();
                    }
                }
                gifManager.get_canvas().onwheel = function(e) {
                    if (e.shiftKey) {
                        if (e.deltaY > 0) seek(1);
                        if (e.deltaY < 0) seek(-1);
                    }
                }
                setInterval(function() {
                    frame = gifManager.get_current_frame();
                    refreshFrameInfo();
                }, 250);
            });
        }
    }
}

// Remove private pools
var script = document.createElement('script');
script.src = chrome.runtime.getURL('js/framesScript.js');
(document.head || document.documentElement).appendChild(script);

// Deleted video: "Show anyway" feature
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
        let loaded = false;
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

initFrameScript();