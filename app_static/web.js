var express = require("express");
var swig = require("swig");
var cons = require("consolidate");
var app = express();
app.use(express.logger());

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname);
app.use('/images', express.static(__dirname + "/images"));

app.get('/', function(request, response) {
		response.render('index.html', {
			title: "App"
		});
});
	
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
