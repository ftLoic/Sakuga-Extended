// "use strict";

// (function() {
    var seriesToDraw = basicSeries = ["pokemon","digimon","yu-gi-oh!","gundam","one_piece","naruto","precure","fate_series","dragon_ball_series","gintama","sword_art_online_series","the_idolm@ster_series","fullmetal_alchemist","senki_zesshou_symphogear_series","mob_psycho_100_iii","black_clover","tengen_toppa_gurren_lagann_series","to_aru_series","neon_genesis_evangelion_series","my_hero_academia","jojo's_bizarre_adventure_series","monogatari_series","fire_force_series","shingeki_no_kyojin_series","bleach","mahou_shoujo_madoka_magica_series","dragon_quest","shinsekai_yori","detective_conan","ghost_in_the_shell_series","haikyuu!!_series","space_dandy","gegege_no_kitaro","little_witch_academia","macross_saga","darling_in_the_franxx","hunter_x_hunter","hibike!_euphonium_series","one-punch_man_series","yozakura_quartet","tales_of_series","kill_la_kill","yu_yu_hakusho","cowboy_bebop","ranma_1/2","dungeon_ni_deai_o_motomeru_no_wa_machigatte_iru_darouka_series","psycho_pass_series","inuyasha","fairy_tail","soul_eater","persona_series","k-on!","nanatsu_no_taizai_series","star_driver","toradora","flip_flappers","magi_series","aikatsu!_series","tetsuwan_birdy_decode","code_geass","violet_evergarden_series","eizouken_ni_wa_te_wo_dasu_na!","the_god_of_high_school","shigatsu_wa_kimi_no_uso","record_of_grancrest_war","brand_new_animal","sword_of_the_stranger","kyoukai_no_kanata","toriko","samurai_champloo","shingeki_no_bahamut","kimetsu_no_yaiba","tokyo_ghoul_series","konosuba_series","devilman_crybaby","weathering_with_you","kimi_no_na_wa","hyouka","castlevania","deca-dence","children_of_the_sea","to_be_heroine","eromanga_sensei","kekkai_sensen_series","sengoku_basara","azur_lane_series","new_game","gridman","dororo","3-gatsu_no_lion","jujutsu_kaisen","kaguya-sama:_love_is_war_series","the_promised_neverland","yama_no_susume_series","noragami","bungou_stray_dogs","owari_no_seraph","boogiepop_wa_warawanai","akame_ga_kill!","tiger_mask","xam'd_lost_memories","occultic;nine","welcome_to_the_ballroom","flcl","re:_zero_kara_hajimeru_isekai_seikatsu","death_parade","vinland_saga","acca:_13_ku_kansatsu_ka","wonder_egg_priority"];
    var series = [], artists = [];
    function getArtists(callback) {
        fetch("https://www.sakugabooru.com/tag/summary.json").then(function(response) {
            response.json().then(function(json) {
                var tags = json.data.split(" ");
                for (var i = 0; i < tags.length; i ++) {
                    var data = tags[i].split("`");
                    if (data[0] == "1") {
                        artists.push(data[1]);
                    } else if (data[0] == "3") {
                        series.push(data[1]);
                        if (data.length == 4) {
                            series.push(data[2]);
                        }
                    }
                }
                callback(artists);
            }).catch(function() {
                console.log("Error: Cannot get artists");
            });
        }).catch(function() {
            console.log("Error: Cannot get artists");
        });
    }

    var playing = false;
    var video = document.getElementById('vid');
    var temp  = document.getElementById('temp');
    var post, seriesName, artistsToRand = [];

    document.getElementById('tags').value = seriesToDraw.toString();
    document.getElementById('tags').onkeyup = function() {
        var unknownTags = [];
        seriesToDraw = this.value.split(",");
        var finalSeriesToDraw = Array.from(seriesToDraw);
        for (var i = 0; i < seriesToDraw.length; i ++) {
            if (seriesToDraw[i].trim() == "") {
                finalSeriesToDraw.splice(finalSeriesToDraw.indexOf(seriesToDraw[i]), 1);
            } else if (series.indexOf(seriesToDraw[i].trim().toLowerCase()) == -1) {
                unknownTags.push(seriesToDraw[i].trim());
                finalSeriesToDraw.splice(finalSeriesToDraw.indexOf(seriesToDraw[i]), 1);
            }
        }
        seriesToDraw = finalSeriesToDraw;

        document.getElementById('ntags').innerText = seriesToDraw.length;
        if (seriesToDraw.length == 0) {
            seriesToDraw = basicSeries;
            document.getElementById('warning').style.display = "block";
            document.getElementById('warning').innerText = "(ERROR) No series has been detected. Make sure that the names have underscores instead of spaces. The game will use the default series.";
        } else if (unknownTags.length > 0) {
            document.getElementById('warning').style.display = "block";
            document.getElementById('warning').innerText = "(ERROR) These series don't exist: "+(unknownTags.join(", "))+". The game might use unwanted series.";
        } else {
            document.getElementById('warning').style.display = "none";
            document.getElementById('warning').innerText = "";
        }
    }
    document.getElementById('tags').onpaste = function() {
        setTimeout(function() {
            document.getElementById('tags').onkeyup();
        }, 50);
    };
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
        seriesName = seriesToDraw[Math.floor(Math.random()*seriesToDraw.length)];
        var search = `${seriesName.replace(/;/g, "%3B")} -production_materials -presumed -artist_unknown order:random limit:50`;
        xhttp.open("GET", "https://www.sakugabooru.com/post.xml?tags="+search, false);
        xhttp.send(null);
        return xhttp.responseXML.querySelectorAll('post');
    }
    function prepareTest() {
        var posts = requestPosts();
        if (posts.length == 0) {
            alert("A tag was not recognized: "+seriesName+". Please restart the game.");
            return;
        }
        var questionPosts = [];
        var questionArtists = [];
        for (var i = 0; i < posts.length; i ++) {
            if ((posts[i].getAttribute('file_ext') == "mp4" || posts[i].getAttribute('file_ext') == "webm")) {
                var tags = posts[i].getAttribute('tags').split(" ");
        
                var post_artists = [];
                for (var j = 0; j < tags.length; j ++) {
                    if (artists.indexOf(tags[j]) > -1) { // isArtist
                        post_artists.push(tags[j]);
                        questionArtists.push(tags[j]);
                    }
                }
                if (post_artists.length == 1) {
                    posts[i].setAttribute("artist", post_artists[0]);
                    questionPosts.push(posts[i]);
                }
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
        if (artistsToRand.indexOf(post.getAttribute('artist')) == -1) {
            artistsToRand[3] = post.getAttribute('artist');
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

        if (event.target.id == post.getAttribute('artist')) {
            event.target.classList.add('answer-true');
            document.getElementById('correct').innerText = parseInt(document.getElementById('correct').innerText)+1;
        } else {
            event.target.classList.add('answer-false');
            document.getElementById(post.getAttribute('artist')).classList.add('answer-true');
            document.getElementById('wrong').innerText = parseInt(document.getElementById('wrong').innerText)+1;
        }

        var linkDiv = document.createElement('div');

        var link = document.createElement('a');
        link.href = "https://www.sakugabooru.com/post/show/"+post.id;
        link.target = "_blank";
        link.innerText = "Post #"+post.id;

        var author = document.createElement('a');
        author.href = "https://www.sakugabooru.com/post?tags="+post.getAttribute('artist')+"%20order:score";
        author.target = "_blank";
        author.innerText = post.getAttribute('artist');

        var series = document.createElement('a');
        series.href = "https://www.sakugabooru.com/post?tags="+seriesName+"%20order:score";
        series.target = "_blank";
        series.innerText = seriesName;

        linkDiv.appendChild(link);
        linkDiv.innerHTML += " by ";
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

    getArtists(function() {
        document.getElementById('tags').onkeyup();
        prepareTest();
        launchTest();
    });
// })();
