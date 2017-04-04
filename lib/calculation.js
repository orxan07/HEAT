'use strict';

var initialize = require('./init');
var param = require('./parameters');
var heat = require('./heat');

module.exports = {

    init:function (input) {

        this.time = 0;
        initialize(input);

        return this;
    },

    start: function () {

        var calc_type = {dim:2};

        while (!this.is_calculation_completed()) {

            heat.calculate(calc_type);

            param.save_calculation(calc_type);

            this.increase_time_by(param.dt);

            param.save_calculation_time(this.time);
        }

    },
    increase_time_by: function (dt) {
        console.log(this.time);
        this.time += dt;
    },
    is_calculation_completed: function () {
        return this.time > param.t_stop;
    }
}


