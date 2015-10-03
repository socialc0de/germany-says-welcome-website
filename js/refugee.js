var map;
var sharingMap;
var sharingLayer;
function signin(mode, authorizeCallback) {
  gapi.auth.authorize({
      client_id: "760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com",
      scope: ["https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/userinfo.email"],
      immediate: mode
    },
    authorizeCallback);
}

function userAuthed() {
  var request = gapi.client.oauth2.userinfo.get().execute(function (resp) {
    if (!resp.code) {
      gapi.client.donate.user.create().execute(function (resp) {
        if (!resp.code) {
          signedIn();
        } else {
          deauth();
        }
      });
    } else {
      deauth();
    }
  });
}

function init() {
  var apisToLoad;
  var loadCallback = function () {
    if (--apisToLoad === 0) {
      signin(true, userAuthed);
    }
  };

  $("#signInButton").text("Signing in ...");
  apisToLoad = 2;
  apiRoot = 'https://donate-backend.appspot.com/_ah/api';
  gapi.client.load('donate', 'v1', loadCallback, apiRoot);
  gapi.client.load('oauth2', 'v2', loadCallback);
}

function auth() {
  signin(false, userAuthed);
}

function deauth() {
  gapi.auth.setToken(null);
  $("#signInButton").show();
  $("#signInButton").text("Sign in");
  $("#signOutButton").hide();
}

function signedIn() {
  $("#signInButton").hide();
  $("#signOutButton").show();
}

function showFAQ() {
  $("#home").hide();
  $("#sharing").hide();
  $("#sharing_details").hide();
  $("#faq").show();
  $("#map_container").hide();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#faq_link').parent().addClass('active');
  gapi.client.donate.faqcat.list().execute(function (cats) {
    gapi.client.donate.faqitem.list({"answered": true}).execute(function (items) {
      var items_by_cat = {};
      var html = "";
      var popup_html = '<div id="dropdown" class="dropdown"><button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuTitle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Choose Category</button><ul class="dropdown-menu" aria-labelledby="dropdownMenu1">';
      var askbutton = '<h3>Didn\'t find what you need? <a class="btn btn-primary" data-toggle="modal" data-target="#newQuestionModal">Ask a question!</a></h3>';

      if (items.items === undefined) {
        html += askbutton;
        $("#faq").html(html);
      } else {
        items.items.forEach(function parseItems(item) {
          console.log(item);
          if (item.category in items_by_cat) {
            items_by_cat[item.category].push(item);
          } else {
            items_by_cat[item.category] = [item];
          }
        });

        html += "<div class=\"panel panel-default index table_of_content\">";
        html += "<div class=\"panel-body\"><h4>Inhalt</h4>";

        cats.items.forEach(function generateHTML(cat) {
          items = items_by_cat[cat.id];
          if (items != undefined) {
            html += '<a href="#faq_' + cat.name + '">' + cat.name + "</a><br />";
          }

          popup_html += '<li class="cat" id="' + cat.id + '">' + cat.name + '</li>';
        });

        html += "</div>";
        html += "</div>";

        cats.items.forEach(function generateHTML(cat, catindex) {
          items = items_by_cat[cat.id];
          if (items !== undefined) {
            html += '<h2 class="anchor" id="faq_' + cat.name + '">' + cat.name + "</h2>";
            html += '<div class="panel-group" id="faq_' + catindex + '" role="tablist" aria-multiselectable="true">';
            items.forEach(function addQuestionToHTML(item, index) {
              html += '<div class="panel panel-default"><div class="panel-heading" role="tab" id="cat' + catindex + 'heading' + index + '"><h4 class="panel-title"><a role="button" data-toggle="collapse" data-parent="cat' + catindex + '" href="#cat' + catindex + 'collapse' + index + '" aria-expanded="false" aria-controls="cat' + catindex + 'collapse' + index + '">';
              html += item.question;
              html += '</a></h4></div><div id="cat' + catindex + 'collapse' + index + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="cat' + catindex + 'heading' + index + '"><div class="panel-body">';
              html += item.answer;
              html += '</div></div></div>';
            });

            html += '</div>';
          }
        });

        html += askbutton;
        $("#faq").html(html);
        $("#newQuestionModalText").append(popup_html);
      }
    });
  });
}

function showSharing() {
  $("#home").hide();
  $("#sharing").show();
  $("#faq").hide();
  $("#map_container").hide();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#sharing_link').parent().addClass('active');
  loadSharingMapIfNeeded();
}

function showHome() {
  $("#home").show();
  $("#sharing").hide();
  $("#sharing_details").hide();
  $("#faq").hide();
  $("#map_container").hide();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#home_link').parent().addClass('active');
}

function showMap() {
  $("#home").hide();
  $("#sharing").hide();
  $("#sharing_details").hide();
  $("#faq").hide();
  $("#map_container").show();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#map_link').parent().addClass('active');
  loadMapIfNeeded();
}

function onMapLocationFound(e) {
  var radius = e.accuracy / 2;
  L.circle(e.latlng, radius).addTo(map);
}
function onSharingLocationFound(e) {
  var radius = e.accuracy / 2;
  L.circle(e.latlng, radius).addTo(sharingMap);
}
function loadMapData() {
  //load authorities
  var authortiesUrl = 'https://raw.githubusercontent.com/germany-says-welcome/refugees-welcome-app/master/app/src/main/assets/authorities.json';
  $.getJSON(authortiesUrl, function (data) {
    data.forEach(function (entry) {
      var popup = '<a href="geo:' + entry.location.lat + ', ' + entry.location.lng + '">' + entry.adresse + ' </a> <br />';
      popup += entry.telefon ? '<i class="glyphicon glyphicon-phone-alt"></i><a href="tel:+49' + entry.telefon + '">' + entry.telefon + '</a>' + '   ' : '';
      popup += entry.fax ? '<i class="glyphicon glyphicon-print"></i><a href="fax:+49' + entry.fax + '">' + entry.fax + '</a><br />' : '';
      popup += entry.offnungszeiten ? '<i class="glyphicon glyphicon glyphicon-time"></i> ' + entry.offnungszeiten + '<br />' : '';
      popup += entry.website ? '<i class="glyphicon glyphicon-info-sign"></i> <a href="http://' + entry.website + '">' + entry.website + '</a><br />' : '';
      popup += 'Data from <a href="http://www.amt-de.com">www.amt-de.com';

      //bind the authority to it's category
      L.marker([entry.location.lat, entry.location.lng]).addTo(authorities).bindPopup(popup);
    });
  });

  //load wifi hotspots
  $.ajax({
    type: "GET",
    url: "https://raw.githubusercontent.com/socialc0de/germany-says-welcome-website/master/wifispots.gpx",
    dataType: "xml",
    success: function (xml) {
      $(xml).find("wpt").each(function () {
        var longitude = $(this).attr("lon");
        var latitude = $(this).attr("lat");
        var name = $(this).find("name").first().text();
        var marker = L.marker([latitude, longitude]).addTo(wifi).bindPopup(name);
      });
    }
  });
}

function loadMap() {
  //create layer groups in order to be accessible from loadMapData
  authorities = L.markerClusterGroup();
  wifi = L.markerClusterGroup();

  //cologne as default location
  map = L.map('map', {
    center: [50.9485795, 6.9448561],
    //default zoom state
    zoom: 13,
    //just use authorities as default layer
    layers: [authorities],
    maxZoom: 18
  });

  //selectable layers
  var overlayMaps = {
    "Authorities": authorities,
    "Wifi": wifi
  };

  L.control.layers(overlayMaps).addTo(map);

  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18
    }).addTo(map);

  map.locate({setView: true, maxZoom: 16});
  //switch to current gps position if found
  map.on('locationfound', onMapLocationFound);
  loadMapData();
}

function loadMapIfNeeded() {
  if (map === undefined) {
    loadMap();
  }
}

function loadSharingMap() {
  //cologne as default location
  sharingMap = L.map('sharingmap', {
    center: [50.9485795, 6.9448561],
    //default zoom state
    zoom: 13,
  });

  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18
    }).addTo(sharingMap);

  sharingMap.locate({setView: true, maxZoom: 16});
  //switch to current gps position if found
  sharingMap.on('locationfound', onSharingLocationFound);
  sharingMap.on('load', function(e) {
    requestUpdatedOffers(e.target.getBounds());
  });
  loadSharingMapData();
}

function loadSharingMapIfNeeded() {
  if (sharingMap === undefined) {
    loadSharingMap();
  }
}
function requestUpdatedOffers(bounds) {
  if (NProgress.status == null) {
    NProgress.start();
  }
  var bbox = bounds._southWest.lng + ',' + bounds._southWest.lat + ',' + bounds._northEast.lng + ',' + bounds._northEast.lat;
  gapi.client.donate.offer.list_near({"bbox":bbox}).execute(function (resp) {
    console.log(resp);
    NProgress.done();
    if (!resp.code) {
      resp.items.forEach(function parseItems(item) {
        if (sharingLayer != undefined) {
          sharingMap.removeLayer(sharingLayer);
        }
        sharingLayer = new L.FeatureGroup();
        console.log(item);
        var popup = "<h4>" + item.title + "</h4>";
        popup += "<h5>" + item.subtitle + "</h5>";
        if (item.image_urls.length >= 1) {
          item.image_urls.forEach(function addImage(imageUrl) {
            popup += '<img height=200 src="' + imageUrl + '">';
          });
        }
        popup += '<p><a href="javascript:showDetails(' + item.id + ')">Show more</a>';
        L.marker([item.lat, item.lon]).addTo(sharingLayer).bindPopup(popup);
      });
      sharingMap.addLayer(sharingLayer);
    } else {
      $('#errorModalText').text("Error: " + resp.message);
      $('#errorModalLabel').text("Error Code " + resp.code);
      $('#errorModal').modal();
    }
  });
}
function loadSharingMapData() {
  sharingMap.on('moveend', function(e) {
    requestUpdatedOffers(e.target.getBounds());
  });
}
$(document).ready(function () {
  $("#newQuestionModal").on('click', '#save', function (e) {
    console.log(e);
    var form = $(e.target).parent().parent();
    NProgress.start();
    var question = form.find("#question_text")[0].value;
    var answer = form.find("#answer_text")[0].value;
    var language = form.find("#language_code")[0].value;
    var category = form.find("#category")[0].value;
    $("#newQuestionModal").modal('hide');

    var createItems = {"question": question, "answer": answer, "language": language, "category": category};
    gapi.client.donate.faqitem.create(createItems).execute(function (resp) {
      NProgress.done();
      if (resp.code) {
        console.log(resp);
        $('#errorModalText').text("Error: " + resp.message);
        $('#errorModalLabel').text("Error Code " + resp.code);
        $('#errorModal').modal();
      }
    });
  });

  $("#newQuestionModal").on('click', '.cat', function (e) {
    var p = $(e.target).parent().parent().parent();
    console.log(p);
    console.log(p);
    p.find("#category").prop('value', e.target.id);
    p.find("#dropdownMenuTitle").text(e.target.textContent);
  });
});
function showDetails(id) {
  console.log(id);
  gapi.client.donate.offer.get({"id":id}).execute(function (resp) {
    console.log(resp);
    NProgress.done();
    if (!resp.code) {
      $("#sharing").hide();
      $("#sharing_details").html("");
      $("#sharing_details").show();
      var html = '<div id="left_col"><h1>' + resp.title + '</h1>';
      html += '<h4>' + resp.subtitle + '</h4>';
      html += '<section style="padding:0"><p>' + resp.description + '</p>';
      im_data = JSON.parse(resp.owner.im);
      for (contactData in im_data) {
        html += '<a class="btn btn-default" href="'+ im_data[contactData]['url'] +'">'+im_data[contactData]['display']+'</a>';
        console.log(im_data[contactData]);
      };
      html += '</section></div><div id="right_col">';
      if (resp.image_urls.length >= 1) {
        resp.image_urls.forEach(function addImage(imageUrl) {
          html += '<figure><img src="' + imageUrl + '"></figure>';
        });
      }
      html += '</div>';
      $("#sharing_details").html(html);
      
    } else {
      $('#errorModalText').text("Error: " + resp.message);
      $('#errorModalLabel').text("Error Code " + resp.code);
      $('#errorModal').modal();
    }
  });

}
$("#map_container").hide();
$("#sharing").hide();
$("#sharing_details").hide();
