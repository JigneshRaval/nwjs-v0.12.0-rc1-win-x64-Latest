/*-----------------------------------------------------------------
	Controller :
	Snippets Functions
-------------------------------------------------------------------*/
var fs = require('fs');
var path = require('path');
var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var express = require('express');
var JSZip = require("jszip");

var rCats = require(__dirname +'/routes/categories');
var rTags = require(__dirname +'/routes/tags');
var _mainCtrlr = require(__dirname +'/common-controllers');

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist
var dbTags = new locallydb(path.join(__dirname, '../database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var tagsCollection = dbTags.collection('snip-tags.json');
var categoriesCollection = dbTags.collection('snip-categories.json');

var snipImageDataArray = [];

var snipCtrlOpt, snipControlls = {
	init : function(settings) {
		snipCtrlOpt = settings;
		var _this = this;
		
		_mainCtrlr.init({
			dbTags : tagsCollection, // Pass Tags Database
			dbCats : categoriesCollection // Pass Categories Database
		});
		/*---------------------------------------------
			Snippets Management
		-----------------------------------------------*/
		// List All Snippets ( Only for Testing )
		snipCtrlOpt.expressModule.post('/views/listSnippets2', function(req, res) {
			_mainCtrlr.listAllTest(req, res, snipCtrlOpt.db);
		});
		
		// List All Snippets
		snipCtrlOpt.expressModule.post('/views/listSnippets', function(req, res) {
			_mainCtrlr.listAll(req, res, snipCtrlOpt.db);
		});
		
		// Get Selected Snippet Detail
		snipCtrlOpt.expressModule.post('/views/getSnipDetail', function(req, res) {
			_mainCtrlr.getSingleRecordDetail(req, res, snipCtrlOpt.db);
		});
		
		// ADD or EDIT Snippet
		snipCtrlOpt.expressModule.post('/views/addSnippet', function (req, res) {
			_this.addEditSnippet(req, res, snipCtrlOpt.db);
		});		
		
		// Delete Snippet
		snipCtrlOpt.expressModule.post('/views/deleteSnippets', function(req, res) {
			_mainCtrlr.deleteRecord(req, res, snipCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Tags Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		snipCtrlOpt.expressModule.get('/views/listSnipTags', function(req, res) {
			rTags.listAllTags(res, tagsCollection);
		});
		
		snipCtrlOpt.expressModule.post('/views/addSingleSnipTag', function(req, res) {
			rTags.addSingleTag(req, tagsCollection);
			rTags.listAllTags(res, tagsCollection);
		});
		
		// Edit Selected Tag
		snipCtrlOpt.expressModule.post('/views/editSnipTag', function (req, res) {
			rTags.editTag(req, tagsCollection);
			rTags.listAllTags(res, tagsCollection);
		});
		
		// Delete Selected Tag
		snipCtrlOpt.expressModule.post('/views/deleteSnipTag', function (req, res) {
			rTags.deleteTag(req, tagsCollection);
			rTags.listAllTags(res, tagsCollection);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Categories
		snipCtrlOpt.expressModule.get('/views/listSnipCategories', function(req, res) {
			rCats.listAllCategories(res, snipCtrlOpt.db, categoriesCollection);
		});
		
		// Add New Category
		snipCtrlOpt.expressModule.post('/views/addSnipCategory', function (req, res) {
			rCats.addCategory(req, categoriesCollection);
			rCats.listAllCategories(res, snipCtrlOpt.db, categoriesCollection);
		});
		
		// Edit Selected Category
		snipCtrlOpt.expressModule.post('/views/editSnipCategory', function (req, res) {
			rCats.editCategory(req, categoriesCollection);
			rCats.listAllCategories(res, snipCtrlOpt.db, categoriesCollection);
		});
		
		// Delete Selected Category
		snipCtrlOpt.expressModule.post('/views/deleteSnipCategory', function (req, res) {
			rCats.deleteCategory(req, categoriesCollection);
			rCats.listAllCategories(res, snipCtrlOpt.db, categoriesCollection);
		});
		
		/*---------------------------------------------
			Comments Management
		-----------------------------------------------*/
		snipCtrlOpt.expressModule.post('/views/addEditSnippetComment', function (req, res) {
			_this.addEditComments(req, res, snipCtrlOpt.db)
		});
		
		snipCtrlOpt.expressModule.post('/views/editSnippetComment', function (req, res) {
			_this.getSingleCommentDetail(req, res, snipCtrlOpt.db);
		});
		
		snipCtrlOpt.expressModule.post('/views/deleteSnippetComment', function(req, res) {
			_this.deleteComment(req, res, snipCtrlOpt.db);
		});
		
		snipCtrlOpt.expressModule.post('/views/starredSnippet', function (req, res) {
			_mainCtrlr.markStarred(req, res, snipCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Image Upload Functions
		-----------------------------------------------*/
		// Upload route.
		snipCtrlOpt.expressModule.post('/views/snipUpload', snipCtrlOpt.formUploader, function(req, res) {
			var imageData = {};
			snipImageDataArray.push(req.files.myfile.name);
			res.send({ ok: true, message: '** Image '+req.files.myfile.name+' is uploading...', images : snipImageDataArray });
			snipImageDataArray.length= 0;
			
			return false;
		});
		
		snipCtrlOpt.expressModule.post('/views/saveSnipImagesData', function(req, res) {
			_this.saveImagesData(req, snipCtrlOpt.db); // Snippet Controller
			snipImageDataArray.length= 0;
		});
		
		snipCtrlOpt.expressModule.post('/views/removeSnipImage', function(req, res) {
			_this.removeImageFromDB(req, res, snipCtrlOpt.db);
			snipImageDataArray.length= 0;
		});
	},
	
	setUploadDir : function() {
		var destDirPath = "";
	},
	saveImagesData : function(req, db) {
		for(var i = 0; i < req.body.images.length; i++) {
			var obj = {};
			obj["images"] = req.body.images[i];
			
			db.update({ _id : req.body._id }, { $push: obj  }, {}, function (err, numReplaced) {
				if (err !== null) {
				}
				else {
				}
			});
		}
	},
	
	removeImageFromDB : function(req, res, db) {
		db.update({ _id : req.body._id }, { $pull: { images: req.body.images[0] }  }, {}, function (err, numReplaced) {
			if (err !== null) {
			}
			else {
				db.find({ "_id" : req.body._id }, function (err, docs) {
					
					if (err !== null) {
						res.send({ ok: false, message: 'error while posting' });
					}
					else {
						res.send({ ok: true, message: 'Removed selected image from DB and Disk ...' , snippets : docs});
					}
				});
				if(req.body.images && req.body.images.length > 0) {
					//utilityFns.deleteFile(path.join(dirname , '/views/database/uploads/images/snippets/') + req.body.images[0]);
					fs.unlink(path.join(__dirname , '../database/uploads/images/snippets/') + req.body.images[0]);
				}
			}
		});		
	},
	
	addEditSnippet : function(req, res, db) {
		if(req.body.mode == "edit") {
			// Replace a document by another
			var dateModified = new Date();
			
			var testObj = {
				title: req.body.title,
				id : req.body.id,
				refSite: req.body.refSite,
				category: req.body.category,
				categoryId : req.body.categoryId,
				codes : req.body.codes,
				description : req.body.description,
				tags : req.body.tags,
				note : req.body.note,
				dateModified : dateModified
			}
			
			if(req.body.articleImages && req.body.articleImages.length > 0) {
				for(var i = 0; i < req.body.articleImages.length; i++) {
					
					var fileName = req.body.articleImages[i].split('/').pop();
					
					var name = fileName.split('.')[0];
					var ext = fileName.split('.').pop();
					if(ext.indexOf('?') > -1) {
						ext = ext.split('?')[0];
					}
					if(ext === "jpg" || ext === "png" || ext === "gif" || ext === "jpeg") {
						/*if(ext.length > 3) {
							ext = ext.substr(0, 3);
						}*/
						var date = new Date();
						var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();
						
						var newName = name.replace(/\W+/g, '-').toLowerCase() + "_" + fullDate + "."+ ext;
						
						utilityFns.saveImageFromURL(req.body.articleImages[i], path.join(__dirname , '../database/uploads/images/article_images/') + newName, function(){
							
						});
					}
				}
			}
			
			db.update({ _id : req.body.id }, { $set: testObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					
				}
				else {
					// Add Tags
					//snipControlls.addTags(req);
					rTags.addTags(req, tagsCollection);
					res.send({ ok: true, message: 'Snippet has been updated successfuly.' });
					
					
					// Using a sparse unique index
					db.ensureIndex({ fieldName: 'dateCreated', unique: true, sparse: true }, function (err) {
						if (err !== null) {
							
						}
						else {
							
						}
					});
				}
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			pp["comments"] = [];
			pp["images"] = [];
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					
				}
				else {
					// Add Tags
					//snipControlls.addTags(req);
					rTags.addTags(req, tagsCollection);
					res.send({ ok: true, message: 'New snippet has been added successfuly.', snippets : newDoc });
				}
			});
		}
	},
	
	addEditComments : function(req, res, db) {
		if(req.body.mode == "edit") {
			// Replace a document by another
			
			var commentsObj = {
				snippetID : req.body.snippetID,
				commentId: req.body.commentId,
				description : req.body.description,
				author: req.body.author,
				authorImage : "",
				dateModified : new Date()
			};
			var commentArrayNo = req.body.commentId -1;
			
			db.find({ _id : req.body.snippetID}, { comments : 1, _id : 0}, function (err, docs) {
				// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
				}
				else {
					var commentData = "";
					
					for(var i in docs) {
						for(var j in docs[i].comments) {
							if(docs[i].comments[j].commentId == req.body.commentId) {
								var query = {};
								query["comments."+j+".commentId"] = req.body.commentId;
								
								var set = {};
								set['comments.' + j + '.author'] = req.body.author;
								set['comments.' + j + '.description'] = req.body.description;
								set['comments.' + j + '.dateModified'] = new Date();
								
								
								db.update(query, { $set: set }, {multi:true}, function (err, numReplaced) {
									
								});
							}
							
							commentData = docs[i].comments;
						}
					}
					
					
					db.find({ _id : req.body.snippetID} , function (err, docs) {
						res.send({ ok: true, message: 'comment has been updated successfully ...' , snippets : docs });
					});
				}
			});
			
			
			
		}
		else if(req.body.mode == "add") {
			
			var commentsObj = {
				snippetID : req.body.snippetID,
				commentId: req.body.commentId,
				description : req.body.description,
				author: req.body.author,
				authorImage : "",
				dateCreated : new Date()
			};
			
			db.update({ _id : req.body.snippetID }, { $push: { comments : commentsObj }  }, {}, function (err, numReplaced, newDoc) {
				// newDoc is the newly inserted document, including its _id
				// newDoc has no key called notToBeSaved since its value was undefined
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					
				}
				else {
					db.find({ _id : req.body.snippetID} , function (err, docs) {
						res.send({ ok: true, message: 'New comment has been added successfuly.', snippets : docs });
					});
				}
			});
		}
		
	},
	
	getSingleCommentDetail : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ "comments.snippetID" : req.body._id}, { comments : 1, _id : 0}, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				var commentData = "";
				
				for(var i in docs) {
					
					for(var j in docs[i].comments) {
						if(docs[i].comments[j].commentId == req.body.commentId) {
							commentData = docs[i].comments[j];
						}
						
					}
				}
				
				res.send({ ok: true, message: 'Loading Data for Editing ...' , comment : commentData });
			}
		});
	},
	
	deleteComment : function(req, res, db) {
		
		db.find({ _id : req.body._id} , function (err, docs) {
			
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				for(var i in docs) {
					
					for(var j in docs[i].comments) {
						if(docs[i].comments[j].commentId == req.body.commentId) {
							
							
							var tt = parseInt(j);
							var pp = {};
							pp['comments.'+j] = 1;
							
							db.update({ _id : req.body._id  }, { $unset: pp }, {}, function (err, numRemoved) {
								if (err !== null) {
								}
								else {
									
								}
							});
							
							db.update({ _id : req.body._id  }, { $pull : {"comments" : null} }, {}, function (err, numRemoved) {
								
							});
							
						}
						
					}
				}
				db.find({ _id : req.body._id} , function (err, docs) {
					res.send({ ok: true, message: 'Comment has been deleted successfuly.', snippets : docs });
				});
			}
		});
	},
}

function countSnippetsByCategory(array_elements) {
	var temp = [];
	
	array_elements.sort();
	
	var current = null;
	var cnt = 0;
	
	for (var i = 0; i < array_elements.length; i++) {
		
		if (array_elements[i] != current) {
			if (cnt > 0) {
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
		var tempObj = {};
		tempObj.cat = current;
		tempObj.count = cnt;
		temp.push(tempObj);
		
	}
	
	return temp;
}

// Export all the functions
module.exports = snipControlls;