/*-----------------------------------------------------------------
	Controller :
	Snippets Functions
-------------------------------------------------------------------*/
//var expressModule = require('../main-controller'); // Include main-controller.js file in this js and use it's modules

var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var path = require('path');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var rCats = require(__dirname +'/routes/categories');
var rTags = require(__dirname +'/routes/tags');

var inspImageDataArray = [];

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist
var ldbInspirations = new locallydb(path.join(__dirname, '../views/database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var ldbInspCatCollection = ldbInspirations.collection('inspirations-categories.json');

var inspCtrlOpt, inspirationsControlls = {
	init : function(settings) {
		inspCtrlOpt = settings;
		var _this = this;
		
		/*---------------------------------------------
			Snippets Management
		-----------------------------------------------*/
		
		inspCtrlOpt.expressModule.post('/uploadImageFromURL', function(req, res) {
			_this.uploadImageFromURL(req, res, inspCtrlOpt.db);
		});
		
		// List All Bookmarks
		inspCtrlOpt.expressModule.post('/listAllInspirations', function(req, res) {
			_this.listAllInspirations(req, res, inspCtrlOpt.db);
		});
		
		// List All Snippets
		inspCtrlOpt.expressModule.post('/listFilteredBookmarks', function(req, res) {
			_this.listFilteredBookmarks(req, res, inspCtrlOpt.db);
		});
		
		// Get Selected Snippet Detail
		inspCtrlOpt.expressModule.post('/getBookmarkDetail', function(req, res) {
			_this.getSingleBookmarkDetail(req, res, inspCtrlOpt.db);
		});
		
		// ADD or EDIT Snippet
		inspCtrlOpt.expressModule.post('/addEditInspirations', function (req, res) {
			_this.addEditInspirations(req, res, inspCtrlOpt.db);
			inspImageDataArray.length= 0;
		});
		
		// Get Snippet detail for editing
		inspCtrlOpt.expressModule.post('/editBookmark', function (req, res) {
			_this.getBookmarkToEdit(req, res, inspCtrlOpt.db);
		});
		
		// Delete Snippet
		inspCtrlOpt.expressModule.post('/deleteBookmark', function(req, res) {
			_this.deleteBookmark(req, res, inspCtrlOpt.db);
		});
		
		// Starred Bookmark
		inspCtrlOpt.expressModule.post('/starredBookmark', function(req, res) {
			_this.starredBookmark(req, res, inspCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		inspCtrlOpt.expressModule.get('/listBMCategories', function(req, res) {
			//_this.listAllBMCategories(res, inspCtrlOpt.db);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		// Add New Category
		inspCtrlOpt.expressModule.post('/addBMCategory', function (req, res) {
			// Add Category
			//_this.addBMCategory(req);
			rCats.addCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		// Edit Selected Category
		inspCtrlOpt.expressModule.post('/editBMCategory', function (req, res) {
			//_this.editBMCategory(req);
			rCats.editCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		// Delete Selected Category
		inspCtrlOpt.expressModule.post('/deleteBMCategory', function (req, res) {
			//_this.deleteCategory(req);
			rCats.deleteCategory(req, ldbInspCatCollection);
			rCats.listAllCategories(res, inspCtrlOpt.db, ldbInspCatCollection);
		});
		
		/*---------------------------------------------
			Image Upload Functions
		-----------------------------------------------*/
		// Upload route.
		inspCtrlOpt.expressModule.post('/uploadInspirations', inspCtrlOpt.formUploader, function(req, res) {
			var imageData = {};
			inspImageDataArray.push(req.files.myfile.name);
			res.send({ ok: true, message: 'Images has been uploaded successfuly.', images : inspImageDataArray });
			//inspImageDataArray.length= 0;
			return false;
		});
		
		inspCtrlOpt.expressModule.post('/updateInspImagesData', function(req, res) {
			_this.saveImagesData(req, inspCtrlOpt.db); // Snippet Controller
			inspImageDataArray.length= 0;
		});
		
		inspCtrlOpt.expressModule.post('/removeInspImage', function(req, res) {
			_this.removeInspImageFromDB(req, res, inspCtrlOpt.db);
			inspImageDataArray.length= 0;
		});
		
	},
	
	saveImagesData : function(req, db) {
		console.log("req.body ====", req.body);
		for(var i = 0; i < req.body.images.length; i++) {
			var obj = {};
			obj["images"] = req.body.images[i];
			
			/* db.update({ _id : req.body.snippetId }, { $set: {"images" : req.body.images[i]}  }, {}, function (err, numReplaced) {
				if (err !== null) {
					console.log('post error', err);
				}
				else {
					console.log("Goood");
				}
			}); */
		}
	},
	
	removeInspImageFromDB : function(req, res, db) {
		db.update({ _id : req.body.snippetId }, { $pull: { images: req.body.imageName }  }, {}, function (err, numReplaced) {
			if (err !== null) {
				console.log('post error', err);
			}
			else {
				db.find({ "_id" : req.body.snippetId }, function (err, docs) {
					
					if (err !== null) {
						res.send({ ok: false, message: 'error while posting' });
					}
					else {
						res.send({ ok: true, message: 'Data loading for Selected snippet ...' , snippets : docs});
					}
				});
				
				//utilityFns.deleteFile(path.join(__dirname , '../views/database/uploads/images/bookmarks/') + req.body.imageName, callback);
			}
		});
		
	},
	
	
	uploadImageFromURL : function(req, res, db) {
		console.log("uploadImageFromURL..", req.body);
		
		if(req.body.mode == "add") {
			
		}
		else if(req.body.mode == "edit") {
			// Check if Images data available in request
			if(req.body.images && req.body.images != "") {
				// Check if imagePath available in Data object
				// This will save image from URL
				if(req.body.imagePath) {
					var new_location = path.join(__dirname , '../views/database/uploads/images/bookmarks');
					
					utilityFns.saveImageFromURL(req.body.imagePath, new_location+'/'+req.body.images, function(){
						console.log('Done downloading..');
					});
				}
			}
			else {
				
			}
			
			for(var i = 0; i < req.body.images.length; i++) {
				db.update({ _id : req.body.bmDBId }, { $set: {"images" : req.body.images[i]}  }, {}, function (err, numReplaced) {
					if (err !== null) {
						console.log('post error', err);
					}
					else {
						res.send({ ok: true, message: 'Image has been uploaded ...' , urlUploadImages : req.body });
					}
				});
			}
		}
	},
	
	listAllInspirations : function(req, res, db) {
		var listAllCategories = ldbInspCatCollection.items;
		
		if(req.body.category == "all") {
			// Find all documents in the collection
			db.find({ }).sort({ "dateCreated": 1 }).exec(function (err, docs) {
				// Count all snippets having given categories
				db.count({ }, function (err, count) {
					res.send({
						ok: true,
						categoryName : 'all',
						message: "Listing all snippets",
						bookmarks : docs,
						categories : listAllCategories,
						totalRecords : count
					});
				});
			});
		}
		else {
			// Find all documents in the collection
			db.find({ category : req.body.category }).sort({ "dateCreated": 1 }).exec(function (err, docs) {
				// Count all snippets having given categories
				db.count({ category: req.body.category }, function (err, count) {
					// count equals to 3
					res.send({
						ok: true,
						categoryName : req.body.category,
						message: "Listing all bookmarks of category : " + req.body.category,
						bookmarks : docs,
						categories : listAllCategories,
						totalRecords : count
					});
				});
			});
		}
	},
	
	listFilteredBookmarks : function(req, res, db) {
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
				bookmarks : docs,
				tt : filterObj
			});
		});
	},
	
	addEditInspirations : function(req, res, db) {
		if(req.body.mode == "edit") {
			// Replace a document by another
			console.log("addEditInspirations-in", req.body.mode, req.body.id);
			
			var editDataObj = {
				id : req.body.id,
				category: req.body.category,
				categoryId : req.body.categoryId,
				description : req.body.description,
				keywords : req.body.keywords,
				dateModified : new Date()
			}
			
			// Check if Images data available in request
			if(req.body.images && req.body.images != "") {
				editDataObj["images"] = req.body.images;
				
				// Check if imagePath available in Data object
				// This will save image from URL
				if(req.body.imagePath) {
					editDataObj["imagePath"] = req.body.imagePath;
					
					// Save Image to Folder
					var new_location = path.join(__dirname , '../views/database/uploads/images/bookmarks');
					
					utilityFns.saveImageFromURL(req.body.imagePath, new_location+'/'+req.body.images, function(){
						console.log('Image saved..');
					});
				}
			}
			else {
				editDataObj["images"] = [];
			}
			
			db.update({ _id : req.body.id }, { $set: editDataObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					
					res.send({ ok: true, message: 'Bookmark has been updated successfuly.' });
					
				}
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			
			
			// Check if Images data available in request
			if(req.body.images && req.body.images != "") {
				pp["images"] = req.body.images;
				
				// Check if imagePath available in Data object
				// This will save image from URL
				if(req.body.imagePath) {
					
					// Save Image to Folder
					var new_location = path.join(__dirname , '../views/database/uploads/images/bookmarks');
					
					utilityFns.saveImageFromURL(req.body.imagePath, new_location+'/'+req.body.images, function(){
						console.log('Image saved..');
					});
				}
			}
			else {
				pp["images"] = [];
			}
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					res.send({ ok: true, message: 'New bookmark has been added successfuly.', bookmarks : newDoc });
				}
			});
		}
	},
	
	getBookmarkToEdit : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ "_id" : req.body._id }, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				res.send({ ok: true, message: 'Loading Data for Editing ...' , snippet : docs});
			}
		});
	},
	
	deleteBookmark : function(req, res, db) {
		
		utilityFns.deleteFile(path.join(__dirname , '../views/database/uploads/images/bookmarks/') + req.body.imageName);
		
		// Remove one document from the collection
		// options set to {} since the default for multi is false
		db.remove({ "_id": req.body._id }, {}, function (err, numRemoved) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
				console.log('post error', err);
			}
			else {
				res.send({ ok: true, message: 'Bookmark has been deleted successfuly.'});
				
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
	
	starredBookmark : function(req, res, db) {
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
function countSnippetsByCategory(array_elements) {
	var temp = [];
	
	array_elements.sort();
	
	var current = null;
	var cnt = 0;
	
	for (var i = 0; i < array_elements.length; i++) {
		
		if (array_elements[i] != current) {
			if (cnt > 0) {
				//console.log(current + ' comes --> ' + cnt + ' times<br>');
				var tempObj = {};
				tempObj.cat = current;
				tempObj.count = cnt;
				temp.push(tempObj);
			}
			current = array_elements[i];
			cnt = 1;
		}
		else {
			cnt++;
		}
	}
	
	if (cnt > 0) {
		//console.log(current + ' comming --> ' + cnt + ' times');
		var tempObj = {};
		tempObj.cat = current;
		tempObj.count = cnt;
		temp.push(tempObj);
		
	}
	
	return temp;
}


// Export all the functions
module.exports = inspirationsControlls;