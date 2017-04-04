var param = require('./parameters');
var heat = require('./heat');

module.exports = function (args) {
    args = args || {};

    var input = JSON.parse(args);

    param.N = input.N || param.N;
    param.h = param.L / param.N;
    param.betta = input.betta;
    param.kappa = parseFloat(input.kappa);
    param.sigma = input.sigma;
    param.Q = input.Q;
    param.t_stop = input.t;
    param.T_init = input.T_init;
    param.T_D = input.T_D;
    param.T_U = input.T_U;
    param.T_L = input.T_L;
    param.T_R = input.T_R;
    param.Rho = input.Rho;
    param.kappa_x1 = input.kappa_x1;
    param.kappa_x2 = input.kappa_x2;
    param.kappa_y1 = input.kappa_y1;
    param.kappa_y2 = input.kappa_y2;
    heat.init({dim:2});
};
