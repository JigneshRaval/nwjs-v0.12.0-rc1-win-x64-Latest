/*-----------------------------------------------------------------
	Controller :
	Categories Management Controller Functions
-------------------------------------------------------------------*/

var categoryControlls = {
	listAllCategories : function(res, db, categoriesDB) {
		var allCategories = categoriesDB.items;
		
		// Find all documents in the collection
		db.find({ }, function (err, docs) {
			
			var temp = [];
			var totalRecordsCount = 0;
			for(var i = 0; i < docs.length; i++) {
				temp.push(docs[i].category);
			}
			
			var pp = countRecordsByCategory(temp);
			
			for(var i = 0; i < allCategories.length; i++) {
				
				for(var j = 0; j < pp.length; j++) {
					
					
					if(pp[j].cat == allCategories[i].name){
						allCategories[i].snipcount = pp[j].count;
						categoriesDB.update(allCategories[i].cid, {snipcount: pp[j].count});
					}
					else {
					}
					
				}
				
				totalRecordsCount = totalRecordsCount + allCategories[i].snipcount;
			}
			
			res.send({
				ok: true,
				result : "Listing all Categories successfully",
				message: 'Success',
				categories : allCategories,
				totalRecords : totalRecordsCount
			});
		});
		
		categoriesDB.save();
	},
	
	addCategory : function(req, categoriesDB) {
		var categoryName = req.body.category;
		var categoryObj = {}
		var isCategoryAvailable = categoriesDB.where("@name == '"+categoryName+"'");
		
		if(isCategoryAvailable.length > 0) {
			console.log("Category is already available");
		}
		else {
			categoryObj.name = categoryName;
			categoryObj.color = req.body.color;
			categoriesDB.insert(categoryObj);
			console.log("Category has been added successfuly");
		}
	},
	
	editCategory : function(req, categoriesDB) {
		var categoryName = req.body.name;
		var categoryNewName = req.body.newName;
		var categoryId = parseInt(req.body.cid);
		
		//categoriesDB.where("(@name == '"+categoryName+"' && @cid == '"+categoryId+"')")
		categoriesDB.update(categoryId, {name: categoryNewName, color : req.body.color});
		categoriesDB.save();
	},
	
	deleteCategory : function(req, categoriesDB) {
		var categoryId = parseInt(req.body.cid);
		
		categoriesDB.remove(categoryId);
		categoriesDB.save();
	}
};

function countRecordsByCategory(array_elements) {
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

module.exports = categoryControlls; 


/* var list = function(db, app){
	app.get('/listAllBookmarks', function(req, res){
		res.send('Amar, Akbar, Anthony');
	});
};

module.exports = list; 

module.exports =function(db) {
        var module = {};

         module.get = function(req, res){
           console.log("GOOD");

         }

         return module;
}
===================

http://stackoverflow.com/questions/15039045/access-app-js-variables-in-routes-but-without-global-express?rq=1
	

I'm not sure I understand. Isn't db global with or without var ( it looks like a global scope for me )? Besides, why don't you want it to be global? That's a good example of using globals.

But it won't get shared between files. You have to add it to exports. Try this:

app.js

exports.db = db;

routes/index.js

var db = require("app").db;

The other way is to add db to every handler like this:

app.js

app.use(function(req,res,next){
    req.db = db;
    next();
});
app.get('/', routes.index);
app.get('/tasks', routes.getAllTasks);

Then it should be available in any route as req.db.



*/