/*-----------------------------------------------------------------
	Controller :
	Settings
-------------------------------------------------------------------*/
var dirname = process.cwd();
var path = require('path');
var fs = require('fs');

/*----------------------------------------------
    START :: Simple JSON Data Read and Write
------------------------------------------------*/
var appSettings = {
    settings : {}
};

var outputFilename = path.join(dirname, '/views/database/settings.json');

var settingsCtrlOpt, settingsControlls = {
	init : function(settings) {
		settingsCtrlOpt = settings;
		var _this = this;
		
		console.log(settingsCtrlOpt.expressModule.post);
		
		// Save Application Settings
		settingsCtrlOpt.expressModule.post('/saveSettings', function(req, res) {
		console.log(req, res);
			_this.saveSettings(req, res);
		});
		
		// Save Application Settings
		settingsCtrlOpt.expressModule.get('/applySettings', function(req, res) {
			_this.applySettings(req, res);
		});
	},
	saveSettings : function(req, res) {
		appSettings.settings['syntaxTheme'] = req.body.syntaxTheme;
		writeJSON(appSettings);
	},
	applySettings : function(req, res) {
		// Read JSON file
		var obj;
		fs.readFile(outputFilename, 'utf8', function (err, data) {
			if (err) throw err;
			obj = JSON.parse(data);
			console.log("obj", obj);
			res.send({ ok: true, message: 'Settings loadded successfuly...', settingsData : obj });
		});
	}
};

function writeJSON(dataObj) {
    // Write to JSON file
    fs.writeFile(outputFilename, JSON.stringify(dataObj, null, 4), function(err) {
        if(err) {
            console.log(err);
            } else {
            console.log("JSON saved to " + outputFilename);
		}
	});
}
/*----------------------------------------------
    END :: Simple JSON Data Read and Write
------------------------------------------------*/

// Export all the functions
module.exports = settingsCtrlOpt;
module.exports = settingsControlls;