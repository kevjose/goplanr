angular.module('MyApp')
    .controller('PlanTravelCtrl', function ($scope, $location, $auth, toastr) {
        $scope.markerLat = 23.200000;
        $scope.markerLng = 79.225487;
        $scope.infoTitle = 'India';

        var india = new google.maps.LatLng($scope.markerLat, $scope.markerLng);

        var mapOptions = {
            zoom: 4,
            center: india,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        }

        $scope.map = new google.maps.Map(document.getElementById('map'),
            mapOptions);

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();

        $scope.addMarker = function (lat, lng, title) {

            var latLang = new google.maps.LatLng(lat, lng);

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: latLang,
                title: title
            });
            marker.content = '<div class="infoWindowContent">'
                + marker.title + '</div>';

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.setContent('<h2>' + marker.title + '</h2>'
                    + marker.content);
                infoWindow.open($scope.map, marker);
            });

            $scope.markers.push(marker);

            $scope.map.setCenter(latLang);
        };
        $scope.openInfoWindow = function (e, selectedMarker) {
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        }
        /**
         * Adding places on map
         */
        $scope.place = {
            name: '',
            description: ''
        }
        $scope.lat = '';
        $scope.lng = '';
        $scope.locations = [];
        $scope.addLocation = function (place) {
            if ($scope.locations.indexOf(place) == -1) {
                /**
                 * get Coordinates
                 */
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({'address': place.name},
                    function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var latitude = results[0].geometry.location.lat();
                            var longitude = results[0].geometry.location.lng();
                            $scope.$apply(function () {
                                place.lat = latitude;
                                place.lng = longitude;
                                $scope.locations.push(place);
                                console.log($scope.locations);
                            });
                        }
                    }
                );
            } else {
                toastr.clear();
                toastr.info('Location already exists');

            }
            $scope.place = {};
            $scope.lat = '';
            $scope.lng = '';

        }

    });