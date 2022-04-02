var aniTags = ["pokemon","digimon","yu-gi-oh!","gundam","one_piece","naruto","precure","fate_series","dragon_ball_series","sword_art_online_series","the_idolm@ster_series","fullmetal_alchemist","senki_zesshou_symphogear_series","mob_psycho_100_series","black_clover","tengen_toppa_gurren_lagann_series","to_aru_series","neon_genesis_evangelion_series","my_hero_academia","jojo's_bizarre_adventure_series","monogatari_series","fire_force_series","shingeki_no_kyojin_series","bleach","mahou_shoujo_madoka_magica_series","dragon_quest","shinsekai_yori","detective_conan","ghost_in_the_shell_series","haikyuu!!_series","space_dandy","gegege_no_kitaro","little_witch_academia","macross_saga","darling_in_the_franxx","hunter_x_hunter","hibike!_euphonium_series","one-punch_man_series","yozakura_quartet","tales_of_series","kill_la_kill","yu_yu_hakusho","cowboy_bebop","ranma_1/2","dungeon_ni_deai_o_motomeru_no_wa_machigatte_iru_darouka_series","psycho_pass_series","inuyasha","fairy_tail","soul_eater","persona_series","k-on!","nanatsu_no_taizai_series","star_driver","toradora","flip_flappers","magi_series","aikatsu!_series","tetsuwan_birdy_decode","code_geass","eizouken_ni_wa_te_wo_dasu_na!","the_god_of_high_school","shigatsu_wa_kimi_no_uso","record_of_grancrest_war","brand_new_animal","sword_of_the_stranger","kyoukai_no_kanata","toriko","samurai_champloo","shingeki_no_bahamut","kimetsu_no_yaiba","tokyo_ghoul_series","konosuba_series","devilman_crybaby","weathering_with_you","kimi_no_na_wa","hyouka","castlevania","deca-dence","children_of_the_sea","to_be_heroine","eromanga_sensei","kekkai_sensen_series","sengoku_basara","azur_lane_series","new_game","gridman","dororo","3-gatsu_no_lion","jujutsu_kaisen","kaguya-sama:_love_is_war_series","the_promised_neverland","yama_no_susume_series","noragami","bungou_stray_dogs","owari_no_seraph","boogiepop_wa_warawanai","akame_ga_kill!","xam'd_lost_memories","occultic;nine","welcome_to_the_ballroom","flcl","re:_zero_kara_hajimeru_isekai_seikatsu","death_parade","vinland_saga","acca:_13_ku_kansatsu_ka","wonder_egg_priority"];

var playing = false;
var video = document.getElementById('vid');
var temp  = document.getElementById('temp');
var post, seriesName, artistsToRand = [];

document.getElementById('tags').value = aniTags.toString();
document.getElementById('tags').onchange = function() {
    aniTags = this.value.split(",");
    console.log("Tag changes");
}
document.getElementById('reset').onclick = function() {
    document.getElementById('wrong').innerText = document.getElementById('correct').innerText = "0";
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i --) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function requestPosts() {
    var xhttp = new XMLHttpRequest();
    xhttp.overrideMimeType('text/xml');
    seriesName = aniTags[Math.floor(Math.random()*aniTags.length)];
    var search = `${seriesName.replace(/;/g, "%3B")} -production_materials score:>=50 order:random limit:50`;
    xhttp.open("GET", "https://www.sakugabooru.com/post.xml?tags="+search, false);
    xhttp.send(null);
    return xhttp.responseXML.querySelectorAll('post');
}
function prepareTest() {
    var posts = requestPosts();
    var questionPosts = [];
    var questionArtists = [];
    for (var i = 0; i < posts.length; i ++) {
        if ((posts[i].getAttribute('file_ext') == "mp4" || posts[i].getAttribute('file_ext') == "webm")) {
            questionPosts.push(posts[i]);
            questionArtists.push(posts[i].getAttribute('author'));
        }
    }
    shuffleArray(questionArtists);
    artistsToRand = [];
    var t = 0;
    for (var i = 0; i < questionArtists.length; i ++) {
        if (artistsToRand.indexOf(questionArtists[i]) == -1) {
            artistsToRand.push(questionArtists[i]);
            t ++;
            if (t == 4) break;
        }
    }
    post = questionPosts[Math.floor(Math.random()*questionPosts.length)];
    if (artistsToRand.indexOf(post.getAttribute('author')) == -1) {
        artistsToRand[3] = post.getAttribute('author');
    }
    shuffleArray(artistsToRand);

    temp.src = post.getAttribute('file_url');
}
function launchTest() {
    video.src = temp.src;
    var answers = document.querySelectorAll('.answer');
    for (var i = 0; i < answers.length; i ++) {
        answers[i].classList.remove('answer-true');
        answers[i].classList.remove('answer-false');
        answers[i].innerText = (artistsToRand[i]??"").replace(/_/g, " ");
        answers[i].id = artistsToRand[i]??"";
        answers[i].onclick = clickAnswer;
    }
    playing = true;
}
function clickAnswer(event) {
    if (playing == false) return;
    playing = false;

    console.log("Post link : https://www.sakugabooru.com/post/show/"+post.id);

    if (event.target.id == post.getAttribute('author')) {
        event.target.classList.add('answer-true');
        document.getElementById('correct').innerText = parseInt(document.getElementById('correct').innerText)+1;
    } else {
        event.target.classList.add('answer-false');
        document.getElementById(post.getAttribute('author')).classList.add('answer-true');
        document.getElementById('wrong').innerText = parseInt(document.getElementById('wrong').innerText)+1;
    }

    var linkDiv = document.createElement('div');

    var link = document.createElement('a');
    link.href = "https://www.sakugabooru.com/post/show/"+post.id;
    link.target = "_blank";
    link.innerText = "Post #"+post.id;

    var author = document.createElement('a');
    author.href = "https://www.sakugabooru.com/post?tags="+post.getAttribute('author')+"%20order:score";
    author.target = "_blank";
    author.innerText = post.getAttribute('author');

    var series = document.createElement('a');
    series.href = "https://www.sakugabooru.com/post?tags="+seriesName+"%20order:score";
    series.target = "_blank";
    series.innerText = seriesName;

    linkDiv.appendChild(link);
    linkDiv.innerHTML += " uploaded by ";
    linkDiv.appendChild(author);

    linkDiv.innerHTML += " (drawn with ";
    linkDiv.appendChild(series);
    linkDiv.innerHTML += ")";

    document.getElementById('last_posts').prepend(linkDiv);

    setTimeout(function() {
        prepareTest();
        setTimeout(function() {
            launchTest();
        }, 1400);
    }, 100);
}

prepareTest();
launchTest();