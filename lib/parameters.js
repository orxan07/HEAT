'use strict';

var Parameters = {

        //начальная температура
        T_init: 0,
        //Температура
        T: [],
        //искомое
        ST: [],
        //слева
        T_L: 0,
        //справа
        T_R: 0,
        //сверху
        T_U: 0,
        //снизу
        T_D: 0,
        //показатель адиабаты
        gamma: 5 / 3,
        //универсальная газовая постоянная
        R: 766.4,
        //начальная плотность среды
        Rho: 10,
        //постоянная при коэф.теплопроводности
        kappa: 5,
        //постоянная при истонике тепла
        Q: 1,
        //показатель при температуре в коэф.теплопроводности
        sigma: 1,
        //показатель при температуре в источнике тепла.
        betta: 1,
        //шаг по времени
        dt: 0.001,
        //коэффициент  отвечающая за  уменьшение или увеличение шага по времени (итерация)
        ct: 1.5,
        //максимальное число итераций
        max_it: 6,
        //минимальное число итераций
        min_it: 2,
        //максимальное значение шага по времени
        min_dt: 1e-10,
        //минимальное значение шага по времени
        max_dt: 1e-2,
        //время расчета
        t_stop: 1,
        //последовательность моментов time[n]+=dt
        time: [0],
        // число точек
        N: 100,
        // длина области
        L: 1,
        //шаг по пространству
        h: this.L / this.N,
        //полная энергия
        E: null,
        //dimension
        dim: 2,
        // y0 = kappa_1*y1 + nu_1, yN = kappa_2*yN-1 + nu_2
        kappa_x1:0,
        kappa_x2:0,
        kappa_y1:0,
        kappa_y2:0,


        getResult: function () {
            return {
                T: this.T
            }
        }
        ,

        save_calculation: function () {
            if (this.dim === 2) {
                for (var j = 0; j <= this.N; j++)
                    for (var i = 0; i <= this.N; i++)
                        this.T[i][j] = this.ST[i][j];
            }
            else {
                for (var i = 0; i <= this.N; i++)
                    this.T[i] = this.ST[i];
            }

        },
        save_calculation_time: function (time) {
            this.time.push(time);
        },

        reduce_dt: function () {
            var ct = Math.random() * (1.8 - 1.2) + 1.2;
            this.dt /= ct;

        },
        increase_dt: function () {
            var ct = Math.random() * (1.8 - 1.2) + 1.2;
            this.dt *= ct;

        },
        get_time: function () {
            return this.time[this.time.length - 1];
        },
        test: function (x, t) {
            var c = 0.1125, s = 2, k = 0.5, x1 = 0.5;
            if (x <= x1)
                return Math.pow(s * Math.pow(x1 - x, 2)
                    / (2 * k * (s + 2) * (c - t) )
                    , 1 / s)
            else if (x >= x1)
                return 0;
        }
    }
    ;


module.exports = Parameters;
