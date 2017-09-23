var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var http = require('http');
var path = require('path');
var fs = require('fs');
var sass = require('sass');

var rCats = require(__dirname +'/routes/categories');
var rTags = require(__dirname +'/routes/tags');

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist
var dbCodepen = new locallydb(path.join(__dirname, '../database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var ldbCPTagsCollection = dbCodepen.collection('codepen-tags.json');
var ldbCPCatCollection = dbCodepen.collection('codepen-categories.json');


var codePenCtrlOpt, codePenControlls = {
	init : function(settings) {
		codePenCtrlOpt = settings;
		var _this = this;
		
		/*---------------------------------------------
			Tasks Management
		-----------------------------------------------*/
		
		// List all CodePens
		codePenCtrlOpt.expressModule.post('/views/listCodepens', function(req, res) {
			_this.listCodepens(req, res, codePenCtrlOpt.db);
		});
		
		// ADD or EDIT Codepen
		codePenCtrlOpt.expressModule.post('/views/addEditCodepen', function (req, res) {
			_this.addEditCodepen(req, res, codePenCtrlOpt.db);
		});
		
		// Get Selected CodePen Detail for Editing
		codePenCtrlOpt.expressModule.post('/views/getCodepenDetail', function(req, res) {
			_this.getSingleCodepenDetail(req, res, codePenCtrlOpt.db);
		});
		
		// Get Selected CodePen Detail for Editing
		codePenCtrlOpt.expressModule.post('/views/deleteCodepen', function(req, res) {
			_this.deleteCodepen(req, res, codePenCtrlOpt.db);
		});
		
		// Save Codepen Snippets
		codePenCtrlOpt.expressModule.post('/views/saveCodePen', function(req, res) {
			_this.saveCodePen(req, res);
		});
		
		codePenCtrlOpt.expressModule.post('/views/saveTempCodePens', function(req, res) {
			_this.saveTempCodePens(req, res);
		});
		
		codePenCtrlOpt.expressModule.post('/views/loadCodePen', function(req, res) {
			_this.loadCodePen(req, res);
		});
		
		// Download all external JS and CSS Libraries
		codePenCtrlOpt.expressModule.post('/views/downloadAllResources', function(req, res) {
			_this.downloadAllResources(req, res);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		codePenCtrlOpt.expressModule.get('/views/listCodepenCategories', function(req, res) {
			rCats.listAllCategories(res, codePenCtrlOpt.db, ldbCPCatCollection);
		});
		
		// Add New Category
		codePenCtrlOpt.expressModule.post('/views/addCodepenCategory', function (req, res) {
			// Add Category
			rCats.addCategory(req, ldbCPCatCollection);
			rCats.listAllCategories(res, codePenCtrlOpt.db, ldbCPCatCollection);
		});
		
		// Edit Selected Category
		codePenCtrlOpt.expressModule.post('/views/editCodepenCategory', function (req, res) {
			rCats.editCategory(req, ldbCPCatCollection);
			rCats.listAllCategories(res, codePenCtrlOpt.db, ldbCPCatCollection);
		});
		
		// Delete Selected Category
		codePenCtrlOpt.expressModule.post('/views/deleteCodepenCategory', function (req, res) {
			rCats.deleteCategory(req, ldbCPTagsCollection);
			rCats.listAllCategories(res, codePenCtrlOpt.db, ldbCPCatCollection);
		});
		
		/*---------------------------------------------
			Tags Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		codePenCtrlOpt.expressModule.get('/views/listCodepenTags', function(req, res) {
			rTags.listAllTags(res, ldbCPTagsCollection);
		});
		
		codePenCtrlOpt.expressModule.post('/views/addSingleCodepenTag', function(req, res) {
			rTags.addSingleTag(req, ldbCPTagsCollection);
			rTags.listAllTags(res, ldbCPTagsCollection);
		});
		
		// Edit Selected Tag
		codePenCtrlOpt.expressModule.post('/views/editCodepenTag', function (req, res) {
			rTags.editTag(req, ldbCPTagsCollection);
			rTags.listAllTags(res, ldbCPTagsCollection);
		});
		
		// Delete Selected Tag
		codePenCtrlOpt.expressModule.post('/views/deleteCodepenTag', function (req, res) {
			rTags.deleteTag(req, ldbCPTagsCollection);
			rTags.listAllTags(res, ldbCPTagsCollection);
		});
	},
	
	downloadAllResources : function(req, res) {
		// Save Image to Folder
		var new_location = path.join(__dirname , '../database/code-pans/offline-resources/');
		
		for(var i = 0; i < req.body.resources.length; i++) {
			
			for(var j =0; j < req.body.resources[i].items.length; j++) {
				
				console.log(req.body.resources[i].items)
				//var fileName = req.body.resources[i].items[j].url.split('/').pop();
				var fileName = req.body.resources[i].items[j].fileName;
				
				utilityFns.saveImageFromURL(req.body.resources[i].items[j].url + fileName, new_location + req.body.resources[i].items[j].fileName, function(){ 
					console.log('Downloading ....' + fileName);
					
				});
			}
		}
		res.send({ ok: false, message: 'All the Javascript and CSS Libraries are saved to disk.' });
	},
	
	addEditCodepen : function(req, res, db) {
		if(req.body.mode == "edit") {
			var editDataObj = {
				id : req.body.id,
				penName : req.body.penName,
				title : req.body.title,
				category: req.body.category,
				categoryId : req.body.categoryId,
				description : req.body.description,
				keywords : req.body.keywords,
				dateModified : new Date()
			}
			
			rTags.addTags(req, ldbCPTagsCollection); // Add Tags if not available in Database
			
			db.update({ _id : req.body.id }, { $set: editDataObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					
					res.send({ ok: true, message: 'CodePen Link has been updated successfuly.' });
					
				}				
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			
			rTags.addTags(req, ldbCPTagsCollection); // Add Tags if not available in Database
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					fs.writeFile(path.join(__dirname, '../database/code-pans/'+req.body.penName), "", function (err) { 
						if (err) throw err;
					});
					
					res.send({ ok: true, message: 'New codepen referance has been added successfuly.', pens : newDoc, fileName : req.body.penName });
				}
			});
		}
	},
	
	getSingleCodepenDetail : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ "_id" : req.body._id }, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				res.send({ ok: true, message: 'Data loading for Selected codepen ...' , pens : docs});
			}
		});
	},
	
	saveTempCodePens : function(req, res) {
		for(var i = 0; i < req.body.data.length; i++) {
			fs.writeFile(path.join(__dirname, '../database/code-pans/'+req.body.data[i].fileName), req.body.data[i].data, function (err) {
				
				if (err) throw err;
			});
		}
	},
	saveCodePen : function(req, res) {		
		fs.writeFile(path.join(__dirname, '../database/code-pans/'+req.body.fileName), req.body.data, function (err) {
			
			if (err) throw err;
			
			// Delete Temp files
			//fs.unlinkSync(path.join(__dirname, '../database/code-pans/temp.html'));
			//fs.unlinkSync(path.join(__dirname, '../database/code-pans/temp.css'));
			//fs.unlinkSync(path.join(__dirname, '../database/code-pans/temp.js'));
			
			res.send({ ok: true, message: 'code has been saved to html file'});
			
		});
	},
	loadCodePen : function(req, res) {
		var test = sass.render('body{background:blue; a{color:black;}}')
		
		fs.readFile(path.join(__dirname, '../database/code-pans/'+req.body.fileName),'utf8', function (err, data) {
			if (err) throw err;
			res.send({ ok: true, message: 'Getting Data of requested codepen...', data : data, sass : test});
		});
	},
	listCodepens : function(req, res, db) {
		
		console.log("listCodepens ctrl :", req.body);
		
		var listAllTags = ldbCPTagsCollection.items;
		var listAllCategories = ldbCPCatCollection.items;
		var result;
		
		var filterObj = {};
		var filterBy = "category";
		
		if(req.body.filterBy && req.body.filterBy !== undefined) {
			filterBy = req.body.filterBy;
		}
		else {
			filterBy = 'category';
		}
		
		var filterValue = new RegExp(req.body.filterValue, 'i');
		filterObj[filterBy] = {
			$regex : filterValue
		}
		
		db.find(filterObj, function (err, docs) {
			
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				// Count all snippets having given categories
				db.count({ }, function (err, count) {
					if (err !== null) {
						res.send({ ok: false, message: 'error while posting', error : err });
					}
					else {
						
						res.send({
							ok: true,
							categoryName : 'all',
							message: "Listing all Codepens by '"+ filterBy +"' : " + filterValue,
							pens : docs,
							tags : listAllTags,
							categories : listAllCategories,
							totalRecords : count
						});
					}
				});
			}
		});
	},
	
	deleteCodepen : function(req, res, db) {
		
		db.remove({ "_id": req.body._id }, {}, function (err, numRemoved) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				res.send({ ok: true, message: 'Codepen has been deleted successfuly.'});
				
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
	}
};

// Export all the functions
module.exports = codePenControlls;