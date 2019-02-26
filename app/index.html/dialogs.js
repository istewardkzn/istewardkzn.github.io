'use strict';

/** Диалоги главной страницы index.html */

var indexDialogs = angular.module('indexDialogs', ['ngDialog']);

/** Диалог идентификации пользователя */
indexDialogs.service('LoginDialog', ['ngDialog', function (ngDialog) {
    var dialog;
    return {
        open: function () {
            dialog = ngDialog.open({
                templateUrl: 'login-dialog',
                className: 'ngdialog-theme-default',
                controller: 'LoginDialogCtrl',
                controllerAs: 'login',
                name: 'loginDialog'
            });
            return dialog;
        },
        close: function () {
            ngDialog.close('loginDialog');
            return dialog;
        }
    };
}]);

/** Диалог отправки запроса на сброс пароля */
indexDialogs.service('ResetDialog', ['ngDialog', function (ngDialog) {
    return {
        open: function () {
            return ngDialog.open({
                templateUrl: 'reset-dialog',
                className: 'ngdialog-theme-default',
                controller: 'ResetDialogCtrl',
                controllerAs: 'passwordReset',
                closeByDocument: false,
                name: 'resetDialog'
            });
        },
        close: function () {
            return ngDialog.close('resetDialog');
        }
    };
}]);

/** Диалог завершения сброса пароля */
indexDialogs.service('ResetDoneDialog', ['ngDialog', function (ngDialog) {
    return {
        open: function () {
            return ngDialog.open({
                templateUrl: 'reset-done',
                className: 'ngdialog-theme-default',
                name: 'resetDone'
            });
        },
        close: function () {
            return ngDialog.close('resetDone');
        }
    };
}]);

/** Диалог завершения регистрации пользователя */
indexDialogs.service('RegResultDialog', ['ngDialog', function (ngDialog) {
    return {
        open: function () {
            return ngDialog.open({
                templateUrl: 'signup-done',
                className: 'ngdialog-theme-default',
                name: 'regResult'
            });
        },
        close: function () {
            return ngDialog.close('regResult');
        }
    };
}]);