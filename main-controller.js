var dirname = process.cwd();
var test = process.mainModule;

var http = require('http');
var express = require('express');
var path    = require('path');
var fs = require('fs');
//var util = require('util');
var multer  = require('multer');
var stats = {};
//var request = require('request');
//var cheerio = require('cheerio');
var Datastore = require('nedb');
var compress = require('compression');

var gui = global.window.nwDispatcher.requireNwGui();
var gui = global.window.nwDispatcher.requireNwGui();
var win = gui.Window.get();
//win.maximize();
//var rapi = require(path.join(dirname, '/controllers/routes/scss'));

var db = {
	items: new Datastore({ filename: path.join(dirname, '/database/snippets.db'), autoload: true })
};

/*
	* body-parser is a piece of express middleware that
	*   reads a form's input and stores it as a javascript
	*   object accessible through `req.body`
	*
	* 'body-parser' must be installed (via `npm install --save body-parser`)
	* For more info see: https://github.com/expressjs/body-parser
*/

var bodyParser = require('body-parser');

// create our app
var app = express();
app.use(compress());
app.set('port', process.env.PORT || 3000);
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false })); // to support URL-encoded bodies
app.use(bodyParser.json({limit: '50mb'})); // to support JSON-encoded bodies


app.use(express.static(path.join(dirname, '/'), { maxAge: 10000000 }));
app.use('/views', function(req, res, next) {
  next();
});
// API Routes
//app.get('/api/jshint', api.jshint);
//app.get('/api/preprocess', rapi.preprocess);

app.get('/api', function (req, res) {
	res.send('API is running');
});
// get an instance of router

// app.get('/', function (req, res) {
// 	res.sendfile('snippets.html');
// });

//module.exports.dirname = dirname;
// Exported Module from snippets-controller.js file
//var misc = require(__dirname +'/controllers/snippets-controller');
//console.log("Adding %d to 10 gives us %d", misc.x, misc.addX(10));

/*=============================================*/
var snipMulter = multer({
	dest: path.join(dirname , '/database/uploads/images/snippets/'),
	rename: function (fieldname, filename) {
		var date = new Date();

		var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();

		return filename.replace(/\W+/g, '-').toLowerCase() + "_" + fullDate;
	},
	onFileUploadComplete: function (file) {

	}
});

var bmMulter = multer({
	dest: path.join(dirname , '/database/uploads/images/bookmarks/'),
	rename: function (fieldname, filename) {
		var date = new Date();
		var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();
		return filename.replace(/\W+/g, '-').toLowerCase() + "_" + fullDate;
	},
	onFileUploadComplete: function (file) {
	}
});

var inspMulter = multer({
	dest: path.join(dirname , '/database/uploads/images/inspirations/'),
	rename: function (fieldname, filename) {
		var date = new Date();
		var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();
		return filename.replace(/[_\W\s]+/g, '_').toLowerCase() + "_" + fullDate;
	},
	onFileUploadComplete: function (file) {
	}
});

var settingsControlls = require(path.join(dirname +'/controllers/settings-controller'));
var snipControlls = require(path.join(dirname +'/controllers/snippets-controller'));
var bookmarkControlls = require(path.join(dirname +'/controllers/bookmarks-controller'));
var tasksControlls = require(path.join(dirname +'/controllers/tasks-controller'));
//var inspirationsControlls = require(path.join(dirname +'/controllers/Inspirations-controller'));
//var webkitWinControlls = require(path.join(dirname +'/controllers/node-webkit-fn'));
//var codePenControlls = require(path.join(dirname +'/controllers/code-pen-controller'));
//var sassControlls = require(path.join(dirname +'/controllers/sass-test'));
/*-----------------------------------------------------------------
	http :
	Github :

	NEDB : Persistent datastore ( like SQLite ) with manual loading
-------------------------------------------------------------------*/
//var gui = window.require('nw.gui');
/*
	var gui = global.window.nwDispatcher.requireNwGui();;
	gui.Window.get().minimize();
*/
/*
	var gui = window.require('nw.gui').Window.get();
	console.log("GUI", gui);
*/
/*
	webkitWinControlls.init({
	expressModule : app,
	gui : gui,
	win : win
}); */
/*
var codepens_db = new Datastore({
	filename : path.join(dirname, '/database/codepens_db.db'), autoload: true
});

codePenControlls.init({
	db : codepens_db,
	expressModule : app
});

sassControlls.init({
	expressModule : app
});
*/
settingsControlls.init({
	expressModule : app
});

/*---------------------------------------------
	Snippets Management
-----------------------------------------------*/
snipControlls.init({
	db : db.items,
	expressModule : app,
	formUploader : snipMulter
});

/*---------------------------------------------
	Bookmarks Management
-----------------------------------------------*/
var bookmarks_db = new Datastore({
	filename : path.join(dirname, '/database/bookmarks.db'), autoload: true
});

bookmarkControlls.init({
	db : bookmarks_db,
	expressModule : app,
	formUploader : bmMulter
});

/*---------------------------------------------
	Tasks Management
-----------------------------------------------*/
var tasks_db = new Datastore({
	filename : path.join(dirname, '/database/tasks.db'), autoload: true
});

tasksControlls.init({
	db : tasks_db,
	expressModule : app,
	formUploader : bmMulter
});

/*---------------------------------------------
	Inspirations Management
-----------------------------------------------*/
/*
var insp_db = new Datastore({
	filename : path.join(dirname, '/database/inspirations.db'), autoload: true
});

inspirationsControlls.init({
	db : insp_db,
	expressModule : app,
	formUploader : inspMulter
});
*/
// Start Server
http.createServer(app).listen(app.get('port'), function(){
	if (window.location.href.indexOf('localhost') < 0) {
		//window.location = 'http://localhost:' + app.get('port');
	}
});
