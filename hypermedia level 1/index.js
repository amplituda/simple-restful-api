var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = {};

var setupResponder = function(res) {
	return function(err, response) {
		if(err) {
			res.send(JSON.stringify(err));
		} else {
			res.send(JSON.stringify(response));
		}
	};
};



// Connect to an NeDB database
db.movies = new Datastore({filename: 'db/movies', autoload: true});

// Necessary for accessing POST data via req.body object
app.use(express.bodyParser());

// Routes
app.get('/', function(req, res) {
	res.send('The Api is working');
})
.post('/movies', function(req, res) {
	var body = req.body;
	var respond = setupResponder(res);
 
	res.set('Content-type', 'application/json');

	switch(body.action){
		case "viewList":
			db.movies.find({}, respond);
			break;
		case "addNew":
			db.movies.insert({title: body.title}, respond);
			break;
		default:
			respond({error: 'No action given in request.'});
	}
})
.post('/movie/:id', function(req, res) {
	var body = req.body;
	var respond = setupResponder(res);
	res.set('Content-type', 'application/json');
	switch(body.action) {
		case "view":
			db.movies.findOne({_id: req.params.id}, respond);
			break;
		case "rate":
			db.movies.update({_id: req.params.id }, { $set: {rating: body.rating}},
			function(err, num) {
				respond(err, {  success: num + " records updated"});
			});
			break;
	}
})
.post('/rpc', function(req, res) {
	var body = req.body;
	var respond = function(err, results) {
		if(err) {
			res.send(JSON.stringify(err));
		} else {
			res.send(JSON.stringify(results));
		}
	};


	res.set('Content-type', 'application/json');

	switch(body.action){
		case "getMovies":
			db.movies.find({}, respond);
			break;
		case "addMovie":
			db.movies.insert({title: body.title}, respond);
			break;
		case "rateMovie":
			db.movies.update({title: body.title}, { $set: {rating: body.rating}},
			function(err, num) {
				respond(err, {  success: num + " records updated"});
			});
			break;
		default:
			respond('No action given');
	}
})
.listen(3000);