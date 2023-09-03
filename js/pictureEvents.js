const pictureEvents = document.querySelectorAll('.comment .body script');
for (let pictureEvent of pictureEvents) {
    eval(pictureEvent.innerHTML);
}