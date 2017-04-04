(function (module) {
    "use strict";

    module.controller("saturationExplicitCtrl", saturationExplicitCtrl);
    saturationExplicitCtrl.$inject = ['ngProgressFactory', "$anchorScroll", "$location", "algorithmService"];
    function saturationExplicitCtrl(ngProgressFactory, $anchorScroll, $location, algorithmService) {
        var vm = this;


        var graphs = [], annotations = [];
        //Progress bar
        vm.progressbar = ngProgressFactory.createInstance();
        vm.progressbar.setHeight('20px');
        var fontSize = 26;
        var d3 = Plotly.d3;
        var img_jpg = d3.select('#jpg-export');

        var graphTemplate = {
            //annotations: annotations,
            font: {
                family: 'Times New Roman',
                size: fontSize,
                color: 'black'
            },
            showlegend: true, // qiraqdaki yazini

            line: {
                width: 3
            },
            margin: {
                l: 140,
                r: 40,
                t: 70,
                b: 100
            },

            xaxis: {

                //nticks: 20,
                ticklen: 10,
                tickwidth: 4,
                tickcolor: 'black',
                ticks: 'outside',

                showline: true,
                linewidth: 4,
                linecolor: 'black',
                zeroline: false,
                zerolinewidth: 4,
                zerolinecolor: 'black',
                title: "х",
                titlefont: {
                    size: 26,
                    family: 'Times New Roman'
                },
                //range: [0.025, 0.37]
                // range: [0, 0.001]
            },
            yaxis: {
                //nticks: 20,
                ticklen: 10,
                tickwidth: 4,
                tickcolor: 'black',
                ticks: 'outside',
                //dtick:0.1,
                showline: true,
                linewidth: 4,
                linecolor: 'black',
                zeroline: false,
                zerolinewidth: 4,
                zerolinecolor: 'black',
                title: "",
                // range: [0, 1],
                titlefont: {
                    size: 26,
                    family: 'Times New Roman'
                }
                //range: [0, 0.5]
            },

            title: ""
        };


        var cl = 0;

        vm.plotClear = function () {
            gotoAnchor("data");
            for (; cl; cl--)
                Plotly.deleteTraces('tester', 0);
            Plotly.deleteTraces('corrector', 0);
        };

        var data = [];

        vm.components = {
            L: 1,
            N: 100,
            t: 0.1,
            dt: 0.001,
            ct: 1.4,
            min_dt: 1e-10,
            max_dt: 1e-2,
            h: 0.01,
            e: 1e-3,
            max_it: 5,
            min_it: 2,
            betta: 0,
            kappa: 0.5,
            sigma: 2,
            Q: 0,
            T_init: 0,//'(x<0.6)&&(x>0.4)&&(y<0.6)&&(y>0.4)?10:0',
            T_L: 'x<=5*t*Math.sqrt(2)?Math.sqrt(100*t-20*x/Math.sqrt(2)):0',
            T_R: 0,
            T_U: 0,
            T_D: 'y<=5*t*Math.sqrt(2)?Math.sqrt(100*t-20*y/Math.sqrt(2)):0',
            Rho: 1//'y<0.4&&y>0.2?1:y<0.8&&y>0.6?1:0'//&&(y<0.51)&&(y>0.49)?10000:10',
            ,kappa_x1:0,
            kappa_x2:0,
            kappa_y1:0,
            kappa_y2:0,

        };

        function U(x, t) {
            x = x * Math.sqrt(2);
            var c = 5, s = 2, k = 0.5;
            if (x <= c * t)
                return Math.pow(s * (c / k) * (c * t - x), 1 / s)
                //return Math.sqrt(100 * t - 20 * x)
            else if (x >= c * t)
                return 0;
        }

        function U2(x, t) {
            var c = 0.1125, s = 2, k = 0.5, x1 = 0.5;
            if (x <= x1)
                return Math.pow(s * Math.pow(x1 - x, 2)
                    / (2 * k * (s + 2) * (c - t) )
                    , 1 / s)
            else if (x >= x1)
                return 0;
        }

        vm.calculate = function () {

            data[0] = {
                x: [],
                y: [],
                z: [],
                colorscale: [['0', 'rgb(12,51,131)'], ['0.25', 'rgb(10,136,186)'], ['0.5', 'rgb(242,211,56)'], ['0.75', 'rgb(242,143,56)'], ['1', 'rgb(217,30,30)']],

                //colorscale: [["0.0", "#bbd3db"], ["0.0125223613596", "#bed5dc"], ["0.0948121645796", "#d1e2e7"], ["0.1771019678", "#e4eef2"], ["0.25939177102", "#f2f2f2"], ["0.34168157424", "#f9e0e2"], ["0.42397137746", "#f6cdd0"], ["0.50626118068", "#f2babe"], ["0.5885509839", "#efa8ad"], ["0.67084078712", "#eb959c"], ["0.75313059034", "#e8848b"], ["0.83542039356", "#e47179"], ["0.91771019678", "#e15e68"], ["1.0", "#dd4c57"]],
                name: "",
                type: "heatmap",
                zsmooth: "fast"
            }

            vm.progressbar.start();

            cl += 2;
            algorithmService.calculate('explicit', vm.components).then(function (result) {

                var _x = [];
                var N = vm.components.N;
                var h = vm.components.L / N;
                for (var i = 0; i <= N; i++) {
                    var x = i * h;
                    _x.push(x);
                }


                var TA = [];
                for (i = 0; i <= vm.components.N; i++) {
                    TA[i] = U(_x[i], vm.components.t);
                }
                graphs.push({x: _x, y: TA, name: "Analytic", line: {width: 3, color: 'red'}});

                var T = [];
                for (var i = 0; i <= N; i++) {
                    var C = new Array();
                    for (var j = 0; j <= N; j++) {
                        C[j] = result.T[i][j];
                    }

                    T.push(C)
                }
                data[0].x = _x;
                data[0].y = _x;
                data[0].z = T;

                var Temp = [];
                for (var i = 0; i <= N; i++) {
                    Temp[i] = result.T[i][i];
                }
                //Plotly.newPlot(corrector, data, graphTemplate);

                //graphs.push({x: _x, y: result.T, name: "T",line: {width: 3, color: 'black'}});
                graphs.push({x: _x, y: Temp, name: "T", line: {width: 3, color: 'black'}});

                Plotly.newPlot(corrector, data, graphTemplate);


                Plotly.newPlot(tester, graphs, graphTemplate);
                vm.progressbar.complete();
                gotoAnchor("graph");

            }, function (err) {
                console.error(err);
            });


        };

        var lineType = {
            dash: 'dash',
            dot: 'dot',
            dashdot: 'dashdot'
        };
        vm.download = function (id) {

            var height = 1000, weight = 1400;
            var image = Plotly.plot(id);
            image.then(
                function (gd) {
                    Plotly.toImage(gd, {format: 'jpeg', height: height, width: weight})
                        .then(
                            function (url) {
                                img_jpg.attr("src", url);
                                var img = Plotly.toImage(gd, {format: 'jpeg', height: height, width: weight})

                                window.open(
                                    url,
                                    '_blank' // <- This is what makes it open in a new window.
                                );
                            }
                        )
                })
        }


        var gotoAnchor = function (x) {
            var newHash = x;
            if ($location.hash() !== newHash) {
                // set the $location.hash to `newHash` and
                // $anchorScroll will automatically scroll to it
                $location.hash(x);
            } else {
                // call $anchorScroll() explicitly,
                // since $location.hash hasn't changed
                $anchorScroll();
            }
        };
        vm.progressbar.complete();


    }
})
(angular.module("app"));