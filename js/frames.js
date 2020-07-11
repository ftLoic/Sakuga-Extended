/*
Source:
Niku Kikai
https://github.com/KisaragiAyano/web-scripts
Thanks to him for letting me use his scripts for Sakuga Extended!
*/

var framerate = 24;
var video = document.querySelector('video');
if (video) {
    let parent = video.parentElement;
    let nfrm = 0, Nfrm;

    let control = document.createElement('div');
    control.style.width = video.width+'px';
    control.id = "control";
    let text_frm = document.createElement('label');
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
                change_frm(i-3);
            }
            control.appendChild(btn);
        }
    }
    parent.appendChild(control);
    
    function change_frm(i) {
        nfrm = nfrm + i;
        seek_frm();
    }
    function show_frm() {
        text_frm.innerText = nfrm+" / "+Nfrm;
    }
    function seek_frm() {
        video.pause();
        nfrm %= Nfrm+1;
        video.currentTime = nfrm/framerate;
        show_frm();
    }
    video.onloadeddata = function() {
        let duration = video.duration;
        Nfrm = Math.floor(duration*framerate);
        show_frm();
    }
    video.onloadeddata();
    video.ontimeupdate = function() {
        nfrm = Math.round(video.currentTime*framerate);
        show_frm();
    }
    video.onwheel = function(e) {
        if (e.shiftKey) {
            if (e.deltaY > 0) change_frm(1);
            if (e.deltaY < 0) change_frm(-1);
        }
    }
    video.onkeydown = function(e) {
        var key = (e || window.event).key;
        if (key == "D" || key == "d" || key == "," || key == "?" || key == "<") change_frm(-1);
        if (key == "F" || key == "f" || key == "." || key == ";" || key == ">") change_frm(1);
    };
}