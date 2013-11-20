var express = require("express");
var sf      = require("node-salesforce");
var Heroku  = require("heroku-client");
var fs      = require("fs");
var exec = require("child_process").exec;

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
       secret: "some string here"
	}));
});

app.get('/', function(request, response) {
  response.send(JSON.stringify('Dynosaur API is running'));
});

var oauth2 = new sf.OAuth2({
	clientId:     '3MVG98XJQQAccJQe8EPY3A12EcX61t7u9dCnqkVjqQnkLwyxRb3aSI7T2yBhAFUtTpYC7IMkpiRYGeHcXNk3D',
  clientSecret: '8019842437687888855',
  redirectUri : 'https://login.salesforce.com/services/oauth2/callback'
});

app.get('/oauth2/auth', function(request, response) {
  response.redirect(oauth2.getAuthorizationUrl({ 
			scope : 'api id web' 
		}));
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	var conn = new sf.Connection({
		oauth2 : {
			clientId:     '3MVG98XJQQAccJQe8EPY3A12EcX61t7u9dCnqkVjqQnkLwyxRb3aSI7T2yBhAFUtTpYC7IMkpiRYGeHcXNk3D',
			clientSecret: '8019842437687888855',
			redirectUri : 'https://login.salesforce.com/services/oauth2/callback'
		}
	});

	conn.login(username, password, function(err, userInfo) {
  	if (err) { 
			response.send(JSON.stringify({success:false}));
			console.error(err);
		}

		request.session.access_token = conn.accessToken;
		request.session.instance_url = conn.instanceUrl;

		console.log(request.session.access_token);

  	console.log("User ID: " + userInfo.id);
  	console.log("Org ID: " + userInfo.organizationId);
	
		response.send(JSON.stringify({success:true}));
	});

});

app.get('/logged_in', function(request, response) {
	response.send(JSON.stringify(!!request.session.access_token));
});

app.get('/contacts', function(request, response) {
	var conn = new sf.Connection({
  	instanceUrl : request.session.instance_url,
  	accessToken : request.session.access_token
	});

	conn.sobject("Contact")
  .find({ CreatedDate: sf.Date.YESTERDAY }, '*') // fields in asterisk, means wildcard.{ CreatedDate: sf.Date.TODAY },
  .execute(function(err, records) {

		console.log(err);


		var header = '<html>\n'
               + '<head>\n'
							 + '<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.css" />\n'
							 + '<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>\n'
							 + '<script src="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js"></script>\n'
							 + '</head>\n'
							 + '<body>\n';

		var body = '<ul data-role="listview">\n';
		for(var i = 0; i < Object.keys(records).length; i++) {
			body += '<li><a href="#">' + records[i].Name + '</a></li>\n';
		}

		var footer = '</ul>\n'
						   + '</body>\n'
							 + '</html>\n'

		var page = header + body + footer;

		exec('uuidgen', function(error, stdout, stderr) {

			var tempFolder = stdout.toString().trim();
			console.log(tempFolder);
			fs.mkdir(tempFolder, function(err) {

				fs.writeFile(tempFolder + '/index.html', page, function(err) {
					if(err) {
						throw err;
					}

					console.log("Creating");
					exec(__dirname + '/create_contacts.sh ' + tempFolder, function(error, stdout, stderr) {
						if(!!error) {
							console.log(error);
							response.send(JSON.stringify({success:false}));
							return;
						}

						var appUrl = ((stdout.toString().split('\n'))[1]).split('|')[0].trim();
						console.log(appUrl);

						response.send(JSON.stringify({success:true, url: appUrl}));
					});	
	  		});
			});
		});
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
