var fs = require('fs');
var path = require('path');
var fsex = require('fs-extra');
var request = require('request');
var JSZip = require("jszip");


var fileOperations = {
	copyFilesToFolder : function(fromFolder, toFolder) {
		fsex.copy(fromFolder, toFolder, function(err) {
			if (err) {
				console.error(err);
			}
			else {
				
			}
		});
		//res.end(util.inspect({fields: fields, files: files.file}));
	},
	deleteFile : function(fileFolderPath) {
		fsex.remove(fileFolderPath, function(err) {
			if (err) return console.error(err)
			
			console.log("success!")
		})
		
		//fsex.removeSync('/home/jprichardson') //I just deleted my entire HOME directory. 
	},
	createDir : function(dirPath) {
		fsex.mkdirs(dirPath, function(err) {
			if (err) return console.error(err)
			console.log("success!")
		})
	},	
	saveImageFromURL : function(uri, filename, callback){
		request.head(uri, function(err, res, body){
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			var r = request(uri).pipe(fs.createWriteStream(filename));
			r.on('close', callback);
		});
	},
	listFilesRecursive : function(dir ,extArray) {		
		var results = [];
		var list = fs.readdirSync(dir);
		var filteredFiles = ""
		list.forEach(function(file) {
			file = dir + '/' + file;
			if(extArray && extArray.length > 0) {
				var fileName = file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf(".")); // File Name without file extension
				var fileExt = file.split('.').pop(); // Get only file extension
				for(var i = 0; i < extArray.length; i++) {
					if(fileExt == extArray[i]) {
						//var fileName = file.replace(/^.*[\\\/]/,'');
						filteredFiles = dir + '/' + fileName+"."+fileExt;
						
						var stat = fs.statSync(filteredFiles);
						
						if (stat && stat.isDirectory()){
							results = results.concat(fileOperations.listFilesRecursive(filteredFiles));
						}
						else {
							results.push(filteredFiles);
						}					
					}
				}
			}
			else {
				var stat = fs.statSync(file);
				
				if (stat && stat.isDirectory()){
					results = results.concat(fileOperations.listFilesRecursive(file));
				}
				else {
					results.push(file);
				}				
			}			
		});		
		
		return results
	},
	createDBBackup : function(backupName, extArray) {
		var zip = new JSZip();
		var files = fileOperations.listFilesRecursive(path.join(__dirname , '../views/database/'), extArray);
		
		function readForZip(files, fileName) {
			fs.readFile(files, 'utf8', function(err, data) {
				// the data is passed to the callback in the second argument
				zip.file(fileName, data);
			});
		}
		for(var i = 0;  i < files.length; i++) {
			var fileName = files[i].substring(files[i].lastIndexOf("/") + 1);
			console.log("Only File Name : ", fileName);
			readForZip(files[i], fileName);	
		}
		var backupDate = new Date();
		backupDate = (backupDate.getMonth() + 1) +"_" + backupDate.getDate() + "_"+ backupDate.getYear();
		// Due to Async Read/Write
		setTimeout(function() {
			var buffer = zip.generate({type:"nodebuffer"});
			fs.writeFile(backupName+"_db_"+backupDate+".zip", buffer, function(err) {
				if (err) throw err;
			});
		}, 1500);		
	}
};

module.exports = fileOperations;