angular.module('MyApp')
    .factory('TravelService', function ($http) {
        return {
            createTravel: function (travel) {
                return $http.post('/api/travel/create', travel);
            },
            getTravel: function (id) {
                return $http.get('/api/travels/' + id);
            },
            getMyTravel: function (travelMate) {
                return $http.get('/api/travels/' + travelMate + '/my-travels');
            },
            deleteTravel: function (id) {
                return $http.delete('/api/travels/delete/' + id);
            },
            getBus: function (searchObject,properlyFormatted) {
                var req = {
                    method: 'JSONP',
                    url: 'https://developer.goibibo.com/api/bus/search/',
                    params: {
                        callback:'JSON_CALLBACK',
                        app_id: 'f64a6762',
                        app_key: '64bb10123574f5e5f4b79fcb6d88d50d',
                        format: 'json',
                        source:searchObject.source ,
                        destination: searchObject.dest,
                        dateofdeparture: properlyFormatted
                    },
                    headers: {
                        'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'
                    }
                }
                return $http(req);
            }
        };
    });