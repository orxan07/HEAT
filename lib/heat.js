'use strict';
var iteration1D = require('./iteration1D').init();
var iteration2D = require('./iteration2D').init();
var param = require('./parameters');
var functions = require('./functions');


module.exports = {
    init: function () {

        var N = param.N;
        if (param.dim === 2) {
            for (var i = 0; i <= param.N; i++) {
                param.T[i] = new Array(param.N + 1);
                param.ST[i] = new Array(param.N + 1);
            }
            for (var i = 0; i <= N; i++) {
                var x = i * param.h;
                for (var j = 0; j <= N; j++) {
                    var y = j * param.h;
                    //var res = param.test(x, 0)//eval(param.T_init);
                    var res = eval(param.T_init);
                    eval(param.T_init);
                    param.ST[i][j] = param.T[i][j] = res;
                }
            }
        }
        else {
            for (var i = 0; i <= N; i++) {
                var x = i * param.h;
                var res = eval(param.T_init);
                param.ST[i] = param.T[i] = res;
            }
        }


    },
    calculate: function () {
        var t = param.get_time();
        var N = param.N;
        var T = param.T;
        if (param.dim === 2) {
            for (var j = 0; j <= N; j++) {
                var y = j * param.h;
                //param.ST[0][j] = param.T[0][j] = param.test(0, t) //b.cond. for test solution
                param.ST[0][j] = T[0][j] = param.kappa_x1 * T[0][j] + eval(param.T_D); //todo: при г.у. 2 рода второй член должен быть умножен на аш.
                param.ST[N][j] = T[N][j] = param.kappa_x2 * T[N - 1][j] + eval(param.T_U);

            }
            for (var i = 0; i <= N; i++) {
                var x = i * param.h;
                param.ST[i][0] = T[i][0] = param.kappa_y1 * T[i][1] + eval(param.T_L);
                param.ST[i][N] = T[i][N] = param.kappa_y2 * T[i][N - 1] + eval(param.T_R);
            }
            iteration2D.start();
        }
        else {
            param.ST[0] = param.T[0] = eval(param.T_D);
            iteration1D.start();
        }
    }
};