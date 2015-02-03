var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = {};
var responder = require('./httpResponder');

var port = process.argv[2] || 3000;
var root = "http://localhost:" + port;


// Connect to an NeDB database
db.movies = new Datastore({filename: 'db/movies', autoload: true});

// Add an index
db.movies.ensureIndex({ fieldName: 'title', unique: true});


// Necessary for accessing POST data via req.body object
app.use(express.bodyParser());

// Catch-all route to set global values
app.use(function(req, res, next) {
	res.type('application/json');
	res.locals.respond = responder.setup(res);
	next();
});

// Routes
app.get('/', function(req, res) {
	res.send('The Api is working');
});

app.get('/movies', function(req, res) {
	db.movies.find({}, res.locals.respond);
});


app.post('/movies', function(req, res) {
	if(!req.body.title) {
		res.json(400, { message: "A title is required to create a new movie." });
		return;
	}
	db.movies.insert({title: req.body.title}, function(err, created) {
		if (err) {
			res.json(500, { error: err });
			return;
		}

		res.set('Location', root + '/movies/' + created._id);
		res.json(201, created);
	});
});



app.get('/movies/:id', function(req, res) {
	db.movies.findOne({_id: req.params.id}, function(err, result) {
		if(err) {
			res.json(500, {error: err});
			return;
		}

		if(!result) {
			res.json(404, { message: "We did not find a movie with id " + req.params.id });
			return;
		}

		res.json(200, result);

	});
});

app.put('/movies/:id', function(req, res) {
	db.movies.update({_id: req.params.id }, req.body, function(err, num) {
				res.locals.respond(err, {  success: num + " records updated"});
			});
});

app.delete('/movies/:id', function(req, res) {
	db.movies.remove({_id: req.params.id }, function(err, num) {
		if (err) {
			res.json(500, { error: err });
			return;
		}

		if (num === 0) {
			res.json(404, { message: "We did not find a movie with id " + req.params.id });
		}

		res.send(204);
	});
});

app.listen(port);