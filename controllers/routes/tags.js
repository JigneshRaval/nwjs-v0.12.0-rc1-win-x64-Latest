/*-----------------------------------------------------------------
	Routes :
	Tags Management Functions
-------------------------------------------------------------------*/

var tagsControlls = {
	listAllTags : function(res, tagsDB) {
		//var allTags = tagsDB.items;
		var allTags = tagsDB.items.sort(function(a, b) {
			if (a.tagName.trim() > b.tagName.trim()) {
				return 1;
			}
			if (a.tagName.trim() < b.tagName.trim()) {
				return -1;
			}
			// a must be equal to b
			return 0;
		});
		res.send({
			ok: true,
			categoryName : "Listing all Tags",
			message: 'Success',
			tags : allTags
		});
	},	
	addTags : function(req, tagsDB) {
		var tagsArray = req.body.tags.split(',');
		
		var finalArray = [];
		
		if(tagsArray && tagsArray.length > 0) {
			// Insert/add/push only one element
			for(var i = 0; i < tagsArray.length; i++) {
				var tagsObj = {};
				
				var isTagAvailable = tagsDB.where("@tagName == '"+tagsArray[i]+"'");
				
				if(isTagAvailable.items.length > 0) {
					console.log(tagsArray[i] + " : This tag is already available.");
				}
				else {
					tagsObj.tagName = tagsArray[i];
					tagsObj.tagColor = '#06c1eb';
					finalArray.push(tagsObj);
					console.log("New Tag "+tagsArray[i]+" has been added successfully");
				}
			}
			tagsDB.insert(finalArray);
		}
	},
	
	addSingleTag : function(req, tagsDB) {
		var tagsObj = {};
		tagsObj.tagName = req.body.tagName;
		tagsObj.tagColor = req.body.tagColor;
		
		tagsDB.insert(tagsObj);
	},
	
	editTag : function(req, tagsDB) {
		var tagName = req.body.name;
		var tagNewName = req.body.newName;
		var tagId = parseInt(req.body.cid);
		var tagColor = req.body.tagColor;
		
		tagsDB.update(tagId, {tagName: tagNewName, tagColor : tagColor});
	},
	
	deleteTag : function(req, tagsDB) {
		var tagId = parseInt(req.body.cid);
		
		tagsDB.remove(tagId);
		tagsDB.save();
	}
};



module.exports = tagsControlls; 

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
}*/
