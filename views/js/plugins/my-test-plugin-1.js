(function (root, undefined) {
	"use strict";
	console.log("RRR :", root);
	var document = root.window.document,
	Jignesh;
	
	Jignesh = function () {
		console.log("Jig Init Inside");
	};
	
	// AMD and window support
	if (typeof define === "function") {
		define([], function () { return new Jignesh(); });
		} else if (typeof root.window.jignesh === "undefined") {
		root.window.jignesh = new Jignesh();
	} 
}(this));