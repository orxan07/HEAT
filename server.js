// set up ======================================================================
var express = require('express');
var app = express(); 								// create our app w/ express
var port = process.env.PORT || 8080; 				// set the port
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');

// configuration ===============================================================

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use('/bower', express.static(__dirname + '/bower_components/'));

app.use('/plotly', express.static(__dirname + '/plotly/'));

app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
