var sass = require('node-sass');

exports.preprocess = function(req, res) {
	var lang = req.query.lang,
	code = req.query.css;
	if (lang === 'sass') {
		sass.render({
			data: code,
			success: function(css){
				res.jsonp({ "data" : css });
			},
			error: function(error) {
				res.jsonp({ "error" : error });
			},
			outputStyle: 'compressed'
		});
	}
	/* if (lang === 'less') {
		less.render(code, function (error, css) {
			if (error) {
				res.jsonp({ "error" : error });
				} else {
				res.jsonp({ "data" : css });
			}
		});
	} */
};