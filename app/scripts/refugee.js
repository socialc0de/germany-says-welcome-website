MAIN_URL = "http://gsw.pajowu.de/api/"
$(document).ready(function () {
    showHome();
    angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
    $i18nextProvider.options = {
            lng: 'de',
            useCookie: false,
            useLocalStorage: false,
            fallbackLng: 'en',
            resGetPath: 'locales/__lng__/__ns__.json',
            defaultLoadingValue: '', // ng-i18next option, *NOT* directly supported by i18next
            ns: {
                namespaces: ['refugee']
            },
        };
    }]);
    var app = angular.module('gsw', ['nemLogging','leaflet-directive','jm.i18next']);
    app.controller('FAQController', function($scope, $http) {
        $scope.faqData = {}
        $scope.audiences = {}

        $scope.loadFAQ = function() {
            $http.get(MAIN_URL + "audiences/").success(function(data) {
                data.forEach(function(value, key) {
                    $scope.audiences[value['id']] = value['name']
                });
                //$scope.audiences = data;
            });
            for (var i=1;i<=3;i++) {
                $http.get(MAIN_URL + "faq/by-audience/" + i).success((function(key) {
                    return function(data) {
                        $scope.faqData[key] = data;
                    }
                })(i)).error((function(key) {
                    return function() {
                        $scope.faqData[key] = []
                    }
                })(i));
            }
        }
    });
    app.controller('DashboardController', function($scope, $http) {
        $scope.audiences = {}
        $scope.colWidth = 12
        $scope.dashboardCards = [{"name":"FAQ"},{"name":"Map"}]
        $scope.loadDashboard = function() {
            $http.get(MAIN_URL + "audiences/").success(function(data) {
                data.forEach(function(value, key) {
                    $scope.audiences[value['id']] = value['name']
                });
                $scope.colWidth = Math.floor(12/data.length);
                //$scope.audiences = data;
            });
        }
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
    $("#dashboard").hide();
    $("#faq").hide();
    $("#map_container").hide();
    $('#nav').removeClass('fixed');
    $('#nav li.active').removeClass('active');
    $('#nav a#home_link').parent().addClass('active');
}
function showDashboard() {
    $("#home").hide();
    $("#dashboard").show();
    $("#faq").hide();
    $("#map_container").hide();
    $('#nav').removeClass('fixed');
    $('#nav li.active').removeClass('active');
    $('#nav a#dashboard_link').parent().addClass('active');
    angular.element("#dashboard").scope().loadDashboard();
}
function showFAQ() {
    $("#home").hide();
    $("#dashboard").hide();
    $("#faq").show();
    $("#map_container").hide();
    $('#nav').removeClass('fixed');
    $('#nav li.active').removeClass('active');
    $('#nav a#faq_link').parent().addClass('active');
    angular.element("#faq").scope().loadFAQ();
}
function showMap() {
    $("#home").hide();
    $("#dashboard").hide();
    $("#faq").hide();
    $("#map_container").show();
    $('#nav').removeClass('fixed');
    $('#nav li.active').removeClass('active');
    $('#nav a#map_link').parent().addClass('active');
    angular.element("#map").scope().loadMap();

}
 $('.navmenu-fixed-left').offcanvas({
     placement: 'left',
     autohide: 'true',
     recalc: 'true'
 });