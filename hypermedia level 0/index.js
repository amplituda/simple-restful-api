var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = {};

db.movies = new Datastore({filename: 'db/movies', autoload: true});


app.use(express.bodyParser());


app.get('/', function(req, res) {
	res.send('The Api is working');
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
			db.movies.insert({tiltle: body.title}, respond);
			break;
		case "rateMovie":
			db.movies.update({tiltle: body.title}, { $set: {rating: body.rating}},
			function(err, num) {
				respond(err, {  success: num + " records updated"});
			});
			break;
		default:
			respond('No action given');
	}
})
.listen(3000);