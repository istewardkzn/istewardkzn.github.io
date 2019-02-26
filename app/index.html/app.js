'use strict';

/** Application module */

var istewardApp = angular.module('isteward', [
    'ngRoute',
    'ngDialog',
    'indexDialogs',
    'istewardControllers',
    'istewardFilters',
    'istewardDirectives',
    'apiServices',
    'isCarousel'
]);

/** Предварительно загружает необходимые шаблоны */
istewardApp.run(['$http', '$templateCache', function ($http, $templateCache) {
    var invokes = angular.module('istewardDirectives')._invokeQueue,
        shouldPreloaded = ['fieldPassword', 'fieldString'],
        isBePreloaded = function (dName) {
            return shouldPreloaded.indexOf(dName) >= 0;
        };

    for (var i in invokes) {
        if (invokes[i][1] === "directive") {
            var dFuncIndex = invokes[i][2].length - 1,
                dFunc = invokes[i][2][dFuncIndex],
                dConf;

            if (isBePreloaded(invokes[i][2][0]) && angular.isFunction(dFunc)) {
                dConf = dFunc();
                if (dConf['templateUrl'] != undefined) {
                    $http.get(dConf['templateUrl'], {cache: $templateCache});
                }
            }
        }
    }
}]);

istewardApp.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function ($routeProvider, $httpProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/signup', {
                templateUrl: 'panel-signup', /// Использует $templateCache сервис
                controller: 'SignupUserCtrl',
                controllerAs: 'signup'
            })
            .when('/events', {
                templateUrl: 'panel-index',
                controller: 'EventsTableCtrl',
                controllerAs: 'etable'
            })
            .otherwise({
                redirectTo: '/events'
            });

        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common['Accept'] = 'application/json';
        $httpProvider.defaults.withCredentials = true;
    }
]);
