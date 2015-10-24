/* global $, L */

var map

// create layer groups in order to be accessible from loadMapData
var authorities = L.markerClusterGroup()
var wifi = L.markerClusterGroup()

/**
 * Callback, wenn die GEO-Position erlaubt und gefunden wurde.
 * Dann soll diese Position auf der Karte angezeigt werden.
 */
function onMapLocationFound (e) {
  var radius = e.accuracy / 2
  L.circle(e.latlng, radius).addTo(map)
}

/**
 * Lädt den Karteninhalt
 */
function loadMapData () {
  // load authorities
  var authortiesUrl = 'https://raw.githubusercontent.com/germany-says-welcome/refugees-welcome-app/master/app/src/main/assets/authorities.json'
  $.getJSON(authortiesUrl, function (data) {
    data.forEach(function (entry) {
      var popup = '<a href="geo:' + entry.location.lat + ', ' + entry.location.lng + '">' + entry.adresse + ' </a> <br />'
      popup += entry.telefon ? '<i class="glyphicon glyphicon-phone-alt"></i><a href="tel:+49' + entry.telefon + '">' + entry.telefon + '</a>' + '   ' : ''
      popup += entry.fax ? '<i class="glyphicon glyphicon-print"></i><a href="fax:+49' + entry.fax + '">' + entry.fax + '</a><br />' : ''
      popup += entry.offnungszeiten ? '<i class="glyphicon glyphicon glyphicon-time"></i> ' + entry.offnungszeiten + '<br />' : ''
      popup += entry.website ? '<i class="glyphicon glyphicon-info-sign"></i> <a href="http://' + entry.website + '">' + entry.website + '</a><br />' : ''
      popup += 'Data from <a href="http://www.amt-de.com">www.amt-de.com'

      // füge den Punkt zur Karte hinzu
      L.marker([entry.location.lat, entry.location.lng]).addTo(authorities).bindPopup(popup)
    })
  })

  // load wifi hotspots
  $.ajax({
    type: 'GET',
    url: 'https://raw.githubusercontent.com/socialc0de/germany-says-welcome-website/master/wifispots.gpx',
    dataType: 'xml',
    success: function (xml) {
      $(xml).find('wpt').each(function () {
        var longitude = $(this).attr('lon')
        var latitude = $(this).attr('lat')
        var name = $(this).find('name').first().text()

        // füge den Punkt zur Karte hinzu
        L.marker([latitude, longitude]).addTo(wifi).bindPopup(name)
      })
    }
  })
}

/**
 * Lädt die Karte
 */
function loadMap () {
  // cologne as default location
  map = L.map('map', {
    center: [50.9485795, 6.9448561],
    // default zoom state
    zoom: 13,
    // just use authorities as default layer
    layers: [authorities],
    maxZoom: 18
  })

  // selectable layers
  var overlayMaps = {
    'Authorities': authorities,
    'Wifi': wifi
  }

  L.control.layers(overlayMaps).addTo(map)

  var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18
    }).addTo(map)

  map.locate({setView: true, maxZoom: 16})
  // switch to current gps position if found
  map.on('locationfound', onMapLocationFound)
  loadMapData()
}

/**
 * Lädt die Karte nur wenn man es benötigt
 */
function loadMapIfNeeded () {
  if (map === undefined) {
    // Lade die Karte nur, wenn dies noch nicht zuvor geschehen ist, um
    // unnötiges laden zu vermeiden
    loadMap()
  }
}

/**
 * Wechsel den Tab zur Karte
 */
export function showMap () {
  $('#home').hide()
  $('#sharing').hide()
  $('#sharing_details').hide()
  $('#faq').hide()
  $('#map_container').show()
  $('nav').removeClass('fixed')
  $('nav li.active').removeClass('active')
  $('nav a#map_link').parent().addClass('active')
  loadMapIfNeeded()
}

export default {
  show: showMap
}
