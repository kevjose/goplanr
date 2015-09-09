angular.module('MyApp')
    .factory('TravelService', function($http) {
        return {
            createTravel: function(travel) {
                return $http.post('/api/travel/create',travel);
            },
            getTravel: function(id) {
                return $http.get('/api/travels/'+id);
            }
        };
    });