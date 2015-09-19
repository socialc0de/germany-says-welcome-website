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
            signedIn();
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
        gapi.client.donate.faqitem.list().execute(function(items) {
            var items_by_cat = {};
            var html = "";
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
            html += '<button onclick="newquestion()" id="senden">Das ist ein Button</button>';
            $("#faq").html(html);
        });  
    });  

}

function newquestion() {
    gapi.client.donate.faqitem.create({"category":category,"question":question,"answer":answer}).execute(function(resp){ 
        category = "test";
        question = "test2";
        answer = "test3";
        console.log(resp);
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
function insertJSON() {
  $.getJSON('https://raw.githubusercontent.com/germany-says-welcome/refugees-welcome-app/master/app/src/main/assets/authorities.json', function(data) {
    data.forEach(function (entry) {
      var popup = entry.telefon ? entry.adresse + '<br />' : '';
      popup += entry.telefon ? '<i class="glyphicon glyphicon-phone-alt"></i> ' + entry.telefon + '   ' : '';
      popup += entry.fax ? '<i class="glyphicon glyphicon-print"></i> ' + entry.fax + '<br />' : '';
      popup += entry.offnungszeiten ? '<i class="glyphicon glyphicon glyphicon-time"></i> ' + entry.offnungszeiten + '<br />' : '';
      popup += entry.website ? '<i class="glyphicon glyphicon-info-sign"></i> <a href="http://' + entry.website + '">' + entry.website + '</a><br />' : '';
      popup += 'Data from <a href="http://www.amt-de.com">www.amt-de.com';

      L.marker([entry.location.lat, entry.location.lng]).addTo(map)
        .bindPopup(popup);
    });
  });
}
function loadMap() {
    map = L.map('map').setView([50.9485795, 6.9448561], 13);
    mapLink = 
        '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
        }).addTo(map);
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', onLocationFound);
    insertJSON();
}
function loadMapIfNeeded() {
    if (map == undefined) {
        loadMap();
    }
}
$("#map_container").hide();

jumpToPage();