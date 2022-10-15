var div = document.createElement('div');
div.style.display = "none";

function select(name, id, options) {
    var dselect = document.createElement('div');
    var sort = document.createElement('select');
    sort.classList.add('searchBoxes');

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
        search = document.getElementById('tags').value;
        search = search.replace(reg, "").trim();
        if (this.value != "date" && this.value != "all") {
            search += " "+id+":"+this.value+" ";
        }
        document.getElementById('tags').value = search;
    }
    dselect.appendChild(sort);
    return dselect;
}

function input(name, id, type) {
    var dinput = document.createElement('div');
    var input = document.createElement('input');
    input.classList.add('searchBoxes');

    let search = document.getElementById('tags').value;
    let reg = new RegExp(id+":([^ ]+) ?", "g");

    dinput.innerText = name;
    input.type = type;

    let detected = reg.exec(search);
    if (detected) {
        input.value = detected[1];
    }

    input.onchange = function() {
        search = document.getElementById('tags').value;
        search = search.replace(reg, "").trim();
        if (this.value != 0) {
            search += " "+id+":"+this.value+" ";
        }
        document.getElementById('tags').value = search;
    }
    dinput.appendChild(input);
    return dinput;
}

function checkBox(name, id, value) {
    var dcheck = document.createElement('div');
    var check = document.createElement('input');

    let search = document.getElementById('tags').value;
    let reg = new RegExp(id+":([^ ]+) ?", "g");

    dcheck.innerText = name;
    check.type = 'checkbox';
    check.textValue = value;

    let detected = reg.exec(search);

    if (detected && detected[1] == value) {
        check.checked = true;
    }

    check.onchange = function() {
        search = document.getElementById('tags').value;
        search = search.replace(reg, "").trim();
        if (this.checked) {
            search += " "+id+":"+this.textValue;
        }
        document.getElementById('tags').value = search;
    }
    dcheck.appendChild(check);
    return dcheck;
}

var dsort   = select("Sort by ", "order", ['date', 'source', 'id', 'id_desc', 'score', 'score_asc', 'mpixels', 'mpixels_asc', 'random']);
var drating = select("Rating ", "rating", ['all', 'safe', 'questionable', 'explicit']);

var dinput = input("Posts limit ", "limit", "number");

var dsoloKA = checkBox("Solo KA ", "source", "*solo*ka");

var launch = document.createElement('button');
launch.innerText = "Search again";
launch.onclick = function() {
    location.href = "/post?tags="+document.getElementById('tags').value;
}
// append all
div.appendChild(dsort);
div.appendChild(drating);
div.appendChild(dinput);
div.appendChild(dsoloKA);

div.appendChild(launch);

var btn = document.createElement('a');
btn.href = "#";
btn.classList.add('link');
btn.innerText = "Sakuga Extended Search";
btn.id = "extended_search";
btn.onclick = function() {
    div.style.display = div.style.display == "none" ? "block" : "none";
}

document.querySelector('.sidebar').children[0].appendChild(btn);
document.querySelector('.sidebar').children[0].appendChild(div);

// Average color
if (typeof id == "undefined") {
    var br = document.createElement('br');
    document.querySelector('.sidebar').appendChild(br);
    
    var avgbtn = document.createElement('button');
    avgbtn.innerText = "Average color";
    avgbtn.id = "color-btn";
    var color = document.createElement('div');
    color.style.display = "none";
    color.id = "color-panel";
    document.querySelector('.sidebar').appendChild(avgbtn);
    document.querySelector('.sidebar').appendChild(color);
    
    avgbtn.onclick = function() {
        color.innerText = "Calculating...";
        var fac = new FastAverageColor(), totalR = totalG = totalB = loaded = 0, previews = document.querySelectorAll('img.preview');
        for (var i = 0; i < previews.length; i ++) {
            previews[i].src = previews[i].src.replace("://s", "://www.s");
            fac.getColorAsync(previews[i]).then(c => {
                totalR += c.value[0];
                totalG += c.value[1];
                totalB += c.value[2];
                loaded ++;
                if (loaded == previews.length) {
                    color.style.display = "block";
                    color.innerText = color.style.backgroundColor = "rgb("+Math.round(totalR/previews.length)+", "+Math.round(totalG/previews.length)+", "+Math.round(totalB/previews.length)+")";
                }
            });
        }
    };
}