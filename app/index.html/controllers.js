'use strict';

/** Index Page Application controllers */

var istewardControllers = angular.module('istewardControllers', []);

/** Главный контроллер индексной страницы index.html */
istewardControllers.controller('IndexPageController', [
    '$scope', '$rootScope', '$route', 'User', 'Form', 'Config', 'LoginDialog',
    function ($scope, $rootScope, $route, User, Form, Config, LoginDialog) {
        $rootScope.form = {};
        $rootScope.user = User.identify(null, function (success) {
            if (success.login) {
                $rootScope.form = Form.get();
            }
        });

        $scope.page = {
            title: 'iSteward',
            oldTitle: 'iSteward'
        };

        this.config = Config;

        /**
         * Возвращает предыдущий заголовок страницы
         */
        $scope.restoreTitle = function () {
            $scope.page.title = $scope.page.oldTitle;
        };

        /**
         * Изменяет заголовок страницы
         * @param {String} title
         */
        $scope.setTitle = function (title) {
            if (title && title != $scope.page.title) {
                $scope.page.oldTitle = $scope.page.title;
                $scope.page.title = title;
            }
        };

        /**
         * Проверяет, активен ли роут по переданному модификатору
         * @param {string} route
         * @returns {boolean}
         */
        $scope.isRouteActive = function (route) {
            if (!$route.current) return false;
            return $route.current.originalPath == route;
        };

        /**
         * Открывает диалоговое окно входа в систему
         * @param {String} title
         */
        this.openLogin = function (title) {
            $scope.setTitle(title);
            LoginDialog.open().closePromise.then(function () {
                $scope.restoreTitle();
            });
        };

        /**
         * Разлогивание пользователя
         */
        this.logout = function () {
            $rootScope.form = {
                avatar_url: Config.avatarEmpty
            };
            if ($rootScope.user.login) {
                $rootScope.user.$logout();
            }
        }
    }
]);

/** Контроллер формы идентификации пользователя */
istewardControllers.controller('LoginDialogCtrl', [
    '$scope', '$rootScope', 'User', 'Form', 'Config', '$window', 'LoginDialog', 'ResetDialog', '$timeout',
    function ($scope, $rootScope, User, Form, Config, $window, LoginDialog, ResetDialog, $timeout) {
        var ctrl = this;
        this.form = {};
        this.formErrors = {};

        /**
         * Производит идентификацию пользователя в системе
         */
        this.do = function () {
            ctrl.formErrors = {};
            User.login(
                ctrl.form,
                function (success) {
                    ctrl.form = {};
                    ctrl.formErrors = {};
                    LoginDialog.close().closePromise.then(function () {
                        $window.location.href = Config.signupRedirect;
                    });
                },
                function (fail) {
                    $rootScope.user.login = false;
                    if (422 == fail.status) { /// Ошибки валидации
                        ctrl.formErrors = parseValidationErrors(fail.data);
                    }
                }
            );
        };

        /**
         * Открывает диалог сброса пароля
         */
        this.passwordReset = function () {
            LoginDialog.close();
            ResetDialog.open();
        };
    }
]);

/** Контроллер формы регистрации пользователя */
istewardControllers.controller('SignupUserCtrl', [
    '$scope', 'Form', 'User', '$window', 'Config', '$rootScope', 'RegResultDialog', '$timeout',
    function ($scope, Form, User, $window, Config, $rootScope, RegResultDialog, $timeout) {
        $scope.properties = Form.properties();
        $scope.createdUser = false;
        $scope.focusOnFirstElement = 'focus-on-first-element';
        $scope.working = false; /// Указывает на процесс отправки данных

        var ctrl = this;
        this.form = {};
        this.user = {};
        this.formErrors = {};
        this._user = null;

        /**
         * Сброс ошибок встроенной в ангуляр валидации форм
         */
        this.resetAForm = function () {
            if ($scope.signupForm) {
                $scope.signupForm.$setPristine();
                $scope.signupForm.$setUntouched();
            }
        };

        /**
         * Очищает форму ввода данных
         */
        this.reset = function () {
            this.form = {};
            this.user = {};
            this.formErrors = {};
            this._user = null;
            $scope.working = false;
            $scope.$emit($scope.focusOnFirstElement); /// ctrl.resetAForm();
            $window.scrollTo(0, 0);
        };

        /**
         * Генерирует урл для предпросмотра ресурса-изображения
         * FIXME: Пока нет логики генерирования превью и получения url на файловый ресурсы
         *
         * @param {String} uri
         * @returns {String}
         */
        this.getPreview = function (uri) {
            var preview = Config.avatarEmpty;
            if (uri) {
                preview = Config.cdnHost + uri;
            }
            return preview;
        };

        /**
         * Регистрация пользователя
         */
        this.do = function () {
            if ($scope.signupForm && !$scope.signupForm.$valid) {
                return;
            }
            ctrl.formErrors = {};
            var regFinished = function () {
                $rootScope.user = ctrl._user;
                $scope.working = false;
                ctrl.openRegResult();
            };
            var regError = function () {
                $scope.working = false;
            };
            $scope.working = true;
            if (!$scope.createdUser) {
                ctrl.createUser(function () {
                    ctrl.createForm(regFinished, regError);
                }, regError);
            } else {
                ctrl.createForm(regFinished, regError);
            }
        };

        /**
         * Создает пользователя сервиса
         * @param {Function} callbackSuccess Выполняет, когда пользователь успешно создан
         * @param {Function} callbackFail Выполняет, когда получены ошибки
         */
        this.createUser = function (callbackSuccess, callbackFail) {
            ctrl.user.username = ctrl.form.phone;
            ctrl.user.email = ctrl.form.email;
            ctrl._user = User.signup(
                ctrl.user,
                function (success) {
                    $scope.createdUser = true;
                    if (angular.isFunction(callbackSuccess)) callbackSuccess(success);
                },
                function (fail) {
                    $scope.createdUser = false;
                    if (422 == fail.status) { /// Ошибки валидации
                        ctrl.formErrors = parseValidationErrors(fail.data);
                        ctrl.formErrors['phone'] = ctrl.formErrors['username'];
                    }
                    if (angular.isFunction(callbackFail)) callbackFail(fail);
                }
            );
        };

        /**
         * Создание анкеты пользователя
         * @param {Function} callbackSuccess Выполняет, когда анкета успешно создана
         * @param {Function} callbackFail Выполняет, когда получены ошибки
         */
        this.createForm = function (callbackSuccess, callbackFail) {
            ctrl.formErrors = {};
            $rootScope.form = Form.create(
                ctrl.form,
                function (success) {
                    if (angular.isFunction(callbackSuccess)) callbackSuccess(success);
                },
                function (fail) {
                    if (422 == fail.status) { /// Ошибки валидации
                        ctrl.formErrors = parseValidationErrors(fail.data);
                    }
                    if (angular.isFunction(callbackFail)) callbackFail(fail);
                }
            );
        };

        /**
         * Открывает завершающий диалог регистрации пользователя
         */
        this.openRegResult = function () {
            RegResultDialog.open()
                .closePromise.then(function () {
                    $window.location.href = Config.signupRedirect;
                });
        };

        /**
         * Фильтр для отобращения виджетов ввода для значений параметров
         * Должны быть отображены при создании только те поля, которые может менять пользователь
         * @param {object} prop
         * @returns {boolean}
         */
        this.propFilter = function (prop) {
            return prop.access == 'owner_edit';
        };

        $scope.$on($scope.focusOnFirstElement, function () { /// После цикла ngRepeat
            $timeout(ctrl.resetAForm, 55);
        });
    }
]);

/** Контроллер списка мероприятий */
istewardControllers.controller('EventsTableCtrl', [
    '$scope', 'Events', '$filter',
    function ($scope, Events, $filter) {
        /**
         * Создает предикат для сортировки списка
         * @param {String} field
         */
        $scope.order = function (field) {
            $scope.reverse = ($scope.sortField === field) ? !$scope.reverse : false;
            $scope.sortField = field;
            $scope.predicate = function (data) {
                var res = $filter('base64decode')(data[$scope.sortField]);
                return $filter('strip_tags')(res);
            };
        };

        /**
         * Проверяет текущий предикат сортировки принадлежит полю name
         * @param {string} name
         * @returns {boolean}
         */
        $scope.isActive = function (name) {
            return $scope.sortField == name;
        };

        $scope.working = false; /// Указывает на процесс обработки данных
        $scope.predicate = null;
        $scope.ievents = [];
        $scope.sortField = 'date_start';
        $scope.reverse = false;
        $scope.order($scope.sortField);
        $scope.hasMore = true;
        $scope.listCfn = {
            page: 1,
            gte: 0,
            sort: '-date_start',
            'per-page': 5
        };

        /**
         * Осуществляет запрос на получение списка мероприятий сервиса
         */
        $scope.more = function () {
            $scope.working = true;
            Events.list($scope.listCfn, function (success, headers) {
                $scope.ievents = success.concat($scope.ievents);
                $scope.hasMore = ($scope.listCfn.page != headers('X-Pagination-Page-Count'));
                if ($scope.hasMore) $scope.listCfn.page++;
            }).$promise.finally(function () {
                    $scope.working = false;
                });
        };
    }
]);

/** Контроллер формы идентификации пользователя */
istewardControllers.controller('ResetDialogCtrl', [
    '$scope', '$rootScope', 'User', 'ResetDialog', 'ResetDoneDialog', 'LoginDialog',
    function ($scope, $rootScope, User, ResetDialog, ResetDoneDialog, LoginDialog) {
        var ctrl = this;
        this.form = {};
        this.formErrors = {};
        $scope.resetStep = 1;
        $scope.focusOnFirstElement = 'focus-on-first-element';

        /**
         * Запрос получения кода сброса пароля
         */
        this.reset = function () {
            ctrl.formErrors = {};
            User.resetPassword(
                ctrl.form,
                function (success) {
                    ctrl.formErrors = {};
                    $scope.resetStep = 2;
                    $scope.$emit($scope.focusOnFirstElement);
                },
                function (fail) {
                    if (422 == fail.status) { /// Ошибки валидации
                        ctrl.formErrors = parseValidationErrors(fail.data);
                    }
                }
            );
        };

        /**
         * Производит сброс пароля пользователя
         */
        this.confirm = function () {
            ctrl.formErrors = {};
            User.confirmReset(
                ctrl.form,
                function (success) {
                    ctrl.form = {};
                    ctrl.formErrors = {};
                    $rootScope.user.login = false;
                    ctrl.openResetResult();
                },
                function (fail) {
                    if (422 == fail.status) { /// Ошибки валидации
                        ctrl.formErrors = parseValidationErrors(fail.data);
                    }
                }
            );
        };

        /**
         * Открывает завершающий диалог успешной смены пароля
         */
        this.openResetResult = function () {
            ResetDialog.close();
            ResetDoneDialog.open().closePromise.then(function () {
                LoginDialog.open();
            });
        };
    }
]);

/** Контроллер для отображения информации о последних версиях клиентского ПО */
istewardControllers.controller('LatestVersionCtrl', [
    '$scope', 'Software',
    function ($scope, Software) {
        $scope.showBlock = false;
        $scope.android = Software.latest({os: 'android'}, function () {
            $scope.showBlock = true;
        });
    }
]);
