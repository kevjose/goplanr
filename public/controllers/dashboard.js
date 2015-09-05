angular.module('MyApp')
    .controller('DashboardCtrl', function ($scope, $auth, toastr) {
        /**
         * Sidebar Toggle
         */
        var mobileView = 992;

        $scope.getWidth = function () {
            return window.innerWidth;
        };

        $scope.$watch($scope.getWidth, function (newValue, oldValue) {
            console.log(newValue +" "+oldValue);
            if (newValue >= mobileView) {
                    $scope.toggle = true;
            } else {
                $scope.toggle = false;
            }

        });

        $scope.toggleSidebar = function () {
            console.log($scope.toggle);
            $scope.toggle = !$scope.toggle;
        };

        window.onresize = function () {
            $scope.$apply();
        };

    });