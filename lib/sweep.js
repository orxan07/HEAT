'use strict';
var assert = require('assert');
var math = require('mathjs');
var param = require('./parameters');
var functions = require('./functions');

var Operation = {
    init: function (args) {
        var args = args || {};
        this.A = args.A;
        this.B = args.B;
        this.C = args.C;
        this.F = args.F;

        this.kappa_1 = (args.kappa_1 == 1)?1 - (1e-6):args.kappa_1;
        this.nu_1 = args.nu_1;
        this.kappa_2 = (args.kappa_2 == 1)?1 - (1e-6):args.kappa_2;
        this.nu_2 = args.nu_2;
        return this;
    },
    start: function () {
        var A = this.A, B = this.B, C = this.C, F = this.F, alpha = [], betta = [], Y = [];

        var N = B.length;
        var kappa_1 = this.kappa_1;
        var nu_1 = this.nu_1;
        var kappa_2 = this.kappa_2;
        var nu_2 = this.nu_2;


        // из левого граничного условия  y_0 = kappa_1 * y_1 + nu_1
        alpha[1] = kappa_1; // ноль если условие на границе первого рода
        betta[1] = nu_1;


        for (var i = 1; i < N; i++) {
            //assert.ok(A[i] > 0, 'Условие метода прогонки не соблюдены! \nA[' + i + '] <= 0, A = ' + A[i]);
            // assert.ok(B[i] > 0, 'Условие метода прогонки не соблюдены! \nB[' + i + '] <= 0, B = ' + B[i]);
            assert.ok(Math.abs(C[i]) >= Math.abs(A[i]) + Math.abs(B[i]), 'Условие метода прогонки не соблюдены! \nC[' + i + ']<A[' + i + ']+B[' + i + '], C = ' + C[i]);
        }

        assert.ok((Math.abs(kappa_1) + Math.abs(kappa_2) < 2)
            && (Math.abs(kappa_1) < 1)
            && (Math.abs(kappa_2) < 1),
            'Условие метода прогонки не соблюдены! \nkappa1 + kappa2 >= 2\nkappa1 = ' + kappa_1 + '\nkappa2 = ' + kappa_2);


        for (var i = 1; i < N; i++) {
            alpha[i + 1] = (B[i]) / (C[i] - alpha[i] * A[i]);
            betta[i + 1] = (A[i] * betta[i] + F[i]) / (C[i] - alpha[i] * A[i]);
        }


        // из правого граничного условия  y_N = kappa_2 * y_N-1 + nu_2
        Y[N] = (nu_2 + kappa_2 * betta[N]) / (1 - kappa_2 * alpha[N]);

        for (var i = N - 1; i >= 0; i--) {
            Y[i] = alpha[i + 1] * Y[i + 1] + betta[i + 1];
        }

        return Y;

    },
    start_matrix: function () {
        var A = this.A, B = this.B, C = this.C, F = this.F, alpha = [], betta = [], Y = [];

        var N = param.N

        // из левого граничного условия  y_0 = kappa_1 * y_1 + nu_1
        alpha[1] = math.multiply(math.inv(C[0]), B[0]); // ноль если условие на границе первого рода
        betta[1] = math.multiply(math.inv(C[0]), F[0]);

        /* for (var i = 1; i < N; i++) {
         //assert.ok(A[i] > 0, 'Условие метода прогонки не соблюдены! \nA[' + i + '] <= 0, A = ' + A[i]);
         // assert.ok(B[i] > 0, 'Условие метода прогонки не соблюдены! \nB[' + i + '] <= 0, B = ' + B[i]);
         assert.ok(Math.abs(C[i]) >= Math.abs(A[i]) + Math.abs(B[i]), 'Условие метода прогонки не соблюдены! \nC[' + i + ']<A[' + i + ']+B[' + i + '], C = ' + C[i]);
         }

         assert.ok((Math.abs(kappa_1) + Math.abs(kappa_2) < 2)
         && (Math.abs(kappa_1) < 1)
         && (Math.abs(kappa_2) < 1),
         'Условие метода прогонки не соблюдены! \nkappa1 + kappa2 >= 2\nkappa1 = ' + kappa_1 + '\nkappa2 = ' + kappa_2);
         */

        for (var i = 1; i < N; i++) {
            var IM = math.inv(
                math.subtract(
                    C[i], math.multiply(
                        A[i], alpha[i]
                    )
                ));
            alpha[i + 1] = math.multiply(IM, B[i]);
            betta[i + 1] = math.multiply(
                IM,
                math.add(
                    F[i], math.multiply(A[i], betta[i])
                ));
        }

        Y[N] = math.multiply(
            math.inv(
                math.subtract(
                    C[N], math.multiply(
                        A[N], alpha[N]
                    )
                )),
            math.add(
                math.multiply(A[N], betta[N]), F[N]
            )
        );

        for (var i = N - 1; i >= 0; i--) {
            Y[i] = math.add(math.multiply(alpha[i + 1], Y[i + 1]), betta[i + 1]);
        }

        return Y;

    }
};

module.exports = Operation;
