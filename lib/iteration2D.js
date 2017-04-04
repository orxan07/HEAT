'use strict';
var param = require('./parameters');
var sweep = require('./sweep');
var functions = require('./functions');
var util = require('util');
var assert = require('assert');

module.exports = {

    init: function () {

        this.log = '';
        this.Ts = [];
        this.Tp = [];

        for (var i = 0; i <= param.N; i++) {
            this.Ts[i] = new Array(param.N + 1);
            this.Tp[i] = new Array(param.N + 1);
        }
        //номер итерации
        this.number = 0;
        return this;
    },

    start: function () {

        var Ts = this.Ts;
        var ct = param.ct;
        var N = param.N;
        var T = param.T;
        var ST = param.ST;

        for (var j = 0; j <= N; j++) {
            for (var i = 0; i <= N; i++) {
                Ts[i][j] = T[i][j];
            }
        }


        while (!this.iteration_completed()) {

            if (this.is_max()) {
                param.reduce_dt();
                this.reset_iteration();
                continue;
            }

            if (param.dt < param.min_dt)
                throw  new Error('Time step is less than minimal value of the time step {' + param.min_dt + '}');


            this.sweep_x();
            this.sweep_y();


            if (this.is_converge()) {
                if (param.get_time() > 4.3)
                    console.log('dt:', param.dt, 'it:', this.number);
                if (this.is_min() && param.dt * ct < param.max_dt) {
                    param.increase_dt();
                }
                this.number = 0;
                break;
            }

            this.save_iteration();

            this.next_iteration();
        }

        this.number = 0;

    },
    sweep_x: function () {

        var A = [], B = [], C = [], F = [];
        var f = Object.create(functions).init();
        var fs = Object.create(functions).init({T: this.Ts});
        var h = param.h;
        var N = param.N;
        var dt = param.dt;

        var T = param.T;
        var Cv = param.R / (param.gamma - 1);
        var k = 0.5 / (h * h);
        var t = param.time[param.time.length - 1];
        for (var j = 1; j < N; j++) {
            var y = j * h;
            for (var i = 1; i < N; i++) {

                var x = i * h;
                var rhoCv = 1;//parseFloat(eval(param.Rho) * Cv);

                A[i] = 0.5 * k * (fs.hecon(i, j) + fs.hecon(i - 1, j));
                B[i] = 0.5 * k * (fs.hecon(i + 1, j) + fs.hecon(i, j));
                C[i] = A[i] + B[i] + rhoCv / dt;
                F[i] = rhoCv * T[i][j] / dt + 0.5 * (fs.heat_source(i, j) + f.L2T(i, j));
            }
            var nu_1 = 0.5 * (f.T_D(y, t + dt) + f.T_D(y, t)); //todo: недокончено :см. схема Писмена и Рекфорда
            var nu_2 = 0.5 * (f.T_U(y, t + dt) + f.T_U(y, t)); //todo: недокончено :см. схема Писмена и Рекфорда
            //console.log(mu)

            var res = sweep.init({
                A: A,
                B: B,
                C: C,
                F: F,
                kappa_1: param.kappa_x1,
                nu_1: nu_1,
                kappa_2: param.kappa_x2,
                nu_2: nu_2
            }).start();

            for (var i = 0; i <= N; i++) {
                this.Tp[i][j] = res[i];
            }
        }

    }
    ,
    sweep_y: function () {

        var A = [], B = [], C = [], F = [];
        var f = Object.create(functions).init();
        var fx = Object.create(functions).init({T: this.Tp});
        var fs = Object.create(functions).init({T: this.Ts});
        var h = param.h;
        var N = param.N;
        var dt = param.dt;
        var k = 0.5 / (h * h);
        var Cv = param.R / (param.gamma - 1);
        var t = param.time[param.time.length - 1];
        for (var i = 1; i < N; i++) {
            var x = i * h;

            for (var j = 1; j < N; j++) {

                var y = j * h;
                var rhoCv = 1;//parseFloat(eval(param.Rho) * Cv);

                A[j] = 0.5 * k * (fs.hecon(i, j) + fs.hecon(i, j - 1));
                B[j] = 0.5 * k * (fs.hecon(i, j + 1) + fs.hecon(i, j));
                C[j] = A[j] + B[j] + rhoCv / dt;
                F[j] = rhoCv * this.Tp[i][j] / dt + 0.5 * (fs.heat_source(i, j) + fx.L1T(i, j));
            }
            var nu_1 = f.T_L(x, t + dt); //todo: недокончено :см. схема Писмена и Рекфорда
            var nu_2 = f.T_R(x, t + dt);
            var res = sweep.init({
                A: A,
                B: B,
                C: C,
                F: F,
                kappa_1: param.kappa_y1,
                nu_1: nu_1,
                kappa_2: param.kappa_y2,
                nu_2: nu_2
            }).start();

            for (var j = 0; j <= N; j++) {
                param.ST[i][j] = res[j];
            }
        }

    }
    ,

    is_converge: function () {
        for (var j = 1; j < param.N; j++)
            for (var i = 1; i < param.N; i++) {
                var DT = param.ST[i][j] - this.Ts[i][j];
                if (isNaN(DT))
                    throw  Error('DT is NaN');
                if (Math.abs(DT) > 1e-2 * Math.abs(this.Ts[i][j]) + 1e-4
                ) {
                    return false
                }
            }
        return true;
    }
    ,
    is_max: function () {
        return this.number >= param.max_it;
    }
    ,
    is_min: function () {
        return this.number < param.min_it;
    },
    reset_iteration: function () {
        var N = param.N;
        for (var j = 0; j <= N; j++)
            for (var i = 0; i <= N; i++) {
                param.ST[i][j] = this.Ts[i][j] = param.T[i][j];
            }
        this.number = 0;
    },
    next_iteration: function () {
        this.number++;

    }
    ,
    save_iteration: function () {
        var Ts = this.Ts;
        var N = param.N;
        for (var j = 0; j <= N; j++)
            for (var i = 0; i <= N; i++) {
                Ts[i][j] = param.ST[i][j];
            }
    }
    ,
    iteration_completed: function () {
        var result = (this.number === param.max_it + 1);
        return result
    }
};