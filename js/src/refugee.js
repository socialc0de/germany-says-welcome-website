import router from './refugee/router'
import langPicker from './refugee/language-picker'
import loginInit from './refugee/login-button'

import homeController from './refugee/home'
import faqController from './refugee/faq'
import mapController from './refugee/map'


//Reservierte globale Variablen
var sharingMap;
var sharingLayer;

window.auth = function auth() {
  //signin(false, userAuthed);
  // TMP Fix, init() doesn't get called by client.js
  loginInit()
}

/**
 * Wechsel den Tab zur Tauschbörse
 */
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

/**
 * Callback, wenn die GEO-Position erlaubt und gefunden wurde.
 * Dann soll diese Position auf der Karte angezeigt werden, sodass man die
 * Angebote inder Nähe findet.
 */
function onSharingLocationFound(e) {
  var radius = e.accuracy / 2;
  L.circle(e.latlng, radius).addTo(sharingMap);
}

/**
 * Lädt die Tauschbörse-Karte
 */
function loadSharingMap() {
  //cologne as default location
  sharingMap = L.map('sharingmap', {
    center: [50.9485795, 6.9448561],
    //default zoom state
    zoom: 13
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

/**
 * Lädt die Tauschbörse nur wenn man es benötigt
 */
function loadSharingMapIfNeeded() {
  if (sharingMap === undefined) {
    loadSharingMap();
  }
}

/**
 * Lädt neue Angebote für die Tauschbörse
 *
 * @param {type} bounds
 */
function requestUpdatedOffers(bounds) {
  if (NProgress.status == null) {
    NProgress.start();
  }

  var bbox = bounds._southWest.lng + ',' + bounds._southWest.lat + ',' + bounds._northEast.lng + ',' + bounds._northEast.lat;
  gapi.client.donate.offer.list_near({"bbox": bbox}).execute(function (resp) {
    console.log(resp);
    //clear old items
    $('#sharing-index-items').empty();
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

        //add items to index
        var thumbnailUrl = item.image_urls[0];

        var indexItem = '<div class="container">';
        indexItem += '<a href="javascript:showDetails(' + item.id + ')">';
        indexItem += '<img src="' + thumbnailUrl + '">';
        indexItem += '<h4>' + item.title + '</h4>';
        indexItem += '<h5>' + item.subtitle + '</h5>';
        indexItem += '</a>';
        indexItem += '</div>';
        $('#sharing-index-items').append(indexItem);
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

//Sprachenauswahl
$(document).ready(function () {
  var option = {
    fallbackLng: 'en',
    ns: {
      namespaces: ['refugee']
    },
    detectLngQS: 'lang'
  };

  $.i18n.init(option)
      .done(function () {
        $('[data-i18n]').i18n();
      })
      .fail(function () {
        $('[data-i18n]').i18n();
      });

  langPicker()

  //Dialog-Handling für neue Fragen
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

  router($('#bs-example-navbar-collapse-1'), {
    showHome: homeController.show,
    showMap: mapController.show,
    showFAQ: faqController.show,
    showDetails: showDetails
  })
});

/**
 * Zeige Tauschbörseninformationen
 *
 * @param {type} id
 */
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
