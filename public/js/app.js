(function () {
    "use strict";

    var app = angular.module("app", ["ngResource", "ui.router", "ngProgress"])
        .run(['$anchorScroll', function ($anchorScroll) {
            $anchorScroll.yOffset = 5;   // always scroll by 50 extra pixels
        }])

    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$provide', '$compileProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider, $provide, $compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
            $httpProvider.defaults.transformRequest = [function (data) {


                /**
                 * The workhorse; converts an object to x-www-form-urlencoded serialization.
                 * @param {Object} obj
                 * @return {String}
                 */
                var param = function (obj) {
                    var query = '';
                    var name, value, fullSubName, subName, subValue, innerObj, i;

                    for (name in obj) {
                        value = obj[name];

                        if (value instanceof Array) {
                            for (i = 0; i < value.length; ++i) {
                                subValue = value[i];
                                fullSubName = name + '[' + i + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if (value instanceof Object) {
                            for (subName in value) {
                                subValue = value[subName];
                                fullSubName = name + '[' + subName + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if (value !== undefined && value !== null) {
                            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                        }
                    }

                    return query.length ? query.substr(0, query.length - 1) : query;
                };

                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            }];

            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common["X-Requested-With"];
            $httpProvider.defaults.headers.common["Accept"] = "application/json";
            $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

            var baseUrl = '/js/controllers';

            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('heat1', {
                    cache: false,
                    url: '/heat1',
                    templateUrl: baseUrl + '/heat1/heat.html'
                })
        }]);
}())
