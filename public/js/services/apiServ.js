(function (module) {
    "use strict";

    module.factory('algorithmService', ["$http", "$q", algorithmService]);


    function algorithmService($http, $q, algorithmService) {

        return {
            calculate: calculate,
        }

        self.allErrors = [];

        function calculate(methodName,input) {

            var production ='http://gidra.euniversitet.org/api/calculation/';
            var development ='http://localhost:8080/api/calculation/';
            var deferred = $q.defer();
            if (input != null) {
                $http({
                    method: 'GET',
                    url: development,
                    params: {input: input,methodName:methodName}
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (err) {
                    deferred.reject(err);
                });
            }

            return deferred.promise;
        }
    }

})(angular.module("app"));
