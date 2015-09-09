angular.module('MyApp')
    .factory('TravelService', function($http) {
        return {
            createTravel: function(travel) {
                return $http.post('/api/travel/create',travel);
            },
            getTravel: function(id) {
                return $http.get('/api/travels/'+id);
            },
            getMyTravel:function(createdBy){
                return $http.get('/api/travels/'+createdBy+'/my-travels');
            },
            deleteTravel:function(id){
                return $http.delete('/api/travels/delete/'+id);
            }
        };
    });