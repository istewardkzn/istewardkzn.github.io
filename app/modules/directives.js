'use strict';

/** Application Directives */

var istewardDirectives = angular.module('istewardDirectives', []);

/** Фокус формы на первом виджете ввода данных */
istewardDirectives.directive('formAutofocus', ['$timeout', function ($timeout) {
    return {
        require: '^?form',
        restrict: 'A',
        scope: false,
        priority: 1,
        link: {
            post: function (scope, element, attrs) {
                var isVisible = function (elm) {
                    return !(
                        !elm.offsetHeight && !elm.offsetWidth
                        || getComputedStyle(elm).visibility === 'hidden'
                    );
                };
                var call = function () {
                    $timeout(function () {
                        var index = 0, end = element[0].length;
                        while (index < end) {
                            if (isVisible(element[0][index])) break;
                            index++;
                        }
                        element[0][index].focus();
                    }, 50);
                };
                scope.$on(attrs['formAutofocus'], call);
                call();
            }
        }
    }
}]);

/** Генерирование события после окончания цикла ngRepeat */
istewardDirectives.directive('triggerRepeatEnd', function () {
    return {
        scope: false,
        link: {
            post: function (scope, element, attrs) {
                if (scope.$last) {
                    scope.$emit(attrs['triggerRepeatEnd']);
                }
            }
        }
    }
});

/**
 * Фокус формы на первом виджете имеющем ошибку валидации.
 * В значении атрибута следует указать модель, котороя хранит список ошибок валидации
 * Предназначено для частного случая обработки ответа сервисов HTTP 422: опирается на совпадение
 * ключей модели ошибок со значением атрибута name виджета
 */
istewardDirectives.directive('formErrorFocus', [
    '$timeout', '$parse',
    function ($timeout, $parse) {
        return {
            require: '^?form',
            restrict: 'A',
            scope: false,
            priority: 1,
            link: {
                post: function (scope, element, attrs) {
                    var call = function (firstErrorIndex) {
                        $timeout(function () {
                            element[0][firstErrorIndex].focus();
                        }, 50);
                    };
                    scope.$watch(
                        function (sc) {
                            return $parse(attrs['formErrorFocus'])(sc);
                        },
                        function (model) {
                            if (angular.isObject(model)) {
                                var eKeys = Object.keys(model);
                                if (eKeys.length > 0) {
                                    for (var index = 0, end = element[0].length;
                                         index < end;
                                         index++
                                    ) {
                                        if (eKeys.indexOf(element[0][index].name) >= 0) {
                                            call(index);
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                }
            }
        }
    }
]);

/**
 * Фокус формы на первом виджете, который имеет ошибку встроенной в ангуляр валидации
 * Данный форкус применяется в предварительной валидации формы
 */
istewardDirectives.directive('formNgError', ['$timeout', function ($timeout) {
    return {
        require: '^?form',
        restrict: 'A',
        scope: false,
        link: {
            post: function (scope, element, attrs) {
                var call = function (firstErrorIndex) {
                    $timeout(function () {
                        element[0][firstErrorIndex].focus();
                    }, 50);
                };

                element.bind('submit', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    for (var index = 0, end = element[0].length;
                         index < end;
                         index++
                    ) {
                        if (element[0][index].className.indexOf('ng-invalid') >= 0) {
                            call(index);
                            break;
                        }
                    }
                });
            }
        }
    };
}]);

/** Виджеты для отображения значений параметров анкеты пользователя */

/** Фабрика для отрисовки виджетов */
istewardDirectives.directive('fieldFactory', [
    '$compile',
    function ($compile) {
        return {
            restrict: 'AC',
            priority: 100,
            scope: false,
            link: {
                post: function (scope, iElement, iAttrs) {
                    var field, fieldClass;
                    fieldClass = 'data-field-' + iAttrs['fieldFactory'];
                    field = iElement.clone();
                    field
                        .removeAttr(iAttrs.$attr['fieldFactory'])
                        .removeAttr(iAttrs.$attr['ngRepeat'])
                        .addClass(fieldClass);

                    iElement.replaceWith($compile(field)(scope));
                }
            }
        };
    }
]);

/**
 * Содержит базовую конфигурация для директив field
 * @returns {{}}
 */
var fieldsConfigDefault = {
    restrict: 'AC',
    priority: 50,
    transclude: true,
    scope: {
        error: '<fieldError',
        model: '=fieldModel',
        prop: '<fieldProperty',
        title: '@fieldTitle',
        tooltip: '@fieldTooltip'
    },
    templateUrl: ''
};

/** Тип значения параметра "password" (пароль) */
istewardDirectives.directive('fieldPassword', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-password.html'
    });
});

/** Тип значения параметра "string" (строка, код 1) */
istewardDirectives.directive('fieldString', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-string.html'
    });
});

/** Тип значения параметра "enum" (список, код 2) */
istewardDirectives.directive('fieldEnum', ['$timeout', function ($timeout) {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-enum.html',
        controller: ['$scope', function ($scope) {
            $scope.openOptions = function () {
                $scope.optionsOpen = true;
            };
            $scope.closeOptions = function () {
                $timeout(function () {
                    $scope.optionsOpen = false
                }, 150);
            };
            $scope.toggleOptions = function () {
                $scope.optionsOpen = !$scope.optionsOpen;
            }
        }],
        link: {
            post: function (scope, element, attrs) {
                scope.optionsOpen = false;
                var wrapper = angular.element(element[0].firstChild);
                wrapper.bind('blur', function (ev) {
                    scope.$apply(scope.closeOptions);
                });
            }
        }
    });
}]);

/** Тип значения параметра "file" (файл, код 3) */
istewardDirectives.directive('fieldFile', function () {
    return angular.merge({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-file.html',
        scope: {
            getPreview: '&fieldPreview'
        },
        controller: ['$scope', function ($scope) {
            $scope.remove = function () {
                $scope.model = '';
                $scope.previewName = '';
            };
        }],
        link: {
            post: function (scope, element, attrs) {
                var prop = scope.prop;
                scope.readonly = prop.access && prop.access != 'owner_edit';

                var initField = function () {
                    if (angular.isObject(scope.model)) {
                        scope.previewName = scope.model.name;
                        scope.preview = '';
                    } else if (scope.model) {
                        scope.previewName = String(scope.model).split('/').pop();
                        scope.preview = scope.getPreview()(scope.model);
                    }
                };

                var input = angular.element(element.find('input')[0]);
                input.bind('change', function () {
                    scope.$apply(function () {
                        scope.model = input[0].files[0];
                        input[0].value = '';
                    });
                });

                scope.$watch('model', initField);
                initField();
            }
        }
    });
});

/** Тип значения параметра "image" (изображение, код 4) */
istewardDirectives.directive('fieldImage', ['$parse', function ($parse) {
    return angular.merge({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-image.html',
        scope: {
            getPreview: '&fieldPreview'
        },
        link: {
            post: function (scope, element, attrs) {
                var prop = scope.prop;
                scope.readonly = prop.access && prop.access != 'owner_edit';
                scope.preview = scope.getPreview()(scope.model);

                var input = angular.element(element.find('input')[0]);
                input.bind('change', function () {
                    scope.$apply(function () {
                        scope.model = input[0].files[0];
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            input[0].value = '';
                            scope.$apply(function () {
                                scope.preview = event.target.result;
                            });
                        };
                        reader.readAsDataURL(scope.model);
                    });
                });
                scope.$watch( /// Отслеживает изменение модели и заменяет предпросмотр на стартовый
                    'model',
                    function () {
                        scope.preview = scope.getPreview()(scope.model);
                    });
            }
        }
    });
}]);

/** Тип значения параметра "number" (число, код 5) */
istewardDirectives.directive('fieldNumber', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-string.html'
    });
});

/** Тип значения параметра "date" (дата, тип 6) */
istewardDirectives.directive('fieldDate', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-date.html'
    });
});

/** Тип значения параметра "bool" (переключатель, тип 7) */
istewardDirectives.directive('fieldBool', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-bool.html',
        link: {
            post: function (scope, element, attrs) {
                scope.modelA = false;

                scope.$watch('model', function () {
                    if (angular.isString(scope.model)) {
                        scope.modelA = (scope.model != '0');
                    }
                });

                scope.$watch('modelA', function (modelA) {
                    scope.model = modelA;
                });
            }
        }
    });
});

/** Тип значения параметра "text" (текстовое поле, код 8) */
istewardDirectives.directive('fieldText', function () {
    return angular.extend({}, fieldsConfigDefault, {
        templateUrl: '/app/templates/modules/directives/field-text.html'
    });
});