'use strict';
var param = require('./parameters');
var sweep = require('./sweep');
var functions = require('./functions');
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
var log_stdout = process.stdout;
var assert = require('assert');

var lg = function (d) { //
    //log_file.write(util.format(d) + '\n');
    //log_stdout.write(util.format(d) + '\n');
};


module.exports = {

    init: function () {

        this.log = '';
        this.Ts = [];
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

        for (var i = 0; i <= N; i++) {
            Ts[i] = T[i];
        }


        while (!this.iteration_completed()) {

            if (this.is_max()) {
                param.reduce_dt();
                this.reset_iteration();
                continue;
            }

            if (param.dt < param.min_dt)
                throw  new Error('Time step is less than minimal value of the time step {' + param.min_dt + '}');


            this.sweep();

            if (this.is_converge()) {
                if (this.is_min() && param.dt * ct < param.max_dt) {
                    param.increase_dt();
                    this.reset_iteration();
                    continue;
                }
                this.number = 0;
                break;
            }

            this.save_iteration();

            this.next_iteration();
        }

        this.number = 0;

        for (var i = 0; i <= N; i++) {
            // ST[i][0] = ST[i][1];
            //ST[i][N] = ST[i][N - 1];
        }

        for (var j = 0; j <= N; j++) {
            //ST[0][j] = ST[1][j];
            //ST[N][j] = ST[N - 1][j];
        }


    },
    sweep: function () {

        var A = [], B = [], C = [], F = [];
        var f = Object.create(functions).init();
        var fs = Object.create(functions).init({T: this.Ts});
        var h = param.h;
        var N = param.N;
        var dt = param.dt;

        var T = param.T;
        var Cv = param.R / (param.gamma - 1);
        var k = dt / (h * h);
        var t = param.time[param.time.length - 1];
        for (var i = 1; i < N; i++) {

            var x = i * h;
            var rhoCv = 1;//parseFloat(eval(param.Rho) * Cv);

            A[i] = 0.5 * k * (fs.hecon(i) + fs.hecon(i - 1));
            B[i] = 0.5 * k * (fs.hecon(i + 1) + fs.hecon(i));
            C[i] = A[i] + B[i] + 1;
            F[i] = T[i] + dt * fs.heat_source(i);
        }
        var mu = f.T_D(x, t + dt); //todo: недокончено

        param.ST = sweep.init({A: A, B: B, C: C, F: F,  nu_1: mu}).start();


    }
    ,

    is_converge: function () {
        for (var i = 1; i < param.N; i++) {
            var DT = param.ST[i] - this.Ts[i];
            if (isNaN(DT))
                throw  Error('DT is NaN');
            if (Math.abs(DT) > 1e-3 * Math.abs(this.Ts[i]) + 1e-3
            ) {
                lg('итерация не сошлась');
                return false
            }
        }
        lg('итерация сошлась');
        return true;
    }
    ,
    is_max: function () {
        return this.number >= param.max_it;
    }
    ,
    is_min: function () {
        return this.number < param.min_it;
    }
    ,
    reset_iteration: function () {
        var N = param.N;
        for (var i = 0; i <= N; i++) {
            param.ST[i] = this.Ts[i] = param.T[i];
        }
        this.number = 0;
    }
    ,
    next_iteration: function () {
        this.number++;
        lg('увеличиваем итерацию, новое значение итерации:' + this.number);

    }
    ,
    save_iteration: function () {
        lg('сохраняем значения итераций')
        var Ts = this.Ts;
        var N = param.N;
        for (var i = 0; i <= N; i++) {
            Ts[i] = param.ST[i];
        }

    }
    ,
    iteration_completed: function () {
        var result = (this.number === param.max_it + 1);
        return result
    }
}
;