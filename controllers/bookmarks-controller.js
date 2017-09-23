/*-----------------------------------------------------------------
	Controller :
	Bookmarks Functions
-------------------------------------------------------------------*/
var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var path = require('path');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var rCats = require(__dirname +'/routes/categories');
var rTags = require(__dirname +'/routes/tags');
var _mainCtrlr = require(__dirname +'/common-controllers');

var bmImageDataArray = [];

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist
var ldbBookmarks = new locallydb(path.join(__dirname, '../database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var ldbBMCatCollection = ldbBookmarks.collection('bookmark-categories.json');
var ldbBMTagsCollection = ldbBookmarks.collection('bookmark-tags.json');

var bmCtrlOpt, bookmarkControlls = {
	bmUploadLocation : path.join(__dirname , '../database/uploads/images/bookmarks'), // Save Image to Folder
	init : function(settings) {
		bmCtrlOpt = settings;
		var _this = this;
		
		_mainCtrlr.init({
			dbTags : ldbBMTagsCollection, // Pass Tags Database
			dbCats : ldbBMCatCollection // Pass Categories Database
		});
		/*---------------------------------------------
			Snippets Management
		-----------------------------------------------*/
		bmCtrlOpt.expressModule.post('/views/getURLDetails', function(req, res) {
			_this.getURLDetail(req, res);
		});
		
		// List All Bookmarks
		bmCtrlOpt.expressModule.post('/views/listAllBookmarks', function(req, res) {
			_mainCtrlr.listAll(req, res, bmCtrlOpt.db);
		});
		
		// Get Selected Snippet Detail
		bmCtrlOpt.expressModule.post('/views/getBookmarkDetail', function(req, res) {
			_mainCtrlr.getSingleRecordDetail(req, res, bmCtrlOpt.db);
		});
		
		// ADD or EDIT Snippet
		bmCtrlOpt.expressModule.post('/views/addEditBookmark', function (req, res) {
			_this.addEditBookmark(req, res, bmCtrlOpt.db);
		});
		
		// Delete Snippet
		bmCtrlOpt.expressModule.post('/views/deleteBookmark', function(req, res) {
			_this.deleteBookmark(req, res, bmCtrlOpt.db);
		});
		
		// Starred Bookmark
		bmCtrlOpt.expressModule.post('/views/starredBookmark', function(req, res) {
			_mainCtrlr.markStarred(req, res, bmCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		bmCtrlOpt.expressModule.get('/views/listBMCategories', function(req, res) {
			rCats.listAllCategories(res, bmCtrlOpt.db, ldbBMCatCollection);
			
			//console.log("router  : ==", bmCtrlOpt.expressModule, Movie, Movie(ldbBMCatCollection));
			//var ttt = Movie(ldbBMCatCollection);
			//ttt.get(req, res);
		});
		
		// Add New Category
		bmCtrlOpt.expressModule.post('/views/addBMCategory', function (req, res) {
			// Add Category
			rCats.addCategory(req, ldbBMCatCollection);
			rCats.listAllCategories(res, bmCtrlOpt.db, ldbBMCatCollection);
		});
		
		// Edit Selected Category
		bmCtrlOpt.expressModule.post('/views/editBMCategory', function (req, res) {
			rCats.editCategory(req, ldbBMCatCollection);
			rCats.listAllCategories(res, bmCtrlOpt.db, ldbBMCatCollection);
		});
		
		// Delete Selected Category
		bmCtrlOpt.expressModule.post('/views/deleteBMCategory', function (req, res) {
			rCats.deleteCategory(req, ldbBMCatCollection);
			rCats.listAllCategories(res, bmCtrlOpt.db, ldbBMCatCollection);
		});
		
		/*---------------------------------------------
			Tags Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		bmCtrlOpt.expressModule.get('/views/listBMTags', function(req, res) {
			rTags.listAllTags(res, ldbBMTagsCollection);
		});
		
		bmCtrlOpt.expressModule.post('/views/addSingleBMTag', function(req, res) {
			rTags.addSingleTag(req, ldbBMTagsCollection);
			rTags.listAllTags(res, ldbBMTagsCollection);
		});
		
		// Edit Selected Tag
		bmCtrlOpt.expressModule.post('/views/editBMTag', function (req, res) {
			rTags.editTag(req, ldbBMTagsCollection);
			rTags.listAllTags(res, ldbBMTagsCollection);
		});
		
		// Delete Selected Tag
		bmCtrlOpt.expressModule.post('/views/deleteBMTag', function (req, res) {
			rTags.deleteTag(req, ldbBMTagsCollection);
			rTags.listAllTags(res, ldbBMTagsCollection);
		});
		
		/*---------------------------------------------
			Image Upload Functions
		-----------------------------------------------*/
		// Upload route.
		bmCtrlOpt.expressModule.post('/views/bookmarkUpload', bmCtrlOpt.formUploader, function(req, res) {
			var imageData = {};	
			bmImageDataArray.push(req.files.myfile.name);
			res.send({ ok: true, message: '** Image '+req.files.myfile.name+' is uploading...', images : bmImageDataArray });
			bmImageDataArray.length= 0;
			return false;	
		});
		
		bmCtrlOpt.expressModule.post('/views/saveBMImagesData', function(req, res) {
			_this.saveImagesData(req, res, bmCtrlOpt.db); // Snippet Controller
			
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
							if (fs.exists(path.join(__dirname , '../database/uploads/images/bookmarks/') + filename)) {
								fs.unlink(path.join(__dirname , '../database/uploads/images/bookmarks/') + filename);
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
		console.log("getURLDetail Ctrl : ", req.body);
		request(req.body.url, function (error, response, html) {
			
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				
				var title = $('title').text();
				var tags = $('meta[name=tags]').attr('content');
				
				var description = "";
				if($('meta[name=description]').length > 0) {
					description = $('meta[name=description]').attr('content');
				}
				else {
					description = $('meta[property=""og:title"]').attr('content');
				}
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
			else {
				console.log("Error in geting url details :", error, response);
			}
		});
	},
		
	addEditBookmark : function(req, res, db) {
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
				}
			}
			else {
				editDataObj["images"] = [];
			}
			
			rTags.addTags(req, ldbBMTagsCollection); // Add Tags if not available in Database
			
			db.update({ _id : req.body.id }, { $set: editDataObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting', error : err });
				}
				else {
					// Check if imagePath available in Data object
					// This will save image from URL
					if(req.body.imagePath && req.body.imagePath != "") {						
						// Save Image to Folder
						utilityFns.saveImageFromURL(req.body.imagePath, bookmarkControlls.bmUploadLocation+'/'+req.body.images, function(){
							console.log('Image saved..');
							db.find({ "_id" : req.body.id }, function (err, docs) {
								res.send({ ok: true, message: 'Bookmark has been updated successfuly.', numReplaced : numReplaced,  bookmarks : docs });
							});
						});
					}
					else {
						db.find({ "_id" : req.body.id }, function (err, docs) {
							res.send({ ok: true, message: 'Bookmark has been updated successfuly.', numReplaced : numReplaced,  bookmarks : docs });
						});
					}
				}				
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			pp["comments"] = [];
			
			// Check if Images data available in request
			if(req.body.images && req.body.images.length > 0) {
				pp["images"] = req.body.images;
			}
			else {
				pp["images"] = [];
			}
			
			
			rTags.addTags(req, ldbBMTagsCollection); // Add Tags if not available in Database
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting', error : err });
				}
				else {
					// Check if imagePath available in Data object
					// This will save image from URL
					if(req.body.imagePath && req.body.imagePath != "") {
						utilityFns.saveImageFromURL(req.body.imagePath, bookmarkControlls.bmUploadLocation +'/'+req.body.images, function(){
							console.log('Image saved..');
							res.send({ ok: true, message: 'New bookmark has been added successfuly.', bookmarks : newDoc });
						});
					}
					else {
						res.send({ ok: true, message: 'New bookmark has been added successfuly.', bookmarks : newDoc });
					}
				}
			});
		}
	},
	
	deleteBookmark : function(req, res, db) {
		
		if(req.body.imageName && req.body.imageName != "") {
			utilityFns.deleteFile(path.join(__dirname , '../database/uploads/images/bookmarks/') + req.body.imageName);
		}
		
		_mainCtrlr.deleteRecord(req, res, db);
	
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
		//console.log(response);
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
module.exports = bookmarkControlls;	