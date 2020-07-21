var div = document.createElement('div');
div.style.display = "none";

function select(name, id, options) {
    var dselect = document.createElement('div');
    var sort = document.createElement('select');
    let search = document.getElementById('tags').value;
    let reg = new RegExp(id+":([^ ]+) ?", "g");
    let detected = reg.exec(search);
    dselect.innerText = name;
    for (var i = 0;i < options.length; i ++) {
        var opt = document.createElement('option');
        opt.innerText = opt.value = options[i];
        if (detected && detected[1] == options[i]) {
            opt.selected = true;
        }
        sort.appendChild(opt);
    }
    sort.onchange = function() {
        search = search.replace(reg, "").trim();
        if (this.value != "date" && this.value != "all") {
            search += " "+id+":"+this.value+" ";
        }
        document.getElementById('tags').value = search;
    }
    dselect.appendChild(sort);
    return dselect;
}

var dsort   = select("Sort by ", "order", ['date', 'id', 'id_desc', 'score', 'score_asc', 'mpixels', 'mpixels_asc']);
var drating = select("Rating ", "rating", ['all', 'safe', 'questionable', 'explicit']);

var launch = document.createElement('button');
launch.innerText = "Search again";
launch.onclick = function() {
    location.href = "?tags="+document.getElementById('tags').value;
}
// append all
div.appendChild(dsort);
div.appendChild(drating);
div.appendChild(launch);

var btn = document.createElement('a');
btn.href = "#";
btn.innerText = "Sakuga Extended Search";
btn.id = "extended_search";
btn.onclick = function() {
    div.style.display = div.style.display == "none" ? "block" : "none";
}

document.querySelector('.sidebar').children[0].appendChild(btn);
document.querySelector('.sidebar').children[0].appendChild(div);