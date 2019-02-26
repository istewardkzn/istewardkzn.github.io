/**
 * Реализует функционал прокрутки изображений - "карусель"
 * Стили CSS3 см в файле css/01-frontend.css в разделе intro, стр 1488
 */

var isCarousel = angular.module('isCarousel', []);

isCarousel.directive('isCarousel', ['$timeout', function ($timeout) {
    return {
        restrict: 'AC',
        transclude: true,
        template: '<div data-ng-transclude></div>',
        scope: {
            viewingTime: '@isViewingTime',
            scrollingTime: '@isScrollingTime',
            direction: '@isCycleDirection'
        },
        controller: ['$scope', function (scope) {
            /**
             * Листает изображения слева направо: "вперед"
             */
            scope.nextSlide = function () {
                var prev = scope.sliders[scope.currentIndex];

                scope.currentIndex += 1;
                if (scope.currentIndex >= scope.slidersLength) {
                    scope.currentIndex = 0;
                }
                var slider = scope.sliders[scope.currentIndex];
                slider.css('left', '100%');

                scope.filmstrip.css({
                    'margin-left': '-100%',
                    transition: scope.scrollingTime + 's ease all'
                });

                scope._normalize(prev, slider);
            };

            /**
             * Листает изображения справа налево: "назад"
             */
            scope.previousSlide = function () {
                var prev = scope.sliders[scope.currentIndex];

                scope.currentIndex -= 1;
                if (scope.currentIndex < 0) {
                    scope.currentIndex = scope.slidersLength - 1;
                }
                var slider = scope.sliders[scope.currentIndex];
                slider.css('left', '-100%');

                scope.filmstrip.css({
                    'margin-left': '100%',
                    transition: scope.scrollingTime + 's ease all'
                });

                scope._normalize(prev, slider);
            };

            /**
             * Циклически пролистывает все изображения карусели
             */
            scope.carouselCycle = function () {
                $timeout(function () {
                    if (scope.direction == 'rtl') {
                        scope.previousSlide();
                    } else {
                        scope.nextSlide();
                    }
                    $timeout(function () {
                        scope.carouselCycle();
                    }, scope.scrollingTime * 1000);
                }, scope.viewingTime * 1000);
            };

            /**
             * Приводит состояние окна просмотра к "нулевой" отметке
             * @param {{}} prev
             * @param {{}} slider
             * @private
             */
            scope._normalize = function (prev, slider) {
                $timeout(function () {
                    prev.css('left', '200%');
                    slider.css('left', 0);
                    scope.filmstrip.css({'margin-left': 0, transition: 'none'});
                }, scope.scrollingTime * 1000);
            };
        }],
        link: {
            post: function (scope, element, attrs) {
                scope.filmstrip = angular.element(element.find('.filmstrip')[0]);
                scope.sliders = [];
                scope.currentIndex = 0;

                if (!scope.direction) {
                    scope.direction = 'ltr';
                }

                element.find('.slide').each(function (i, o) {
                    var $o = angular.element(o);
                    var l = i != 0 ? 2 : 0;
                    scope.sliders.push($o);
                    $o.css({left: l * 100 + '%'});
                });

                scope.slidersLength = scope.sliders.length;

                scope.carouselCycle();
            }
        }
    };
}]);