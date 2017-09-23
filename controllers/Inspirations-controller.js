/*-----------------------------------------------------------------
	Controller :
	Inspirations Functions
-------------------------------------------------------------------*/
//var expressModule = require('../main-controller'); // Include main-controller.js file in this js and use it's modules

var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var path = require('path');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var rCats = require(__dirname +'/routes/categories');
var rTags = require(__dirname +'/routes/tags');

var bmImageDataArray = [];

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist
var ldbInspirations = new locallydb(path.join(__dirname, '../database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var ldbInspCatCollection = ldbInspirations.collection('inspirations-categories.json');
var ldbInspTagsCollection = ldbInspirations.collection('inspirations-tags.json');

var inspCtrlOpt, inspirationsControlls = {
	init : function(settings) {
		inspCtrlOpt = settings;
		var _this = this;
		
		/*---------------------------------------------
			Snippets Management
		-----------------------------------------------*/
		inspCtrlOpt.expressModule.post('/views/getURLDetails', function(req, res) {
			_this.getURLDetail(req, res);
		});
		
		// List All Inspirations
		inspCtrlOpt.expressModule.post('/views/listAllInspirations', function(req, res) {
			_this.listAllInspirations(req, res, inspCtrlOpt.db);
		});
		
		// List All Snippets
		inspCtrlOpt.expressModule.post('/views/listFilteredInspirations', function(req, res) {
			_this.listFilteredInspirations(req, res, inspCtrlOpt.db);
		});
		
		// Get Selected Snippet Detail
		inspCtrlOpt.expressModule.post('/views/getInspirationsDetail', function(req, res) {
			_this.getSingleInspirationsDetail(req, res, inspCtrlOpt.db);
		});
		
		// ADD or EDIT Snippet
		inspCtrlOpt.expressModule.post('/views/addEditInspirations', function (req, res) {
			_this.addEditInspirations(req, res, inspCtrlOpt.db);
		});
		
		// Get Snippet detail for editing
		inspCtrlOpt.expressModule.post('/views/editInspiration', function (req, res) {
			_this.getInspirationsToEdit(req, res, inspCtrlOpt.db);
		});
		
		// Delete Snippet
		inspCtrlOpt.expressModule.post('/views/deleteInspiration', function(req, res) {
			_this.deleteInspirations(req, res, inspCtrlOpt.db);
		});
		
		// Starred Inspirations
		inspCtrlOpt.expressModule.post('/views/starredInspirations', function(req, res) {
			_this.starredInspirations(req, res, inspCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		inspCtrlOpt.expressModule.get('/views/listInspCategories', function(req, res) {
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
			
			//console.log("router  : ==", inspCtrlOpt.expressModule, Movie, Movie(ldbInspCatCollection));
			//var ttt = Movie(ldbInspCatCollection);
			//ttt.get(req, res);
		});
		
		// Add New Category
		inspCtrlOpt.expressModule.post('/views/addInspCategory', function (req, res) {
			// Add Category
			rCats.addCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		// Edit Selected Category
		inspCtrlOpt.expressModule.post('/views/editInspCategory', function (req, res) {
			rCats.editCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		// Delete Selected Category
		inspCtrlOpt.expressModule.post('/views/deleteInspCategory', function (req, res) {
			rCats.deleteCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		/*---------------------------------------------
			Tags Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		inspCtrlOpt.expressModule.get('/views/listInspTags', function(req, res) {
			rTags.listAllTags(res, ldbInspTagsCollection);
		});
		
		inspCtrlOpt.expressModule.post('/views/addSingleInspTag', function(req, res) {
			rTags.addSingleTag(req, ldbInspTagsCollection);
			rTags.listAllTags(res, ldbInspTagsCollection);
		});
		
		// Edit Selected Tag
		inspCtrlOpt.expressModule.post('/views/editInspTag', function (req, res) {
			rTags.editTag(req, ldbInspTagsCollection);
			rTags.listAllTags(res, ldbInspTagsCollection);
		});
		
		// Delete Selected Tag
		inspCtrlOpt.expressModule.post('/views/deleteInspTag', function (req, res) {
			rTags.deleteTag(req, ldbInspTagsCollection);
			rTags.listAllTags(res, ldbInspTagsCollection);
		});
		
		/*---------------------------------------------
			Image Upload Functions
		-----------------------------------------------*/
		// Upload route.
		inspCtrlOpt.expressModule.post('/views/inspirationsUpload', inspCtrlOpt.formUploader, function(req, res) {
			var imageData = {};	
			bmImageDataArray.push(req.files.myfile.name);
			res.send({ ok: true, message: '** Image '+req.files.myfile.name+' is uploading...', images : bmImageDataArray });
			bmImageDataArray.length= 0;
			return false;	
		});
		
		inspCtrlOpt.expressModule.post('/views/saveInspImagesData', function(req, res) {
			_this.saveImagesData(req, res, inspCtrlOpt.db); // Snippet Controller
			
		});
		
	},
	
	saveImagesData : function(req, res, db) {
		console.log("saveImagesData Controller ==", req.body);
		
		db.find({_id : req.body._id},{ images : 1}, function(err, docs) {
			
			// First Remove already uploaded images to clean up disk space.
			if(docs[0].images && docs[0].images.length > 0) {
				for(var i = 0; i < docs[0].images.length; i++) {
					
					docs[0].images.forEach(function(filename) {
						console.log("Unlink Filename :", filename);
						if(filename && filename != "") {
							 if (fs.exists(path.join(__dirname , '../database/uploads/images/inspirations/') + filename)) {
							fs.unlink(path.join(__dirname , '../database/uploads/images/inspirations/') + filename);
							 }
						}
					});
				}
			}
			
			// Then update DB
			db.update({ _id : req.body._id }, { $set: {"images" : req.body.images}  }, {}, function (err, numReplaced) {
				if (err !== null) {
					console.log('post error', err);
					res.send({ ok: false, message: 'Error ::'+ err});
				}
				else {
					res.send({ ok: true, message: 'Database has been updated with new images ::'+ req.body.images});
				}
			});
			
		});
		
		bmImageDataArray.length= 0;
	},
	
	getURLDetail : function(req, res) {
		request(req.body.url, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				
				var title = $('title').text();
				var tags = $('meta[name=tags]').attr('content');
				var description = $('meta[name=description]').attr('content');
				var image = $('meta[property="og:image"]').attr('content');
				
				res.send({
					ok: true,
					result : "Getting URL details...",
					message: 'Success',
					title : title,
					tags : tags,
					image : image,
					description : description
				});
			}
		});
	},
	
	listAllInspirations : function(req, res, db) {
		var listAllCategories = ldbInspCatCollection.items;
		
		if(req.body.category == "all") {
			// Find all documents in the collection
			db.find({ }).sort({ "dateCreated": 1 }).exec(function (err, docs) {
				// Count all inspirations having given categories
				db.count({ }, function (err, count) {
					res.send({
						ok: true,
						categoryName : 'all',
						message: "Listing all inspirations",
						inspirations : docs,
						categories : listAllCategories,
						totalRecords : count
					});
				});
			});
		}
		else {
			// Find all documents in the collection
			db.find({ category : req.body.category }).sort({ "dateCreated": 1 }).exec(function (err, docs) {
				// Count all inspirations having given categories
				db.count({ category: req.body.category }, function (err, count) {
					// count equals to 3
					res.send({
						ok: true,
						categoryName : req.body.category,
						message: "Listing all inspirations of category : " + req.body.category,
						inspirations : docs,
						categories : listAllCategories,
						totalRecords : count
					});
				});
			});
		}		
	},
	
	listFilteredInspirations : function(req, res, db) {
		var filterObj = {};
		var filterBy = "category";
		
		if(req.body.filterBy !== undefined) {
			filterBy = req.body.filterBy;
		}
		else {
			filterBy = 'category';
		}
		
		var filterValue = new RegExp(req.body.filterValue, 'i');
		filterObj[filterBy] = {
			$regex : filterValue
		}
		
		// { title: { $regex: new RegExp(req.body.filterValue, 'i') } }
		// Using $regex with another operator
		db.find(filterObj, function (err, docs) {
			res.send({
				ok: true,
				categoryName : req.body.category,
				message: "Listing all tasks of category : " + req.body.category,
				inspirations : docs,
				tt : filterObj
			});
		});
	},
	
	addEditInspirations : function(req, res, db) {
		if(req.body.mode == "edit") {
			// Replace a document by another
			
			var editDataObj = {
				id : req.body.id,
				url : req.body.url,
				title: req.body.title,				
				category: req.body.category,
				categoryId : req.body.categoryId,
				description : req.body.description,
				tags : req.body.tags,
				note : req.body.note,
				dateModified : new Date(),
				mode : req.body.mode
			}
			
			// Check if Images data available in request
			if(req.body.images && req.body.images.length > 0) {
				editDataObj["images"] = req.body.images;
				
				// Check if imagePath available in Data object
				// This will save image from URL
				if(req.body.imagePath && req.body.imagePath != "") {
					editDataObj["imagePath"] = req.body.imagePath;
					
					// Save Image to Folder
					var new_location = path.join(__dirname , '../database/uploads/images/inspirations');
					
					utilityFns.saveImageFromURL(req.body.imagePath, new_location+'/'+req.body.images, function(){
						console.log('Image saved..');
					});
				}
			}
			else {
				editDataObj["images"] = [];
			}
			
			console.log("addEditInspirations-in", req.body);
			
			rTags.addTags(req, ldbInspTagsCollection); // Add Tags if not available in Database
			
			db.update({ _id : req.body.id }, { $set: editDataObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					db.find({ "_id" : req.body.id }, function (err, docs) {
						res.send({ ok: true, message: 'Inspirations has been updated successfuly.', numReplaced : numReplaced,  inspirations : docs });
					});
				}				
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			pp["comments"] = [];
			
			// Check if Images data available in request
			if(req.body.images && req.body.images.length > 0) {
				pp["images"] = req.body.images;
				
				// Check if imagePath available in Data object
				// This will save image from URL
				if(req.body.imagePath && req.body.imagePath != "") {
					
					// Save Image to Folder
					var new_location = path.join(__dirname , '../database/uploads/images/inspirations');
					
					utilityFns.saveImageFromURL(req.body.imagePath, new_location+'/'+req.body.images, function(){
						console.log('Image saved..');
					});
				}
			}
			else {
				pp["images"] = [];
			}
			
			console.log("addEditInspirations-in : ADD ::", req.body);
			
			rTags.addTags(req, ldbInspTagsCollection); // Add Tags if not available in Database
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					res.send({ ok: true, message: 'New bookmark has been added successfuly.', inspirations : newDoc });
				}
			});
		}
	},
	
	getSingleInspirationsDetail : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ "_id" : req.body._id }, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				res.send({ ok: true, message: 'Loading Data for Editing ...' , inspirations : docs});
			}
		});
	},
	
	deleteInspirations : function(req, res, db) {
		
		if(req.body.imageName && req.body.imageName != "") {
			utilityFns.deleteFile(path.join(__dirname , '../database/uploads/images/inspirations/') + req.body.imageName);
		}
		
		// Remove one document from the collection
		// options set to {} since the default for multi is false
		db.remove({ "_id": req.body._id }, {}, function (err, numRemoved) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
				console.log('post error', err);
			}
			else {
				res.send({ ok: true, message: 'Inspirations has been deleted successfuly.'});
				
				// Using a sparse unique index
				db.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
					if (err !== null) {
						
					}
					else {
						console.log("Indexing......");
					}
				});
			}
		});
	},
	
	starredInspirations : function(req, res, db) {
		db.update({ "_id" : req.body._id }, { $set: { isStarred: req.body.isStarred } }, function (err, numReplaced) {
			
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				if(req.body.isStarred == "true") {
					res.send({ ok: true, message: 'This bookmark has been added to your favourite list ...'});
				}
				else if(req.body.isStarred == "false") {
					res.send({ ok: true, message: 'This bookmark has been removed from your favourite list ...'});
				}
			}
		});
	}	
};

/* ======== */

var download = function(uri, filename, callback){
	/*
		request.head(uri, function(err, res, body){
		console.log('content-type:', res.headers['content-type']);
		console.log('content-length:', res.headers['content-length']);
		
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	*/
	request
	.get({
		url : uri,
		agentOptions: {
			//ca: fs.readFile(path.join(__dirname, '/ssl-certificates/DigiCertHighAssuranceEVRootCA.crt'), 'utf8')
		}	
	})
	.on('response', function(response) {
		console.log(response);
		console.log(response.statusCode) // 200
		console.log(response.headers['content-type']) // 'image/png'
	})
	.pipe(fs.createWriteStream(filename))
	
	/* request.get({url: uri, encoding: 'utf8'}, function (err, response, body) {
		console.log(response, body);
		fs.writeFile(filename, body, 'utf8', function(err) {
		if(err)
		console.log(err);
		else
		console.log("The file was saved!");
		}); 
	}); */
};

download('https://d13yacurqjgara.cloudfront.net/users/107759/screenshots/1896587/booking.png', 'google.png', function(){
	console.log('done');
});

// Export all the functions
module.exports = inspirationsControlls;	