'use strict';

/** Application module */

var istewardApp = angular.module('isteward', [
    'ngRoute',
    'ngDialog',
    'indexDialogs',
    'istewardControllers',
    'istewardFilters',
    'istewardDirectives',
    'istewardTraining',
    'apiServices'
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

istewardApp.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common['Accept'] = 'application/json';
        $httpProvider.defaults.withCredentials = true;
    }
]);
