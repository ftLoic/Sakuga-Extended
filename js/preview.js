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

var posts = document.querySelectorAll("#post-list-posts > li");
var formats = ['mp4','mkv','webm','gif'];
var search = document.getElementById('tags') ? document.getElementById('tags').value+" " : "";
function loadPosts(data) {
    for (var i = 0; i < posts.length; i ++) {
        let thumb = posts[i].getElementsByClassName("thumb")[0];
        let direct_link = posts[i].getElementsByClassName("directlink")[0];
        let preview_img = thumb.getElementsByClassName('preview')[0];
        let splitted_url;
        if (direct_link) { // Post
            splitted_url = direct_link.href.split(".");
        } else { // Pools
            splitted_url = ["mp4"];
            posts[i].children[0].style.height = (posts[i].children[0].offsetHeight+41)+"px";
        }
        let ext = splitted_url[splitted_url.length-1];
        if (formats.indexOf(ext) > -1) {
            thumb.onmouseenter = function() {
                stop = false;
                video.width = preview_img.width;
                video.height = preview_img.height;
                if (direct_link) {
                    // Thanks to Iluvatar who actually reminded me that I still had to work on the extension :slightlyflustereddoggo:
                    if (ext == "gif") {
                        preview_img.dataset.realSrc = preview_img.src;
                        preview_img.src = direct_link.href;
                    } else {
                        video.src = direct_link.href;
                    }
                } else {
                    var src = preview_img.src.substr(0, preview_img.src.length-4).replace("preview/","");
                    if (preview_img.dataset.src) {
                        video.src = preview_img.dataset.src;
                    } else {
                        video.src = src+".mp4";
                    }
                }
                crttime = 0;
                thumb.appendChild(video);
                video.style.display = "block";
                video.onplay = function() {
                    preview_img.style.opacity = "0";
                }
            };
            thumb.onmouseleave = function() {
                stop = true;
                video.pause();
                preview_img.style.opacity = "1";
                video.style.display = "none";
                if (preview_img.dataset.realSrc) {
                    preview_img.src = preview_img.dataset.realSrc;
                }
                preview_img.dataset.src = video.src; // save src (in case it was webm)
            };
        }
        var info = document.createElement('div');
        info.className = "post-detail";
        var array = [
            preview_img.title.split("Rating: ")[1].split(" Score: ")[0],
            preview_img.title.split("Score: ")[1].split(" Tags: ")[0],
            preview_img.title.split("Tags: ")[1].split(" User: ")[0],
            preview_img.title.split("User: ")[1]
        ];
        preview_img.dataset.title = preview_img.title;
        preview_img.removeAttribute('title');
        var score = document.createElement('span');
        score.className = "score";
        score.innerText = array[1];
        var tags = document.createElement('span');
        tags.className = "tags";

        var authors = document.createElement('span');
        authors.className = "authors";
        var unknown = document.createElement('span');
        unknown.className = "authors";
        var series = document.createElement('span');
        series.className = "series";
        var styles = document.createElement('span');
        styles.className = "styles";
        var others = document.createElement('span');
        others.className = "others";
        var presumed = document.createElement('span');
        presumed.className = "presumed";

        var list_tags = array[2].split(" ");
        for (var j = 0; j < list_tags.length; j ++) {
            if (search.indexOf(list_tags[j]+" ") == -1) {
                if (list_tags[j] == "presumed") {
                    presumed.innerText = "(?) ";
                } else {
                    if (localStorage.tag_data.indexOf("1`"+list_tags[j]+"`") > -1) authors.innerText += list_tags[j]+" ";
                    else if (localStorage.tag_data.indexOf("3`"+list_tags[j]+"`") > -1) series.innerText += list_tags[j]+" ";
                    else if (localStorage.tag_data.indexOf("4`"+list_tags[j]+"`") > -1) styles.innerText += list_tags[j]+" ";
                    else if (localStorage.tag_data.indexOf("0`"+list_tags[j]+"`") > -1) others.innerText += list_tags[j]+" ";
                    else unknown.innerText += list_tags[j]+" "
                }
            }
        }
        series.innerText = abbr(series.innerText);

        tags.title = array[2];
        tags.appendChild(authors);
        tags.appendChild(unknown);
        tags.appendChild(presumed);
        tags.appendChild(series);
        tags.appendChild(styles);
        tags.appendChild(others);

        if (data == undefined) {
            data = {'score': true, 'tags': true};
        }
        if (data['score'] != false) {
            info.appendChild(score);
        } else {
            tags.setAttribute('style', '-webkit-line-clamp: 3;max-height: 39px;');
        }
        if (data['tags'] != false) {
            info.appendChild(tags);
        }
        thumb.appendChild(info);
    }
}
if (localStorage.tag_data) {
    chrome.storage.sync.get(['optionalInfo'], function(data) {
        loadPosts(data.optionalInfo);
    });
} else {
    window.addEventListener("message", function(event) {
        if (event.source != window) return;
        if (event.data.type && event.data.text && (event.data.type === "FROM_PAGE" && event.data.text === "we_can_catch_the_tag")) {
            console.log("Request result:",event.data);
            chrome.storage.sync.get(['optionalInfo'], function(data) {
                loadPosts(data.optionalInfo);
            });
        }
    });
    var script = document.createElement('script');
    script.defer = true;
    script.innerHTML = `
    jQuery.ajax({
        url: "/tag/summary.json",
        dataType: "json"
    }).done((function(_this) {
        return function(json) {
            if (json.unchanged) {
                _this.tag_data = localStorage.tag_data;
            } else {
                _this.tag_data = json.data;
                localStorage.tag_data = _this.tag_data;
                localStorage.tag_data_version = json.version;
            }
            window.postMessage({type: "FROM_PAGE", text: "we_can_catch_the_tag"}, "*");
        };
    })(this));`;
    document.body.append(script);
    
}
function _onerror() {
    if (video.src.indexOf('.webm') === -1) {
        video.src = video.src.substr(0, video.src.length-4) + ".webm";
        video.load();
    }
}
function abbr(text) {
    text = text.replace(/background/g, "bg");

    text = text.replace(/mob_psycho/g, "mob");
    text = text.replace(/dragon_ball/g, "db");
    text = text.replace(/my_hero_academia/g, "mha");
    text = text.replace(/shingeki_no_kyojin/g, "snk");
    text = text.replace(/sword_art_online/g, "sao");
    text = text.replace(/re:_zero_kara_hajimeru_isekai_seikatsu/g, "re:_zero");
    text = text.replace(/boruto:_naruto_next_generations/g, "boruto");
    return text;
}

var crttime = 0;
var stop = true;
var timer = function() {
    if (video.readyState > 1 && !stop) { // HAVE_CURRENT_DATA
        // play whole video in 5 sec (max)
        var inc = video.duration/2 / 5;
        if (inc < 1) inc = 1;
        crttime = (crttime + inc) % video.duration;
        video.currentTime = crttime;
    }
}
setInterval(timer, 500);