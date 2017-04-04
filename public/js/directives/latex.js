(function (module) {
    "use strict";

    module.directive("latex", latex);
    latex.$inject = [];
    function latex() {
        return {
            restrict: 'AE',
            link: function (scope, element) {
                var newDom = element.clone();
                element.replaceWith(newDom);
                var pre = "\\(",
                    post = "\\)";
                if (element[0].tagName === 'DIV') {
                    pre = "\\[";
                    post = "\\]";
                }
                scope.$watch(function () {
                    return element.html();
                }, function () {
                    newDom.html(pre + element.html() + post);
                    MathJax.Hub.Typeset(newDom[0]);
                });
            }
        }

    }
})(angular.module("app"));