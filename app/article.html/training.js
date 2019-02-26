/**
 * Приложение по управлению отправкой заявок на обучение
 */

var istewardTraining = angular.module('istewardTraining', []);

/** Сервис для осуществления рест запросов подачи заявок на обучение */
istewardTraining.service('IstewardRest', [
    '$resource', '$httpParamSerializer',
    function ($resource, $httpParamSerializer) {
        return $resource('', {}, {
            record4training: {
                url: '/isteward-rest/record-for-training',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: function (data) {
                    return $httpParamSerializer(data);
                }
            }
        });
    }]);

/** Контроллер управления подачи заявок на обучение */
istewardTraining.controller('InterviewTrainingCtrl', [
    '$scope', 'IstewardRest', 'ngDialog', '$window', '$timeout',
    function ($scope, IstewardRest, ngDialog, $window, $timeout) {
        var ctrl = this;

        $scope.working = false; /// Указывает на процесс отправки данных

        this.form = {};
        this.formErrors = {};

        /**
         * Сброс ошибок встроенной в ангуляр валидации форм
         */
        this.resetAForm = function () {
            if ($scope.InterviewForm) {
                $scope.InterviewForm.$setPristine();
                $scope.InterviewForm.$setUntouched();
            }
        };

        /**
         * Подает заявку на собеседование
         */
        this.do = function () {
            if ($scope.InterviewForm && !$scope.InterviewForm.$valid) {
                return;
            }

            var success = function (response) {
                ctrl.resetAForm();
                ctrl.form = {};
                ctrl.formErrors = {};
                $scope.working = false;
                ngDialog.open({
                    templateUrl: 'application-is-accepted',
                    className: 'ngdialog-theme-default'
                }).closePromise.then(function () {
                        $window.scrollTo(0, 0);
                    });
            };
            var fail = function (fail) {
                $scope.working = false;
                if (422 == fail.status) { /// Ошибки валидации
                    ctrl.formErrors = parseValidationErrors(fail.data);
                }
            };

            $scope.working = true;
            IstewardRest.record4training(ctrl.form, success, fail);
        };
    }
]);