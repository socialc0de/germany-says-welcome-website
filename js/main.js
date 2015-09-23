var map;
function init() {
    var apisToLoad;
    var loadCallback = function() {
        if (--apisToLoad == 0) {
            signin(true, userAuthed);
        }
    };
    $("#signInButton").text("Signing in ...");
    apisToLoad = 2;
    apiRoot = 'https://donate-backend.appspot.com/_ah/api';
    //apiRoot = 'http://192.168.42.46:8080/_ah/api';
    gapi.client.load('donate', 'v1', loadCallback, apiRoot);
    gapi.client.load('oauth2', 'v2', loadCallback);
}

function signin(mode, authorizeCallback) {
    gapi.auth.authorize({client_id:"760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com",
        scope: "profile", immediate: mode},
        authorizeCallback);
}

function userAuthed() {
    var request =
    gapi.client.oauth2.userinfo.get().execute(function(resp) {
        if (!resp.code) {
            gapi.client.oauth2.user.create().execute(function(resp) {
                if (!resp.code) {
                    signedIn();
                }
            });
        }
    });
}

function auth() {
    signin(false, userAuthed);
};

function deauth() {
    gapi.auth.setToken(null)
    $("#signInButton").show();
    $("#signInButton").text("Sign in");
    $("#signOutButton").hide();
};

function signedIn() {
    $("#signInButton").hide();
    $("#signOutButton").show();
	jumpToPage();
}

$(document).ready(function() {
    $(window).bind( 'hashchange', function(e) {
		jumpToPage()
    });
    $("#newQuestionModal").on('click','#save',function(e) {
        console.log(e);
        //$("#unanswered").html("");
        //
        var form = $(e.target).parent().parent();
        NProgress.start();
        var question = form.find("#question_text")[0].value;
        var answer = form.find("#answer_text")[0].value;
        var language = form.find("#language_code")[0].value;
        var category = form.find("#category")[0].value;
        $("#newQuestionModal").modal('hide');
        gapi.client.donate.faqitem.create({"question":question, "answer":answer, "language":language, "category":category}).execute(function(resp) {

            NProgress.done();
            if (resp.code) {
                console.log(resp);
                $('#errorModalText').append(resp.message);
                $('#errorModalLabel').append(resp.code);
                $('#errorModal').modal();
            }
        });
    });
    $("#newQuestionModal").on('click','.cat',function(e) {
        var p = $(e.target).parent().parent().parent();
        console.log(p);
        console.log(p);
        p.find("#category").prop('value', e.target.id);
        p.find("#dropdownMenuTitle").text(e.target.textContent);
    });
});

function jumpToPage() {

	var location = window.location.hash;
	if (location.match("^#home")) {
		$('nav').removeClass('fixed');
		$('nav li.active').removeClass('active');
		$('nav a#home_link').parent().addClass('active');
		showHome();
	}

	if (location.match("^#faq")) {
		$('nav').removeClass('fixed');
		$('nav li.active').removeClass('active');
		$('nav a#faq_link').parent().addClass('active');
		loadFAQ();
	}

	if (location.match("^#sharing")) {
		$('nav').removeClass('fixed');
		$('nav li.active').removeClass('active');
		$('nav a#sharing_link').parent().addClass('active');
		loadSharing();
	}

	if (location.match("^#map")) {
		$('nav').removeClass('fixed');
		$('nav li.active').removeClass('active');
		$('nav a#map_link').parent().addClass('active');
		showMap();
	}


}

function loadFAQ() {
    $("#home").hide();
    $("#sharing").hide();
    $("#faq").show();
    $("#map_container").hide();
    gapi.client.donate.faqcat.list().execute(function(cats) {
        gapi.client.donate.faqitem.list({"answered":true}).execute(function(items) {
            var items_by_cat = {};
            var html = "";
            var popup_html = '<div id="dropdown" class="dropdown"><button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuTitle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Choose Category</button><ul class="dropdown-menu" aria-labelledby="dropdownMenu1">';
            var askbutton = '<h3>Didn\'t find what you need? <a class="btn btn-primary" data-toggle="modal" data-target="#newQuestionModal">Ask a question!</a></h3>';

            if(items.items == undefined){
                html += askbutton;
                $("#faq").html(html);
            }else{

            items.items.forEach(function parseItems(item, index, all) {
                console.log(item);
                if (item.category in items_by_cat) {
                    items_by_cat[item.category].push(item);
                } else {
                    items_by_cat[item.category] = [item];
                }
            })

			html += "<div class=\"panel panel-default index table_of_content\">";
			html += "<div class=\"panel-body\"><h4>Inhalt</h4>";

			cats.items.forEach(function generateHTML(cat, catindex, all) {
                items = items_by_cat[cat.id];
                if (items != undefined) {
                    html += '<a href="#faq_'+cat.name+'">'+cat.name+"</a><br />";
                }
                popup_html += '<li class="cat" id="'+cat.id+'">'+cat.name+'</li>';

            })

			html += "</div>";
			html += "</div>";

            cats.items.forEach(function generateHTML(cat, catindex, all) {
                items = items_by_cat[cat.id];
                if (items != undefined) {
					html += '<h2 class="anchor" id="faq_'+cat.name+'">'+cat.name+"</h2>";
                    html += "<div class=\"panel-group\" id=\"faq_"+catindex+"\" role=\"tablist\" aria-multiselectable=\"true\">";
                    items.forEach(function addQuestionToHTML(item, index, all) {
                        html += '<div class="panel panel-default"><div class="panel-heading" role="tab" id="cat'+catindex+'heading'+index+'"><h4 class="panel-title"><a role="button" data-toggle="collapse" data-parent="cat'+catindex+'" href="#cat'+catindex+'collapse'+index+'" aria-expanded="false" aria-controls="cat'+catindex+'collapse'+index+'">';
                        html += item.question;
                        html += '</a></h4></div><div id="cat'+catindex+'collapse'+index+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="cat'+catindex+'heading'+index+'"><div class="panel-body">';
                        html += item.answer;
                        html += '</div></div></div>';
                    })
                    html += '</div>';
                }

            })
            html += askbutton;
            $("#faq").html(html);
            $("#newQuestionModalText").append(popup_html);
            }
        });
    });

}


function loadSharing() {
    $("#home").hide();
    $("#sharing").show();
    $("#faq").hide();
    $("#map_container").hide();
}
function showHome() {
    $("#home").show();
    $("#sharing").hide();
    $("#faq").hide();
    $("#map_container").hide();
}
function showMap() {
    $("#home").hide();
    $("#sharing").hide();
    $("#faq").hide();
    $("#map_container").show();
    loadMapIfNeeded();
}
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.circle(e.latlng, radius).addTo(map);
}
function loadMapData() {
    //load authorities
  $.getJSON('https://raw.githubusercontent.com/germany-says-welcome/refugees-welcome-app/master/app/src/main/assets/authorities.json', function(data) {
    data.forEach(function (entry) {
      var popup = entry.telefon ? entry.adresse + '<br />' : '';
      popup += entry.telefon ? '<i class="glyphicon glyphicon-phone-alt"></i> ' + entry.telefon + '   ' : '';
      popup += entry.fax ? '<i class="glyphicon glyphicon-print"></i> ' + entry.fax + '<br />' : '';
      popup += entry.offnungszeiten ? '<i class="glyphicon glyphicon glyphicon-time"></i> ' + entry.offnungszeiten + '<br />' : '';
      popup += entry.website ? '<i class="glyphicon glyphicon-info-sign"></i> <a href="http://' + entry.website + '">' + entry.website + '</a><br />' : '';
      popup += 'Data from <a href="http://www.amt-de.com">www.amt-de.com';

      //bind the authority to it's category
      L.marker([entry.location.lat, entry.location.lng]).addTo(authorities)
        .bindPopup(popup);
    });
  });

//load wifi hotspots
  $.getJSON('https://raw.githubusercontent.com/germany-says-welcome/refugees-welcome-app/master/app/src/main/assets/wifihotspot.json', function(data) {
    data.features.forEach(function (entry) {
      var popup = entry.properties.desc;
      var location = entry.geometry.coordinates;

      L.marker([location[0], location[1]]).addTo(wifi)
        .bindPopup(popup);
    });
  });
}
function loadMap() {
    //create layer groups in order to be accessible from loadMapData
    authorities = L.layerGroup();
    wifi = L.layerGroup();

    //cologne as default location
    map = L.map('map', {
	center: [50.9485795, 6.9448561],
	//default zoom state
	zoom: 13,
	//just use authorities as default layer
	layers: [authorities]
    });

    //selectable layers
    var overlayMaps = {
	"Authorities": authorities,
	"Wifi": wifi
    };
    L.control.layers(overlayMaps).addTo(map);

    mapLink =
        '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
        }).addTo(map);
    map.locate({setView: true, maxZoom: 16});
    //switch to current gps position if found
    map.on('locationfound', onLocationFound);
    loadMapData();
}
function loadMapIfNeeded() {
    if (map == undefined) {
        loadMap();
    }
}
$("#map_container").hide();

jumpToPage();
