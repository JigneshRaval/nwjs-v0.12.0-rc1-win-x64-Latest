function loadJSONTemplate(templatesPathObj) {
	//console.log(templatesPathObj);
	$.each(templatesPathObj.files, function(key, value) {
		if(value.filetype == "json") {
			$('head').append('<script type="text/javascript" src="'+value.path+'"><\/script>');
		}
		else if(value.filetype == "html") {
			//$(value.container).load(value.path);
			$.get(value.path, function( data ) {
				$(value.container).append( data );
			});
		}
	});
}

// HTML 5 Include one .html file into another
function includeModalOverlays(arrImportHTMLFiles, callback) {
	var callback = callback || function(){};
	
	if(arrImportHTMLFiles) {
		var link = document.querySelectorAll('link[rel="import"]');
		
		for(var j = 0; j < link.length; j++) {
			
			var content = link[j].import; // Get content of link import
			
			
			for(var i = 0; i < arrImportHTMLFiles.length; i++) {
				// Grab DOM from warning.html's document.
				for(var h = 0; h < arrImportHTMLFiles[i].contentId.length; h++) {
					
					if(content.querySelector(arrImportHTMLFiles[i].contentId[h])) {
						var el = content.querySelector(arrImportHTMLFiles[i].contentId[h]);
						document.querySelector(arrImportHTMLFiles[i].bindArea).appendChild(el.cloneNode(true));
					}
					
				}
			}
		}
	}
	
	console.log("Including Modal Overlays..");
	callback();
}

// Generate Left Navigation Sticky panel
function generateLeftNavPanel(leftNavPanelObj) {
	var navHtml = "";
	
	for(var i = 0; i < leftNavPanelObj.items.length; i++) {
		navHtml = navHtml + '<li><a href="'+leftNavPanelObj.items[i].iconClass+'.html"><i class="jicon-'+leftNavPanelObj.items[i].iconClass+'"></i><span><em class="arrow small arrow-left"></em>'+leftNavPanelObj.items[i].name+'</span></a></li>';
	}
	$('.control-panel ul').html(navHtml);
}

// Method : 1
//Load all script files dynamically and append to BODY Tag

function loadScript(url, callback){
	var script = document.createElement("script")
	script.type = "text/javascript";
	
	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" || script.readyState == "complete"){
				script.onreadystatechange = null;
				callback();
			}
		};
	}
	else {  //Others
		script.onload = function(){
			console.log("Load ..");
			callback();
		};
	}
	
	script.src = url;
	
	document.getElementsByTagName("body")[0].appendChild(script);
}

// Method : 2
//Load all script files dynamically using jQuery $.getScript Method
var arryCommonScripts  = [
"/plugins/moment.js",
"/bootstrap.js",
"/handlebars-v3.0.0.js",
"/handlebars.helpers.js",
"/plugins/progress.min.js",
"/plugins/jquery.form-validator.min.js",
"/plugins/summernote.js",
"/plugins/alertify.js",
"/plugins/selectize.js",
"/plugins/jquery.bootstrap-growl.min.js",
"/plugins/jquery.fastLiveFilter.js",
"/plugins/mousetrap.js",
"/plugins/jquery.easing.1.3.min.js",
"/plugins/jasny-bootstrap.js",
"/plugins/jPages.js",
"/plugins/jquery.mCustomScrollbar.concat.min.js",
"/plugins/dropdowns-enhancement.js",
"/plugins/bootstrap-colorpicker.js",
"/plugins/jquery.form.js",
"/plugins/jquery.uploadfile.js",
"/modules/module-upload.js",
"/modules/module-categories.js",
"/modules/module-tags.js",
];

var cachedScriptsArr = Array.prototype.push; // Create Blank Array before push new array

var getScript = $.getScript;
$.getScript = function( resources, callback ) {
	
	var // reference declaration &amp; localization
	length = resources.length,
	handler = function() { counter++; },
	deferreds = [],
	counter = 0,
	idx = 0;
	
	for ( ; idx < length; idx++ ) {
		
		resources[ idx ] = '/views/js' + resources[ idx ];
		
		deferreds.push(
		getScript( resources[ idx ], handler )
		);
	}
	
	$.when.apply( null, deferreds ).then(function() {
		callback && callback();
	});
};

function showPageLoadProgress() {
	// Show Page Loading Progress
	progressJs().setOptions({theme: 'red'}).start().autoIncrease(1, 1500);
	
	progressJs().onprogress(function(targetElm, percent) {
		console.log("progress changed to:" + percent);
	});
	progressJs().onbeforestart(function() {
		alert("before start");
	});
	
	if(window.attachEvent) {
		window.attachEvent('onload', function(){
			progressJs().end();
		});
	}
	else {
		if(window.onload) {
			var curronload = window.onload;
			var newonload = function() {
				curronload();
				progressJs().end();
			};
			window.onload = newonload;
		}
		else {
			window.onload = function(){
				progressJs().end();
			};
		}
	}
}