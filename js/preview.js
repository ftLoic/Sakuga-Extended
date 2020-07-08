/*
Source:
Niku Kikai
https://github.com/KisaragiAyano/web-scripts
Thanks to him for letting me use his scripts for Sakuga Extended!
*/

var video = document.createElement('video');
video.autoplay = "true";
video.muted = "true";
video.loop = "true";
video.onerror = _onerror;

var posts = [];
if (document.getElementById("post-list-posts")) {
    posts = document.getElementById("post-list-posts").children;
}
var formats = ['mp4','mkv','webm'];
var search = document.getElementById('tags').value+" ";
for (var i = 0; i < posts.length; i++) {
    var thumb = posts[i].getElementsByClassName("thumb")[0];
    var preview_img = thumb.getElementsByClassName('preview')[0];
    var direct_link = posts[i].getElementsByClassName("directlink")[0];
    var splitted_url = direct_link.href.split(".");
    if (formats.indexOf(splitted_url[splitted_url.length-1]) > -1) {
        thumb.addEventListener('mouseenter', _mouseenter);
        thumb.addEventListener('mouseleave', _mouseleave);
    }
    var info = document.createElement('div');
    info.className = "info";
    var array = [
        preview_img.title.split("Rating: ")[1].split(" Score: ")[0],
        preview_img.title.split("Score: ")[1].split(" Tags: ")[0],
        preview_img.title.split("Tags: ")[1].split(" User: ")[0],
        preview_img.title.split("User: ")[1]
    ];
    var score = document.createElement('span');
    score.className = "score";
    score.innerText = array[1];
    var tags = document.createElement('span');
    tags.className = "tags";

    var authors = document.createElement('span');
    authors.className = "authors";
    var series = document.createElement('span');
    series.className = "series";
    var styles = document.createElement('span');
    styles.className = "styles";
    var others = document.createElement('span');
    others.className = "others";

    var list_tags = array[2].split(" ");
    console.log(list_tags);
    for (var j = 0; j < list_tags.length; j ++) {
        if (search.indexOf(list_tags[j]+" ") == -1) {
            if (localStorage.tag_data.indexOf("1`"+list_tags[j]+"`") > -1) authors.innerText += list_tags[j]+" ";
            else if (localStorage.tag_data.indexOf("3`"+list_tags[j]+"`") > -1) series.innerText += list_tags[j]+" ";
            else if (localStorage.tag_data.indexOf("4`"+list_tags[j]+"`") > -1) styles.innerText += list_tags[j]+" ";
            else others.innerText += list_tags[j]+" ";
        }
    }
    series.innerText = abbr(series.innerText);
    others.innerText = abbr(others.innerText);

    tags.title = array[2];
    tags.appendChild(authors);
    tags.appendChild(series);
    tags.appendChild(styles);
    tags.appendChild(others);

    info.appendChild(score);
    info.appendChild(tags);
    thumb.appendChild(info);
}

function _mouseenter(e) {
    var thumb = e.srcElement;
    var preview_img = thumb.getElementsByClassName('preview')[0];
    video.width = preview_img.width;
    video.height = preview_img.height;
    var src = preview_img.src.substr(0, preview_img.src.length-4).replace("preview/","");
    video.src = src+".mp4";
    stop = false;
    crttime = 0;
    thumb.appendChild(video);
    video.style.display = "block";
    video.onplay = function() {
        preview_img.style.display = "none";
    }
}
function _mouseleave(e) {
    stop = true;
    video.pause();
    var thumb = e.srcElement;
    var preview_img = thumb.getElementsByClassName("preview")[0];
    preview_img.style.display = "block";
    video.style.display = "none";
}
function _onerror(e) {
    video.src = video.src.substr(0, video.src.length-4) + ".webm";
    video.load();
}
function abbr(text) {
    text = text.replace(/presumed/g, "?");
    text = text.replace(/artist_unknown/g, "ano");
    text = text.replace(/background/g, "bg");

    text = text.replace(/mob_psycho/g, "mob");
    text = text.replace(/dragon_ball/g, "db");
    text = text.replace(/my_hero_academia/g, "mha");
    text = text.replace(/shingeki_no_kyojin/g, "snk");
    text = text.replace(/sword_art_online/g, "sao");
    text = text.replace(/re:_zero_kara_hajimeru_isekai_seikatsu/g, "re:_zero");
    return text;
}

var crttime = 0;
var stop = true;
var timer = function(){
    if (video.readyState > 1 && !stop){ //HAVE_CURRENT_DATA
        // play whole video in 5 sec (max)
        var inc = video.duration/2 / 5;
        if (inc < 1) inc = 1;
        crttime = (crttime + inc) % video.duration;
        video.currentTime = crttime;
    }
};

setInterval(timer, 500);