const video = document.querySelector('video');

const newVideo = document.createElement('video');
newVideo.innerHTML = video.innerHTML;
newVideo.controls = true;
newVideo.muted = true;
newVideo.autoplay = true;
newVideo.loop = true;

let players = Object.values(videojs.players);

if (players.length < 2) { // 0 or 1 player active
    video.parentNode.parentNode.insertBefore(newVideo, video.parentNode);
    
    if (players.length == 0) { // VideoJS isn't loaded
        video.remove();
    } else { // Remove video & its VideoJS events
        players[0].dispose();
    }

    window.postMessage("VIDEO_RESET", window.location.href);
}