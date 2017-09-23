/*-----------------------------------------------------------------
	Controller :
	Common Controller Functions
-------------------------------------------------------------------*/
var utilityFns = require(__dirname +'/utility-functions'); // Include main-controller.js file in this js and use it's modules
var path = require('path');
var fs = require('fs');

var _optsMainCtrlr, _mainCtrlr = {
	init : function(settings) {
		_optsMainCtrlr = settings;
		var _this = this;

		//console.log("_optsMainCtrlr", _optsMainCtrlr);
	},
	listAllTest : function(req, res, db) {
		var listAllTags = _optsMainCtrlr.dbTags.items; // Tags Database
		var listAllCategories = _optsMainCtrlr.dbCats.items; // Category Database

		var filterObj = {};
		var filterBy = "category";

		if(req.query.filterBy && req.query.filterBy !== undefined) {
			filterBy = req.query.filterBy;
		}
		else {
			filterBy = 'category';
		}

		var filterValue = new RegExp(req.query.filterValue, 'i');
		filterObj[filterBy] = {
			$regex : filterValue
		}

		// { category : { $regex : /css/ } }
		db.find(filterObj).sort({dateCreated : -1}).exec(function (err, docs) {

			// Count all snippets having given categories
			db.count({ }, function (err, count) {
				resObj = {
					ok: true,
					categoryName : 'all',
					message: "Listing all Records filtered by '"+ filterBy +"' : " + filterValue,
					records : docs,
					tags : listAllTags,
					categories : listAllCategories,
					totalRecords : count
				}

				if(req.query.groupBy && req.query.groupBy != "") {
					var groupedRecords = groupRecordsBy(docs, req.query.groupBy);
					resObj["group"] = groupedRecords;
				}
				else {

				}

				res.send(resObj);
			});
		});
	},
	listAll : function(req, res, db) {
		var listAllTags = _optsMainCtrlr.dbTags.items; // Tags Database
		var listAllCategories = _optsMainCtrlr.dbCats.items; // Category Database

		var filterObj = {};
		var filterBy = "category";

		if(req.body.filterBy && req.body.filterBy !== undefined) {
			filterBy = req.body.filterBy;
		}
		else {
			filterBy = 'category';
		}
		var filterValue = req.body.filterValue;
		filterValue = filterValue.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\+/g, '\\+');
		filterValue = new RegExp(filterValue, 'i');
		filterObj[filterBy] = {
			$regex : filterValue
		}

		// { category : { $regex : /css/ } }
		//db.find(filterObj, function (err, docs) {
		db.find(filterObj).sort({dateModified : -1}).exec(function (err, docs) {

			// Count all snippets having given categories
			db.count({ }, function (err, count) {
				resObj = {
					ok: true,
					categoryName : 'all',
					message: "Listing all Records filtered by '"+ filterBy +"' : " + filterValue,
					records : docs,
					tags : listAllTags,
					categories : listAllCategories,
					totalRecords : count
				}

				if(req.body.groupBy && req.body.groupBy != "") {
					var groupedRecords = groupRecordsBy(docs, req.body.groupBy);
					resObj["group"] = groupedRecords;
				}
				else {

				}

				res.send(resObj);
			});
		});
	},

	getSingleRecordDetail : function(req, res, db) {
		// If a document's field is an array, matching it means matching any element of the array
		db.find({ _id : req.body.recordId }, function (err, docs) {
			// docs contains Mars. Result would have been the same if query had been { satellites: 'Deimos' }
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				res.send({ ok: true, message: 'Data loading for Selected Record ...' , recordDetail : docs});
			}
		});
	},

	deleteRecord : function(req, res, db) {
		// Remove one document from the collection
		// options set to {} since the default for multi is false
		db.remove({ _id: req.body._id }, {}, function (err, numRemoved) {
			if (err !== null) {
				res.send({ ok: false, message: 'error while posting', error : err });
			}
			else {
				res.send({ ok: true, message: 'Selected Record has been Deleted successfuly.'});

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

	markStarred : function(req, res, db) {
		db.update({ _id : req.body._id }, { $set: { isStarred: req.body.isStarred } }, function (err, numReplaced) {

			if (err !== null) {
				res.send({ ok: false, message: 'error while posting' });
			}
			else {
				if(req.body.isStarred == "true") {
					res.send({ ok: true, message: 'This record has been added to your favourite list ...'});
				}
				else if(req.body.isStarred == "false") {
					res.send({ ok: true, message: 'This record has been removed from your favourite list ...'});
				}
			}

		});
	},
};

//==================================================
// Helper Functions
//==================================================
// Group Records by Property like Categories, Title, Date
function groupRecordsBy(docs, groupBy) {
	var other = {},
	letter;

	for (var i=0; i < docs.length; i++) {
		if(groupBy == "startDate" || groupBy == "dueDate") {
			letter = docs[i][groupBy];
			letter = letter.split(/\s+/)[0];
			//console.log("letter :: ", letter);
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

// Sort Array
function sortRecords(array) {
	var i, categories = {};
	/* Build a map of categories and minimum indices: */
	for (i = 0; i < resultsArray.length; i++) {
		if (!categories[resultsArray[i].cat]) {
			categories[resultsArray[i].cat] = i;
		}
	}

	/* Sort the array using the minimum index: */
	return resultsArray.sort(function(one, other) {
		return categories[one.cat] - categories[other.cat];
	});
}

// Export all the functions
module.exports = _mainCtrlr;
