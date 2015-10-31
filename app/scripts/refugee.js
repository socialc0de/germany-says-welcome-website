MAIN_URL = "http://gsw.pajowu.de/api/"
$(document).ready(function () {

    showHome();
    var app = angular.module('gsw', ['nemLogging','leaflet-directive']);
    app.controller('FAQController', function($scope, $http) {
        $http({
            method: 'GET',
            url: MAIN_URL + "faq/"
        }).success(function(data, status) {
            $scope.data = data
          // data contains the response
          // status is the HTTP status
        }).error(function(data, status) {
        });
    });

    app.controller('POIController', ["$scope", "$http", "leafletData",  function($scope, $http, leafletData) {
        $scope.authorities = L.markerClusterGroup();
        $scope.wifi = L.markerClusterGroup();
        $scope.misc = L.markerClusterGroup();
        $scope.loadMap = function() {
            leafletData.getMap().then(function(map) {
                var overlayMaps = {
                    "Authorities": $scope.authorities,
                    "Wifi": $scope.wifi,
                    "Misc": $scope.misc
                };
                if ($scope.mapLayer != undefined) {
                    map.removeControl($scope.mapLayer);
                }
                $scope.mapLayer = L.control.layers(overlayMaps)
                $scope.mapLayer.addTo(map);
                mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
                L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; ' + mapLink + ' Contributors',
                    maxZoom: 18
                }).addTo(map);
                map.invalidateSize();
            });
        }
        $http.get(MAIN_URL + "poi/").success(function(data, status) {
            $scope.data = data
            authorities = []
            wifi = []
            misc = []
            data.forEach(function(value, key) {
                geoj = value.location;
                geoj.properties = value;
                switch (value.type) {
                    case "authorities":
                        authorities.push(geoj)
                        break;
                    case "wifi":
                        wifi.push(geoj)
                        break;
                    default:
                        misc.push(geoj)
                        break;
                }

            });

            $scope.authorities.addLayer(L.geoJson(authorities, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.description);
                }
            }));
            $scope.wifi.addLayer(L.geoJson(wifi, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.description);
                }
            }));
            $scope.misc.addLayer(L.geoJson(misc, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.description);
                }
            }));
        }).error(function(data, status) {
        });
        angular.extend($scope, {
            layers: [$scope.authorities],
            center: {
                "lat":50.9485795,
                "lng":6.9448561,
                zoom: 13,
            }
        });

    }]);
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['gsw']);
    });
});
function showHome() {
    $("#home").show();
    $("#faq").hide();
    $("#map_container").hide();
    $('nav').removeClass('fixed');
    $('nav li.active').removeClass('active');
    $('nav a#home_link').parent().addClass('active');
}
function showFAQ() {
    $("#home").hide();
    $("#faq").show();
    $("#map_container").hide();
    $('nav').removeClass('fixed');
    $('nav li.active').removeClass('active');
    $('nav a#faq_link').parent().addClass('active');
}
function showMap() {
    $("#home").hide();
    $("#faq").hide();
    $("#map_container").show();
    $('nav').removeClass('fixed');
    $('nav li.active').removeClass('active');
    $('nav a#map_link').parent().addClass('active');
    angular.element("#map").scope().loadMap();

}