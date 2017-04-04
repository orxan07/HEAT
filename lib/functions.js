'use strict';
var param = require('./parameters');


module.exports = {
    init: function (args) {
        args = args || {};
        this.T = args.T || param.T;
        return this;

    },

    //коэффициент теплопроводности
    hecon: function (i, j) {
        var T = param.dim == 2 ? this.T[i][j] : this.T[i];
        var res = param.kappa * Math.pow(T, param.sigma);
        return res;
    },

    heat_source: function (i, j) {
        var T = param.dim == 2 ? this.T[i][j] : this.T[i];
        var res = param.Q * Math.pow(T, param.betta);
        return res;
    },

    L1T: function (i, j) {
        var T = this.T;
        var h = param.h;
        var k1 = 0.5 * (this.hecon(i + 1, j) + this.hecon(i, j));
        var k2 = 0.5 * (this.hecon(i, j) + this.hecon(i - 1, j));
        var res = (k1 * (T[i + 1][j] - T[i][j]) - k2 * (T[i][j] - T[i - 1][j])) / (h * h);
        return res;
    },
    L2T: function (i, j) {
        var T = this.T;
        var h = param.h;
        var k1 = 0.5 * (this.hecon(i, j + 1) + this.hecon(i, j));
        var k2 = 0.5 * (this.hecon(i, j) + this.hecon(i, j - 1));
        var res = (k1 * (T[i][j + 1] - T[i][j]) - k2 * (T[i][j] - T[i][j - 1])) / (h * h);
        return res;
    },
    T_D: function (y, t) {
        //var res = param.test(0,t);
        var res = eval(param.T_D);
        return res;
    },
    T_U: function (y, t) {
        var res = eval(param.T_U);
        return res;
    },
    T_L: function (x, t) {
        var res = eval(param.T_L);
        return res;
    },
    T_R: function (x, t) {
        var res = eval(param.T_R);
        return res;
    }

};