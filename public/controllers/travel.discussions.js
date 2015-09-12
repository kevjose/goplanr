angular.module('MyApp')
    .controller('TravelDiscussionsCtrl', function ($scope, $stateParams, $state, TravelService, Account, socket) {

        $scope.isTravelLoading = true;
        $scope.travel = {};
        $scope.title = '';
        $scope.locations = [];
        $scope.msgs =[];

        TravelService.getTravel($stateParams.id)
            .then(function (response) {
                console.log(response);
                $scope.travel = response.data;
                $scope.msgs = $scope.msgs.concat($scope.travel.discussions);
                $scope.title = $scope.travel.title;
                $scope.locations = $scope.travel.locations;

                $scope.isTravelLoading = false;
            })
            .catch(function (response) {
                console.log(response);

            });
        /**
         * get user
         * @type {{}}
         */
        $scope.user = {};
        $scope.getProfile = function () {
            Account.getProfile()
                .then(function (response) {
                    $scope.user = response.data;
                })
                .catch(function (response) {
                    toastr.clear();
                    toastr.error(response.data.message, response.status);
                });
        };
        $scope.getProfile();

        /**
         * socket things
         */
        socket.on('connect', function () {
            console.log("Connected " + $stateParams.id);
            //socket.emit('room',$stateParams.id);
        });
        $scope.msgs = [];

        $scope.sendMsg = function () {
            socket.emit('send msg', {
                'message': $scope.chat.msg,
                'room': $stateParams.id,
                'createdBy': $scope.user.displayName,
                'createdByEmail':$scope.user.email,
                'createdAt': new Date()
            });
            $scope.chat.msg = '';
        };


        socket.on('get msg', function (data) {
            $scope.msgs.push(data);
            $scope.$digest();
        });
    });