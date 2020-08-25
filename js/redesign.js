function newDesign() {
    var link = document.createElement('link');
    link.href = chrome.extension.getURL('css/post_redesign.css');
    link.rel = "stylesheet";
    document.documentElement.appendChild(link);
}
if (localStorage.newDesign == "1") {
    document.addEventListener('DOMContentLoaded', newDesign, false);
}