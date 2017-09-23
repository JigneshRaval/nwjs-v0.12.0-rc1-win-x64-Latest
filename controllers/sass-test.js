var fs = require('fs');

var sass = require('node-sass');
var sassInfo = sass.info();



var sassCtrlOpt, sassControlls = {
	init : function(settings) {
		sassCtrlOpt = settings;
		var _this = this;
		/*---------------------------------------------
			Snippets Management
		-----------------------------------------------*/
		// List All Snippets
		sassCtrlOpt.expressModule.post('/views/compileSASS', function(req, res) {
			_this.compileSASS(req, res);
		});
	},
	compileSASS : function(req, res) {
		var compiledCode = sass.renderSync({ data: req.body.code, outputStyle : "nested" }).css;
		res.send({ result: "ok", sass : compiledCode });
		
	}
};

// Export all the functions
module.exports = sassControlls;

/*
	console.log(__dirname+ '/scss');
	
	expressModule.app.use(
	sass.middleware({
	src: __dirname + '/scss' , //where the sass files are 
	dest: __dirname +'/compiled' , //where css should go
	debug: true, // obvious
	outputStyle: 'compressed'
	})
	);
*/