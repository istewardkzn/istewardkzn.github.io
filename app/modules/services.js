'use strict';

/**
 * Преобразует данные запроса в структуру multipart/form-data
 * @param {Object} data
 * @param {Function} headersGetter
 * @returns {FormData}
 */
function transformToMultipartRequest(data, headersGetter) {
    var body = new FormData();
    var prepareData = function (value) {
        if (value === true) return 1;
        if (value === false) return 0;
        return value;
    };
    angular.forEach(data, function (value, key) {
        if (undefined != value) {
            body.append(key, prepareData(value));
        }
    });
    return body;
}

/** Api Services */

var apiServices = angular.module('apiServices', ['ngResource']);

/**
 * Сервис для получения настроек, зависящих от сервера
 */
apiServices.service('Config', ['$window', function ($window) {
    return $window.appConfig();
}]);

/**
 * Сервис для запросов к апи, связанных с учетными данными
 */
apiServices.service('User', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {}, {
        login: {
            url: Config.apiHost + '/user/login',
            method: 'POST'
        },
        logout: {
            url: Config.apiHost + '/user/logout',
            method: 'POST'
        },
        identify: {
            url: Config.apiHost + '/user/identify/me',
            method: 'POST'
        },
        signup: {
            url: Config.apiHost + '/user/signup',
            method: 'POST'
        },
        resetPassword: {
            url: Config.apiHost + '/user/reset/password',
            method: 'POST'
        },
        confirmReset: {
            url: Config.apiHost + '/user/confirm/reset',
            method: 'POST'
        }
    });
}]);

/**
 * Сервис для запросов к апи, связанных с анкетными данными
 */
apiServices.service('Form', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {}, {
        properties: {
            url: Config.apiHost + '/form/properties',
            method: 'GET',
            isArray: true,
            params: {expand: 'type_name'}
        },
        get: {
            url: Config.apiHost + '/form/:id',
            method: 'GET',
            params: {
                id: 'my',
                expand: 'status_label'
            }
        },
        create: {
            url: Config.apiHost + '/form',
            method: 'POST',
            transformRequest: transformToMultipartRequest,
            headers: {'Content-Type': undefined},
            params: {
                expand: 'status_label'
            }
        },
        update: {
            url: Config.apiHost + '/form/:id',
            method: 'PATCH',
            transformRequest: transformToMultipartRequest,
            headers: {'Content-Type': undefined},
            params: {
                id: 'my',
                expand: 'status_label'
            }
        },
        exists: {
            url: Config.apiHost + '/form/:id',
            method: 'HEAD',
            params: {id: 'my'}
        }
    });
}]);

/** Сервис для обработки запросов на просмотр мероприятий */
apiServices.service('Events', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {}, {
        list: {
            url: Config.apiHost + '/events',
            method: 'GET',
            isArray: true,
            params: {expand: 'status_label'}
        }
    });
}]);

/** Сервис для упривления участнием в мероприятиях */
apiServices.service('Member', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {id: '@id'}, {
        register: {
            url: Config.apiHost + '/member/register/me/at/:eventId',
            method: 'POST',
            params: {'expand': 'status_label', eventId: '@eventId'}
        },
        update: {
            url: Config.apiHost + '/member/:id',
            method: 'PATCH',
            params: {expand: 'status_label'}
        },
        exists: {
            url: Config.apiHost + '/member/:id',
            method: 'HEAD'
        }
    });
}]);

/** Сервис для обработки запросов на получение последних версий клиентских приложений */
apiServices.service('Software', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {os: '@os'}, {
        latest: {
            url: Config.apiHost + '/software/:os/latest',
            method: 'GET'
        }
    });
}]);

/** Сервис для обработки запросов разноообразной логики */
apiServices.service('Various', ['$resource', 'Config', function ($resource, Config) {
    return $resource('', {}, {
        invite: { /// Приглашение друзей на мероприятие
            url: Config.apiHost + '/invite/friend',
            method: 'POST'
        }
    });
}]);