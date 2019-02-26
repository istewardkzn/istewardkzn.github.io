'use strict';

/** Filters */

var istewardFilters = angular.module('istewardFilters', []);

/** Декодирует base64 данные */
istewardFilters.filter('base64decode', function () {
    return function base64decode(text) {
        if (!angular.isString(text)) return text;
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch (e) {
        }
        return text;
    }
});

/** Меняет ключи хеша со значениями */
istewardFilters.filter('array_flip', function () {
    return function array_flip(trans) {
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //  depends on: array
        //   example 1: array_flip( {a: 1, b: 1, c: 2} );
        //   returns 1: {1: 'b', 2: 'c'}
        //   example 2: ini_set('phpjs.return_phpjs_arrays', 'on');
        //   example 2: array_flip(array({a: 0}, {b: 1}, {c: 2}))[1];
        //   returns 2: 'b'

        var key, tmpAr = {};

        for (key in trans) {
            if (!trans.hasOwnProperty(key)) {
                continue;
            }
            tmpAr[trans[key]] = key;
        }

        return tmpAr;
    }
});

/** Фильтрует список по заданной простой функции */
istewardFilters.filter('array_filter', function () {
    return function array_filter(arr, func) {
        //        note: Takes a function as an argument, not a function's name
        //   example 1: var odd = function (num) {return (num & 1);};
        //   example 1: array_filter({"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}, odd);
        //   returns 1: {"a": 1, "c": 3, "e": 5}
        //   example 2: var even = function (num) {return (!(num & 1));}
        //   example 2: array_filter([6, 7, 8, 9, 10, 11, 12], even);
        //   returns 2: {0: 6, 2: 8, 4: 10, 6: 12}
        //   example 3: array_filter({"a": 1, "b": false, "c": -1, "d": 0, "e": null, "f":'', "g":undefined});
        //   returns 3: {"a":1, "c":-1};

        var retObj = {};

        if (!angular.isFunction(func)) {
            if (undefined != func) {
                func = new Function('v', 'k', 'return ' + func);
            } else {
                func = function (v) {
                    return v;
                };
            }
        }

        angular.forEach(arr, function (item, key) {
            if (func(item, key)) retObj[key] = item;
        });

        return retObj;
    }
});

/** Приводит серверное время отдаваемое PostgreSQL в корректный ISO8601 формат */
istewardFilters.filter('pgISO8601', function () {
    return function pgISO8601(raw) {
        return String(raw).replace(' ', 'T') + 'Z';
    }
});

/**
 * Преобразует интервал времени в секундах в строковое
 * представление [d]д [h]ч [m]м (дней часов минут)
 */
istewardFilters.filter('intervalToStr', function () {
    return function intervalToStr(seconds) {
        var days = Math.floor(seconds / 86400),
            hours = Math.floor(((seconds / 86400) % 1) * 24),
            min = Math.round(((seconds / 3600) % 1) * 60),
            res = [];

        if (days > 0) res.push(String(days) + 'д');
        if (hours > 0) res.push(String(hours) + 'ч');
        if (min > 0) res.push(String(min) + 'м');

        return res.join(' ');
    }
});

/** Удаляет хтмл теги и прочие сущности */
istewardFilters.filter('strip_tags', function () {
    return function strip_tags(input, allowed) {
        //  discuss at: http://phpjs.org/functions/strip_tags/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '-i-b-');
        //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">
        // van <i>Zonneveld</i></p>', '-p-');
        //   returns 2: '<p>Kevin van Zonneveld</p>'
        //   example 3:
        // strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "-a-");
        //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
        //   example 4: strip_tags('1 < 5 5 > 1');
        //   returns 4: '1 < 5 5 > 1'
        //   example 5: strip_tags('1 <br/> 1');
        //   returns 5: '1  1'
        //   example 6: strip_tags('1 <br/> 1', '-br-');
        //   returns 6: '1 <br/> 1'
        //   example 7: strip_tags('1 <br/> 1', '-br-br/-');
        //   returns 7: '1 <br/> 1'

        if (!angular.isString(input)) return input;

        allowed = (((allowed || '') + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || [])
            // making sure the allowed arg is a string containing only tags in lowercase (-a-b-c-)
            .join('');
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '')
            .replace(tags, function ($0, $1) {
                return allowed.indexOf('-' + $1.toLowerCase() + '-') > -1 ? $0 : '';
            });
    }
});

/**
 * Преобразует текст с сущностями html в кусок html кода
 * NOTE: Опасность инъекций
 */
istewardFilters.filter('renderHtml', ['$sce', function ($sce) {
    var elem = angular.element('<textarea />');
    return function renderHtml(html) {
        var decoded = elem.html(html).text();
        return $sce.trustAsHtml(decoded);
    };
}]);

/** Проверяет, что объект или массив не пустой */
istewardFilters.filter('isEmpty', function () {
    return function isEmpty(data) {
        if (angular.isArray(data)) {
            return data.length <= 0;
        }

        if (angular.isObject(data)) {
            return Object.keys(data).length <= 0;
        }

        return true;
    };
});