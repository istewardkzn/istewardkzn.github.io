'use strict';

/**
 * Конфигурация приложения
 * @returns {{}}
 */
function appConfig() {
    return {
        apiHost: 'https://api.isteward.ru',
        cdnHost: 'https://disk.isteward.ru',
        avatarEmpty: '/img/avatar-empty.jpg',
        signupRedirect: '/cabinet.html#/events',
        logoutRedirect: '/',
        homeUrl: '/'
    }
}