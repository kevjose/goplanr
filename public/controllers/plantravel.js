angular.module('MyApp')
    .controller('PlanTravelCtrl', function ($scope, $location, $auth, toastr) {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: new google.maps.LatLng(23.200000, 79.225487),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        var infowindow = new google.maps.InfoWindow({
            maxWidth: 160
        });
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


                                var markers = new Array();
                                // Add the markers and infowindows to the map
                                for (var i = 0; i < $scope.locations.length; i++) {
                                    var marker = new google.maps.Marker({
                                        position: new google.maps.LatLng($scope.locations[i].lat, $scope.locations[i].lng),
                                        map: map,
                                    });
                                    markers.push(marker);
                                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                                        return function () {
                                            infowindow.setContent($scope.locations[i].name);
                                            infowindow.open(map, marker);
                                        }
                                    })(marker, i));
                                }

                                function autoCenter() {
                                    //  Create a new viewpoint bound
                                    var bounds = new google.maps.LatLngBounds();
                                    //  Go through each...
                                    for (var i = 0; i < markers.length; i++) {
                                        bounds.extend(markers[i].position);
                                    }
                                    //  Fit these bounds to the map
                                    map.fitBounds(bounds);
                                }

                                autoCenter();
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