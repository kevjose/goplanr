angular.module('MyApp', ['ngResource', 'ngMessages', 'ngAnimate', 'toastr', 'ui.router', 'satellizer','ui.bootstrap'])
    .config(function ($stateProvider, $urlRouterProvider, $authProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                controller: 'HomeCtrl',
                templateUrl: 'partials/home.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'partials/signup.html',
                controller: 'SignupCtrl',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })
            .state('logout', {
                url: '/logout',
                template: null,
                controller: 'LogoutCtrl'
            })
            .state('plantravel', {
                url: '/plantravel',
                templateUrl: 'partials/plantravel.html',
                controller: 'PlanTravelCtrl'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'partials/dashboard.html',
                controller: 'DashboardCtrl',
                abstract: true,
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('dashboard.profile', {
                url: '/profile',

                views: {
                    'dashboardContent': {
                        templateUrl: 'partials/profile.html',
                        controller: 'ProfileCtrl'
                    }
                }
            })
            .state('dashboard.mytravels', {
                url: '/mytravels',

                views: {
                    'dashboardContent': {
                        templateUrl: 'partials/mytravels.html'
                    }
                }
            })
            .state('dashboard.mytravels.upcoming', {
                url: '/upcoming',
                templateUrl: 'partials/mytravels-upcoming.html'
            })

            // url will be /form/interests
            .state('dashboard.mytravels.past', {
                url: '/past',
                templateUrl: 'partials/mytravels-past.html'
            });

        $urlRouterProvider.otherwise('/');

        $authProvider.facebook({
            clientId: '657854390977827'
        });

        $authProvider.google({
            clientId: '631036554609-v5hm2amv4pvico3asfi97f54sc51ji4o.apps.googleusercontent.com'
        });

        $authProvider.github({
            clientId: '0ba2600b1dbdb756688b'
        });

        $authProvider.linkedin({
            clientId: '77cw786yignpzj'
        });

        $authProvider.instagram({
            clientId: '799d1f8ea0e44ac8b70e7f18fcacedd1'
        });

        $authProvider.yahoo({
            clientId: 'dj0yJmk9SDVkM2RhNWJSc2ZBJmQ9WVdrOWIzVlFRMWxzTXpZbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0yYw--'
        });

        $authProvider.twitter({
            url: '/auth/twitter'
        });

        $authProvider.live({
            clientId: '000000004C12E68D'
        });

        $authProvider.twitch({
            clientId: 'qhc3lft06xipnmndydcr3wau939a20z'
        });

        $authProvider.oauth2({
            name: 'foursquare',
            url: '/auth/foursquare',
            clientId: 'MTCEJ3NGW2PNNB31WOSBFDSAD4MTHYVAZ1UKIULXZ2CVFC2K',
            redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
            authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate'
        });

        function skipIfLoggedIn($q, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.reject();
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function loginRequired($q, $location, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                $location.path('/login');
            }
            return deferred.promise;
        }
    });
