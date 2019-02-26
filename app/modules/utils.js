'use strict';

/**
 * Преобразует список ошибок валидации в объект
 * @param {Array} errors
 * @returns {{}}
 */
function parseValidationErrors(errors) {
    var i = errors.length,
        result = {};
    while (--i >= 0) {
        result[errors[i]['field']] = errors[i]['message'];
    }
    return result;
}