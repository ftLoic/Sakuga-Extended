var last = -1;
var tags = [];
var main = document.getElementById('static-index');
if (localStorage.recent_tags) {
    tags = localStorage.recent_tags.split(" ");
}

var div = document.createElement('div');
div.id = "last-searches";
var div2 = document.createElement('div');
div2.id = "sakuga-extended";

chrome.storage.sync.get(['optionalInfo'], function(data) {
    console.log(data.optionalInfo);
    if (data.optionalInfo == undefined || data.optionalInfo.recommendations != false) {
        if (tags.length > 0) {
            var dt = document.createElement('p');
            dt.innerText = "Recommendations:";
            div.appendChild(dt);
            
            for (var i = 0; i < Math.min(30, tags.length); i ++) {
                if (tags[i].split("`")[1]) {
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
            }
        }
    }
});
var thanks = document.createElement('small');
thanks.id = "thanks";
thanks.innerText = "Thank you for using the last version of Sakuga Extended! You can check the changelog ";

var thanksa = document.createElement('a');
thanksa.innerText = "here";
thanksa.href = chrome.runtime.getURL('changelog.html');
thanksa.target = "_blank";
thanks.appendChild(thanksa);

thanks.innerHTML += "<br>You also can play ";
var thanksa = document.createElement('a');
thanksa.innerText = "SAKUTRAIN";
thanksa.href = chrome.runtime.getURL('html/sakutrain/index.html');
thanksa.target = "_blank";
thanks.appendChild(thanksa);
thanks.innerHTML += " now!";

div2.appendChild(thanks);
main.insertBefore(div2, main.children[main.children.length-1]);
main.insertBefore(div, div2);

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