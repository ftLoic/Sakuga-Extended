/*
Source:
Niku Kikai
https://github.com/KisaragiAyano/web-scripts
Thanks to him for letting me use his scripts for Sakuga Extended!
*/

var framerate = 24,
    frames = frame = 0,
    frames_html5 = 1/40,
    frames_arr = [],
    video = document.querySelector('video'),
    img = document.querySelector('img'),
    isGif = (img && /.gif$/.test(img.src) && !/Firefox\//.test(navigator.userAgent)), // Not supported
    booruLink = document.createElement('a'),
    gif, seek, control, text_frm, slider, play_gif, artistPartsConfirmed = 0, artistFrames;
try {
    var idHash = /data\/([0-9a-z]+)/.exec(location.href)[1];
    fetch("https://www.sakugabooru.com/post.json?tags=md5%3A" + idHash).then(res => {
        res.json().then(posts => {
            if (posts && posts.length == 1) {
                booruLink.href = "https://www.sakugabooru.com/post/show/" + posts[0].id;
                booruLink.innerText = "Link to the post";
                booruLink.classList.add('link');
                booruLink.id = 'booruLink';
            }
        });
    });
} catch {}

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

if (video || isGif) {
    var el = video;

    if (isGif) {
        el = img;

        var gif_control = document.createElement('div');
        gif_control.style.width = (el.width != 0) ? el.width+'px' : el.offsetWidth+'px';
        gif_control.style.display = "flex";
        gif_control.classList.add('frame-control');

        play_gif = document.createElement('button');
        play_gif.innerText = " || ";
        slider = document.createElement('input');
        slider.type = "range";
        slider.min = slider.max = "0";
        slider.style.flex = "1";

        gif_control.appendChild(play_gif);
        gif_control.appendChild(slider);

        document.querySelector('body').append(gif_control);
    }

    control = document.createElement('div'),
    control.classList.add('frame-control');
    control.id = 'controls';
    text_frm = document.createElement('label');

    if (video) {
        control.classList.add('controlDataVideo');
        //If the video has already loaded, execute the function
        if (video.readyState > 2) {
            loadVideoHeight();
        } else {
            video.onloadeddata = loadVideoHeight;
        }
    }

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

    // Link to the booru post
    control.appendChild(booruLink); 

    document.querySelector('body').appendChild(control);
}

if (video) {
    function show_frm() {
        text_frm.innerText = frame+" / "+frames;
    }
    // Frame seeker
    var frame = 0, seeking = video.currentTime;
    seek = function(n) {
        if (seeking == video.currentTime) {
            frame += n;
        } else {
            frame = frameFromTime(video.currentTime)+n;
        }
        video.pause();
        frame = Math.max(0, Math.min(frames, frame)); // Limit 0 and max frame
        var frameTime = timeFromFrame(frame);
        video.currentTime = frameTime+frames_html5; // HTML5 players are dumb, we have to move a little forward

        show_frm();
        seeking = video.currentTime;
    }
    // Shortcuts
    document.onkeydown = function(e) {
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            if ((!e.ctrlKey && (e.key == "D" || e.key == "d")) || e.key == "," || e.key == "?" || e.key == "<") seek(-1);
            if ((!e.ctrlKey && (e.key == "F" || e.key == "f")) || e.key == "." || e.key == ";" || e.key == ">") seek(1);
            if (document.activeElement.tagName !== "VIDEO") {
                if (e.key == "ArrowLeft") seek(-1);
                if (e.key == "ArrowRight") seek(1);
            }
        }
    }

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
        show_frm();
    }
    video.onloadedmetadata();

    video.onplay = function() {
        seeking = -1;
    }
    video.ontimeupdate = function() {
        if (seeking == video.currentTime) {
            return;
        }
        frame = frameFromTime(video.currentTime);
        show_frm();
    }
}

if (isGif) { // Gif
    window.onload = function() {
        //Put all conotrol elements in the same div
        var divGif = document.createElement('div');
        divGif.id = 'divGif';
        divGif.appendChild(img);
        divGif.appendChild(gif_control);
        divGif.appendChild(controls);

        img.src = img.src.replace('://sakugabooru.com', '://www.sakugabooru.com');

        document.querySelector('body').append(divGif);
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
                    if (key == " ") play_gif.onclick();
                }
            };
        });
    }
}

function loadVideoHeight() {
    //Put the controls directly under the video
    control.style.marginTop = video.videoHeight/2 + 20 + 'px';
}
