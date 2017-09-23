/*-----------------------------------------------------------------
	Controller :
	Categories Management Controller Functions
-------------------------------------------------------------------*/

var commonControlls = {
	listAllCategories : function(res, db, categoriesDB) {
		
	},
};


module.exports = commonControlls; 


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