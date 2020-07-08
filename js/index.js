var last = -1;
var tags = [];
if (localStorage.recent_tags) {
    tags = localStorage.recent_tags.split(" ");
}
if (tags.length > 0) {
    var div = document.createElement('div');
    div.id = "last-searches";
    var dt = document.createElement('p');
    dt.innerText = "Recommandations:";
    div.appendChild(dt);
    
    for (var i = 0; i < Math.min(30, tags.length); i ++) {
        let search = document.createElement('div');
        search.className = "search";
        search.innerText = tags[i].split("`")[1];
        search.onclick = function() {
            if (last == search.innerText) {
                document.querySelector('form').submit();
            } else {
                last = search.innerText;
                search.className = "search active";
                document.getElementById('tags').value += search.innerText+" ";
            }
        }
        div.appendChild(search);
    }
    document.getElementById('static-index').insertBefore(div, document.getElementById('static-index').children[document.getElementById('static-index').children.length-1]);
}

var btn = document.createElement('button');
btn.innerText = "X";
btn.onclick = function(e) {
    e.preventDefault();
    last = -1;
    document.getElementById('tags').value = "";
    document.querySelectorAll('.search.active').forEach(s => {
        s.className = "search";
    });
}
document.getElementById('tags').onkeypress = function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        document.querySelector('form').submit();
    }
}
document.querySelector('form div').insertBefore(btn, document.querySelector('form div br'));