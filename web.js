var express = require("express");
var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/create', function(request, response) {
  var name = request.body.name;
  console.log("Creating app named: %s", name);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
