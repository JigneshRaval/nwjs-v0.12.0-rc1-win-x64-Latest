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
var _mainCtrlr = require(__dirname +'/common-controllers');

var bmImageDataArray = [];

/*-----------------------------------------------------------------
	http://wamalaka.com/locallydb/
	Github : https://github.com/btwael/locallydb
	
	LocallyDB Example ( JSON Database )
-------------------------------------------------------------------*/
// load locallydb
var locallydb = require('locallydb');
var counts = null;
// load the database (folder) in './mydb', will be created if doesn't exist
var ldbTasks = new locallydb(path.join(__dirname, '../database'));

// load the collection (file) in './mydb/monsters', will be created if doesn't exist
var ldbTasksTagsCollection = ldbTasks.collection('tasks-tags.json');
var ldbTasksCatsCollection = ldbTasks.collection('tasks-categories.json');

var tasksCtrlOpt, todoControlls = {
	init : function(settings) {
		tasksCtrlOpt = settings;
		var _this = this;
		
		_mainCtrlr.init({
			dbTags : ldbTasksTagsCollection, // Pass Tags Database
			dbCats : ldbTasksCatsCollection // Pass Categories Database
		});
		
		/*---------------------------------------------
			Tasks Management
		-----------------------------------------------*/
		// List All Snippets
		tasksCtrlOpt.expressModule.get('/views/getTaskStats', function(req, res) {
			_this.getCount(res, tasksCtrlOpt.db);
		});
		
		// List All Snippets
		tasksCtrlOpt.expressModule.post('/views/listAllTasks', function(req, res) {
			//_this.listAllTasks(req, res, tasksCtrlOpt.db);
			_mainCtrlr.listAll(req, res, tasksCtrlOpt.db);
		});
		
		// List All Snippets
		tasksCtrlOpt.expressModule.post('/views/listFilteredTasks', function(req, res) {
			_this.listFilteredTasks(req, res, tasksCtrlOpt.db);
		});
		
		// List All Snippets
		tasksCtrlOpt.expressModule.post('/views/listArchivedTasks', function(req, res) {
			_this.listArchivedTasks(req, res, tasksCtrlOpt.db);
		});
		
		// ADD or EDIT Snippet
		tasksCtrlOpt.expressModule.post('/views/addEditTask', function (req, res) {
			_this.addEditTask(req, res, tasksCtrlOpt.db);
		});
		
		// Get Selected Snippet Detail
		tasksCtrlOpt.expressModule.post('/views/getTaskDetailToEdit', function(req, res) {
			//_this.getTaskDetailToEdit(req, res, tasksCtrlOpt.db);
			_mainCtrlr.getSingleRecordDetail(req, res, tasksCtrlOpt.db);
		});
		
		// Get Snippet detail for editing
		tasksCtrlOpt.expressModule.post('/views/setReminder', function (req, res) {
			_this.setReminder(req, res, tasksCtrlOpt.db);
		});
		
		// Delete Snippet
		tasksCtrlOpt.expressModule.post('/views/deleteTask', function(req, res) {
			//_this.deleteTask(req, res, tasksCtrlOpt.db);
			_mainCtrlr.deleteRecord(req, res, tasksCtrlOpt.db);
		});
		
		// Delete Snippet
		tasksCtrlOpt.expressModule.post('/views/archiveTask', function(req, res) {
			_this.archiveTask(req, res, tasksCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Sub Tasks Management
		-----------------------------------------------*/
		// Add Sub Task
		tasksCtrlOpt.expressModule.post('/views/addSubTask', function(req, res) {
			_this.addSubTask(req, res, tasksCtrlOpt.db);
		});
		
		// Add Bulk Sub Task
		tasksCtrlOpt.expressModule.post('/views/addBulkSubTask', function(req, res) {
			_this.addBulkSubTask(req, res, tasksCtrlOpt.db);
		});
		
		// Edit Sub Task
		tasksCtrlOpt.expressModule.post('/views/saveSingleSubTask', function(req, res) {
			_this.saveSingleSubTask(req, res, tasksCtrlOpt.db);
		});
		
		// Delete Sub Task
		tasksCtrlOpt.expressModule.post('/views/deleteSubTask', function(req, res) {
			_this.deleteSubTask(req, res, tasksCtrlOpt.db);
		});
		
		// Archived Sub Task
		tasksCtrlOpt.expressModule.post('/views/archiveSubTask', function(req, res) {
			_this.archiveSubTask(req, res, tasksCtrlOpt.db);
		});
		
		/*---------------------------------------------
			Categories Management
		-----------------------------------------------*/
		// List All Categories
		tasksCtrlOpt.expressModule.get('/views/listTaskCategories', function(req, res) {
			rCats.listAllCategories(res, tasksCtrlOpt.db, ldbTasksCatsCollection);
		});
		
		// Add New Category
		tasksCtrlOpt.expressModule.post('/views/addTaskCategory', function (req, res) {
			rCats.addCategory(req, ldbTasksCatsCollection);
			rCats.listAllCategories(res, tasksCtrlOpt.db, ldbTasksCatsCollection);
		});
		
		// Edit Selected Category
		tasksCtrlOpt.expressModule.post('/views/editTaskCategory', function (req, res) {
			rCats.editCategory(req, ldbTasksCatsCollection);
			rCats.listAllCategories(res, tasksCtrlOpt.db, ldbTasksCatsCollection);
		});
		
		// Delete Selected Category
		tasksCtrlOpt.expressModule.post('/views/deleteTaskCategory', function (req, res) {
			rCats.deleteCategory(req, ldbTasksCatsCollection);
			rCats.listAllCategories(res, tasksCtrlOpt.db, ldbTasksCatsCollection);
		});
		
		
		/*---------------------------------------------
			Tags Management
		-----------------------------------------------*/
		// List All Snippets, Tags and Categories
		tasksCtrlOpt.expressModule.get('/views/listTaskTags', function(req, res) {
			rTags.listAllTags(res, ldbTasksTagsCollection);
		});
		
		tasksCtrlOpt.expressModule.post('/views/addSingleTaskTag', function(req, res) {
			rTags.addSingleTag(req, ldbTasksTagsCollection);
			rTags.listAllTags(res, ldbTasksTagsCollection);
		});
		
		// Edit Selected Tag
		tasksCtrlOpt.expressModule.post('/views/editTaskTag', function (req, res) {
			rTags.editTag(req, ldbTasksTagsCollection);
			rTags.listAllTags(res, ldbTasksTagsCollection);
		});
		
		// Delete Selected Tag
		tasksCtrlOpt.expressModule.post('/views/deleteTaskTag', function (req, res) {
			rTags.deleteTag(req, ldbTasksTagsCollection);
			rTags.listAllTags(res, ldbTasksTagsCollection);
		});
		
		/*---------------------------------------------
			Image Upload Functions
		-----------------------------------------------*/
		// Upload route.
		tasksCtrlOpt.expressModule.post('/views/bookmarkUpload', tasksCtrlOpt.formUploader, function(req, res) {
			var imageData = {};
			bmImageDataArray.push(req.files.myfile.name);
			res.send({ ok: true, message: 'Snippet has been updated successfuly.', images : bmImageDataArray });
			return false;
		});
		
		tasksCtrlOpt.expressModule.post('/views/updateBMImagesData', function(req, res) {
			_this.saveImagesData(req, tasksCtrlOpt.db); // Snippet Controller
			bmImageDataArray.length= 0;
		});
		
		tasksCtrlOpt.expressModule.post('/views/removeImage', function(req, res) {
			_this.removeImageFromDB(req, res, tasksCtrlOpt.db);
			bmImageDataArray.length= 0;
		});
	},
	
	saveImagesData : function(req, db) {
		console.log("req.body ====", req.body);
		for(var i = 0; i < req.body.images.length; i++) {
			var obj = {};
			obj["images"] = req.body.images[i];
			
			db.update({ _id : req.body.snippetId }, { $set: {"images" : req.body.images[i]}  }, {}, function (err, numReplaced) {
				if (err !== null) {
					console.log('post error', err);
				}
				else {
					console.log("Goood");
				}
			});
		}
	},
	
	removeImageFromDB : function(req, res, db) {
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
				
				//utilityFns.deleteFile(path.join(__dirname , '../database/uploads/images/bookmarks/') + req.body.imageName, callback);
			}
		});
		
	},
	
	listAllTasks : function(req, res, db) {
		var allCategories = ldbTasksCatsCollection.items;
		
		
		if(req.body.category == "all") {
			// Find all documents in the collection
			db.find({ archived: req.body.archived }).sort({ "priority": -1 }).exec(function (err, docs) {
				// Count all snippets having given categories
				db.count({ }, function (err, count) {
					//var groupedTasks;
					var resObj = {
						ok: true,
						categoryName : 'all',
						message: "Listing all Tasks",
						tasks : docs,
						tasksGroup : groupedTasks,
						categories : allCategories,
						totalRecords : count
					};
					
					if(req.body.groupBy && req.body.groupBy != "") {
						var groupedTasks = groupRecordsBy(docs, req.body.groupBy);
						resObj["tasksGroup"] = groupedTasks;
						
					}
					else {
						
					}
					
					res.send(resObj);
					
				});
			});
		}
		else {
			// Find all documents in the collection
			db.find({ category : req.body.category, archived: req.body.archived }).sort({ "priority": -1 }).exec(function (err, docs) {
				// Count all snippets having given categories
				db.count({ category: req.body.category }, function (err, count) {
					// count equals to 3
					var groupedTasks = groupRecordsBy(docs);
					
					res.send({
						ok: true,
						categoryName : req.body.category,
						message: "Listing all tasks of category : " + req.body.category,
						tasks : docs,
						tasksGroup : groupedTasks,
						categories : allCategories,
						totalRecords : count
					});
				});
			});
		}
		
	},
	listArchivedTasks : function(req, res, db) {
		db.find({ archived: req.body.archived })
		.sort({ "priority": -1 })
		.exec(function (err, docs) {
			// Count all snippets having given categories
			db.count({ }, function (err, count) {
				
				var groupedTasks = groupRecordsBy(docs);
				
				res.send({
					ok: true,
					categoryName : 'all',
					message: "Listing all Archived Tasks",
					tasks : docs,
					tasksGroup : groupedTasks,
					totalRecords : count
				});
			});
		});
	},
	listFilteredTasks : function(req, res, db) {
		var filterObj = {};
		var filterBy = "title";
		var archived = req.body.archived;
		
		if(req.body.filterBy !== undefined) {
			filterBy = req.body.filterBy;
		}
		else {
			filterBy = 'title';
		}
		
		var filterValue = new RegExp(req.body.filterValue, 'i');
		filterObj[filterBy] = {
			$regex : filterValue
		}
		
		// { title: { $regex: new RegExp(req.body.filterValue, 'i') } }
		// Using $regex with another operator
		db.find(filterObj, function (err, docs) {
			
			var groupedTasks = groupRecordsBy(docs);
			
			res.send({
				ok: true,
				categoryName : req.body.category,
				message: "Listing all filtered tasks of category : " + req.body.category,
				tasks : docs,
				tasksGroup : groupedTasks,
				filters : filterObj
			});
		});
		
	},
	
	addEditTask : function(req, res, db) {
		
		
		if(req.body.mode == "edit") {
			// Replace a document by another
			console.log(req.body.mode, req.body.id);
			
			var testObj = {
				id : req.body.id,
				title: req.body.title,
				category: req.body.category,
				categoryId : req.body.categoryId,
				priority : req.body.priority,
				tags : req.body.tags,
				description : req.body.description,
				comments : req.body.comments,
				note : req.body.note,
				startDate : req.body.startDate,
				dueDate : req.body.dueDate,
				dateModified : new Date(),
				assignedTo : req.body.assignedTo,
				remindMe : req.body.remindMe,
				taskStatus : req.body.taskStatus,
				taskProgress : req.body.taskProgress,
				estimatedTime : req.body.estimatedTime,
				mode : req.body.mode
			}
			
			
			db.update({ _id : req.body.id }, { $set: testObj  }, {}, function (err, numReplaced) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					res.send({ ok: true, message: 'Task has been updated successfuly.'});
					
					// Using a sparse unique index
					db.ensureIndex({ fieldName: 'dateCreated', unique: true, sparse: true }, function (err) {
						if (err !== null) {
							
						}
						else {
							console.log("Indexing Tasks database ......");
						}
					});
				}
			});
		}
		else if(req.body.mode == "add") {
			var pp = req.body;
			pp["comments"] = [];
			pp["subTasks"] = [];
			pp["mode"] = req.body.mode;
			
			db.insert(pp, function (err, newDoc) {   // Callback is optional
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting' });
					console.log('post error', err);
				}
				else {
					res.send({ ok: true, message: 'New Task has been added successfuly.', tasks : newDoc });
				}
			});
		}
	},
	
	getTaskDetailToEdit : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ "_id" : req.body._id }, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				res.send({ ok: true, message: 'Loading Task Data for Editing ...' , task : docs});
			}
		});
	},
	
	setReminder : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.update({ "_id" : req.body._id }, { $set: {remindMe : req.body.remindMe }  }, {}, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				res.send({ ok: true, message: 'Reminder has been set successfuly ...' });
			}
		});
	},
	
	deleteTask : function(req, res, db) {
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
	
	archiveTask : function(req, res, db) {
		db.update({ _id : req.body._id }, { $set: { "archived" : req.body.archived }  }, {}, function (err, numReplaced) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
				console.log('post error', err);
			}
			else {
				res.send({ ok: true, message: 'Task has been archived.' });
			}
		});
	},
	// Sub Tasks Module Functions
	
	addSubTask : function(req, res, db) {
		var newSubTaskID = 0;
		var obj = {
			title : req.body.title,
			dateCompleted : new Date(),
			dueDate : req.body.dueDate,
			status : req.body.status
		};
		
		// 1. First update all Sub Task ID and Serialize it
		// 2. Then Add new Sub Task by adding +1 to that serialization using $push
		// 3. Find again all that main task to update UI
		db.find({ _id : req.body._id}, { subTasks : 1}, function (err, docs) {
			
			for(var i = 0; i < docs[0].subTasks.length; i++) {
				// Update all Sub Tasks ID
				var idObj = {};
				idObj["subTasks."+i+".id"] = i;
				db.update({ _id : req.body._id  }, { $set: idObj }, {}, function (err, numRemoved) {
					
				});
				newSubTaskID = i;
			}
			
			obj["id"] = newSubTaskID + 1;
			
			db.update({ _id : req.body._id }, { $push: { subTasks : obj }  }, {}, function (err, numReplaced, newDoc) {
				if (err !== null) {
					res.send({ ok: false, message: 'error while posting', error : err });
				}
				else {
					// Update Task Overall Progress
					updateTaskProgress(db, req.body._id, function() {
						db.find({ _id : req.body._id} , function (err, docs) {
							res.send({ ok: true, message: 'New Sub Task has been added successfuly.', tasks : docs });
						});
					});
					
					
					
				}
			});
		});
	},
	
	addBulkSubTask : function(req, res, db) {
		var newSubTaskID = 0;
		
		var subTaskArray = req.body.subTaskArr;
		
		// 1. First update all Sub Task ID and Serialize it
		// 2. Then Add new Sub Task by adding +1 to that serialization using $push
		// 3. Find again all that main task to update UI
		db.find({ _id : req.body._id}, { subTasks : 1}, function (err, docs) {
			
			if(docs[0].subTasks && docs[0].subTasks.length > 0) {
				for(var i = 0; i < docs[0].subTasks.length; i++) {
					// Update all Sub Tasks ID
					var idObj = {};
					idObj["subTasks."+i+".id"] = i;
					db.update({ _id : req.body._id  }, { $set: idObj }, {}, function (err, numRemoved) {
						
					});
					newSubTaskID = i;
				}
			}
			else {
				newSubTaskID = 0;
			}
			
			for(var i =0; i < subTaskArray.length; i++) {
				var obj = {
					title : subTaskArray[i].title,
					dateCompleted : new Date(),
					dueDate : subTaskArray[i].dueDate,
					status : subTaskArray[i].status
				};
				
				obj["id"] = ++newSubTaskID;
				
				console.log("B S Obj :", obj);
				db.update({ _id : req.body._id }, { $push: { subTasks : obj }  }, {}, function (err, numReplaced, newDoc) {
					if (err !== null) {
						res.send({ ok: false, message: 'error while posting', error : err });
					}
					else {
						// Update Task Overall Progress
						updateTaskProgress(db, req.body._id, function() {
							db.find({ _id : req.body._id} , function (err, docs) {
								res.send({ ok: true, message: 'New Sub Tasks has been added successfuly.', tasks : docs });
							});
						});
					}
				});
			}
			
			
		});
	},
	
	saveSingleSubTask : function(req, res, db) {
		var obj = {};
		obj["subTasks."+req.body.id+".title"] = req.body.title;
		
		db.find({ _id : req.body._id }, { subTasks : 1, _id : 0}, function (err, docs) {
			// Update all Sub Tasks
			db.update({ _id : req.body._id  }, { $set: obj }, {}, function (err, numRemoved) {
				
			});
			
			// Find updated Sub Task and Return Data
			db.find({ _id : req.body._id} , function (err, docs) {
				res.send({ ok: true, message: 'Sub Task has been updated successfuly.', tasks : docs });
			});
		});
	},
	
	archiveSubTask : function(req, res, db) {
		var obj = {};
		var resultObj;
		
		obj["subTasks."+req.body.id+".status"] = req.body.status;
		
		db.update({ _id : req.body._id }, { $set: obj }, {}, function (err, numReplaced) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				// Update Task Overall Progress
				updateTaskProgress(db, req.body._id, function() {
					// Find updated Sub Task and Return Data
					db.find({ _id : req.body._id } , function (err, docs) {
						res.send({ ok: true, message: 'Task Progress updated', tasks : docs });
					});
				});
			}
		});
	},
	deleteSubTask : function(req, res, db) {
		var obj = {};
		obj["subTasks."+req.body.id] = 1;
		
		db.update({ _id : req.body._id  }, { $unset: obj }, {}, function (err, numRemoved) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				// Update Task Overall Progress
				updateTaskProgress(db, req.body._id, function() {
					// Find updated Sub Task and Return Data
					db.find({ _id : req.body._id} , function (err, docs) {
						res.send({ ok: true, message: 'Sub Task has been deleted successfuly.', tasks : docs });
					});
				});
			}
		});
	},
	
	getCount : function(res, db) {
		// Find all documents in the collection
		var allCategories = ldbTasksCatsCollection.items;
		
		var resObj = {};
		
		db.find({ }, function (err, docs) {
			
			var temp = [];
			var countArchivedTasks = 0;
			var countDueToday = 0;
			
			var totalCountAllTasks = 0;
			for(var i = 0; i < docs.length; i++) {
				temp.push(docs[i].category);
				if(docs[i].archived == "true") {
					countArchivedTasks = countArchivedTasks + 1;
				}
				else {
					
				}
				var tDate = new Date();
				tDate = (tDate.getMonth() + 1) +"/" + tDate.getDate() + "/"+ tDate.getYear() + " " + tDate.getHours() + ":" +tDate.getMinutes();
				if(docs[i].dueDate == tDate && docs[i].archived == "false") {
					countDueToday = countDueToday + 1;
				}
			}
			
			var pp = countTasksByCategory(temp);
			
			for(var i = 0; i < allCategories.length; i++) {
				
				for(var j = 0; j < pp.length; j++) {
					
					if(allCategories[i].name == pp[j].cat){
						allCategories[i].snipcount = pp[j].count;
						ldbTasksCatsCollection.update(allCategories[i].cid, {snipcount: pp[j].count});
					}
					else if(allCategories[i].name != pp[j].cat) {
						
					}					
				}
				
				totalCountAllTasks = totalCountAllTasks + allCategories[i].snipcount;
			}
			
			resObj["totalCategories"] = allCategories.length;
			resObj["totalTasks"] = totalCountAllTasks - countArchivedTasks; // No Archived or Completed Tasks
			resObj["totaltasks_with_archived"] = docs.length;
			resObj["totalArchivedTasks"] = countArchivedTasks;
			resObj["totalDueToday"] = countDueToday;
			
			res.send({ ok: true, message: 'Getting Tasks statistics', stats : resObj, tasks : docs });
			ldbTasksCatsCollection.save();
		});
	},
};

// Update Task Progress
function updateTaskProgress(db, taskDBId, callback) {
	// Task Progress :: Update Overall Task Progress using Sub Tasks
	db.find({ _id : taskDBId }, { subTasks : 1, _id : 0}, function (err, docs) {
		
		if(docs[0].subTasks && docs[0].subTasks.length > 0) {
			var avgLength = 0,
			totalSubTasks = 0;
			
			for(var i = 0; i < docs[0].subTasks.length; i++) {
				totalSubTasks = docs[0].subTasks.length;
				
				if(docs[0].subTasks[i].status == "Completed") {
					avgLength += 1;
				}
			}
			var taskProgress = 100 * (avgLength/totalSubTasks);
			
			db.update({ _id : taskDBId }, { $set: {taskProgress : taskProgress} }, {}, function (err, numReplaced) {
				callback();
			});
		}
	});
}
/* ======== */
// Group Records by Property like Categories, Title, Date
function groupRecordsBy(docs, groupBy) {
	var other = {},
	letter;
	
	for (var i=0; i < docs.length; i++) {
		if(groupBy == "startDate" || groupBy == "dueDate") {
			letter = docs[i][groupBy];
			letter = letter.split(/\s+/)[0];
			console.log("letter :: ", letter);
		}
		else {
			letter = docs[i][groupBy];
		}
		
		// if other doesn't already have a property for the current letter
		// create it and assign it to a new empty array
		if (!(letter in other)) {
			//other[letter] = [];
			other[letter] = {};
			other[letter].tasks = [];
		}
		//other[letter].push(docs[i]);
		other[letter].tasks.push(docs[i]);
	}
	
	return other
}

function countTasksByCategory(array_elements) {
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

function updateSubTasks(subTaskArray, taskDBId, db) {
	console.log("updateSubTasks", subTaskArray, taskDBId)
	if(subTaskArray && subTaskArray.length > 0) {
		var obj = {};
		
		for(var i = 0; i < subTaskArray.length; i++) {
			obj["subTasks."+i+".title"] = subTaskArray[i].title;
			obj["subTasks."+i+".dateCompleted"] = new Date();
		}
		
		console.log("Cont :", obj);
		db.update({ _id : taskDBId }, { $set: obj }, {}, function (err, numReplaced) {
			if (err !== null) {
				console.log('post error', err);
			}
			else {
				
			}
		});
	}
}

// Export all the functions
module.exports = todoControlls;