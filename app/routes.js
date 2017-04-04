var calculation = require('../lib/calculation');
var param = require('../lib/parameters');

module.exports = function (app) {

    app.get('/api/calculation', function (req, res) {
        var input = req.query.input;
        var method = req.query.methodName;

        try {
            switch (method) {

                case 'explicit':
                    calculation.init(input).start();
                    break;
                case 'by_volume':
                    break;
            }

            var result = param.getResult();
            res.send(result);
        }
        catch (ex) {
            result = {message:ex.message,at_time:param.time[param.time.length-1],stack:ex.stack};
            res.status(400).send(result);
        }
    });


    app.use(function (req, res, next) {
        //res.header("Access-Control-Allow-Origin", "*");
        //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });

};