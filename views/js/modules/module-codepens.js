var libraryArray = [], libraryTypeArray = [], lib = {};

var obj_assetPanel = {
	module : {
		name : "CodePlayer",
		urls : {
			listCat : 'listCodepenCategories',
			addCat : 'addCodepenCategory',
			editCat : 'editCodepenCategory', 			
			delCat : 'deleteCodepenCategory',
			listTag : 'listCodepenTags',
			addTag : 'addSingleCodepenTag',
			editTag : 'editCodepenTag', 			
			delTag : 'deleteCodepenTag',
			listSnip : 'listCodepens'
		},
		controls : [
		{ name : "add", title : "Add New", id : "lnkAddNewRecord", icon : "ion-plus", hasPopover : false },
		{ name : "Favourites", title : "Favourites", id : "lnkViewStarredList", icon : "ion-star", hasPopover : false },
		{ name : "Add Category", title : "Add Category", id : "lnkAddCategory", icon : "ion-folder", hasPopover : true, addURL : "addCodepenCategory", listURL : "listCodepenCategories" },
		{ name : "Add Tag", title : "Add Tag", id : "lnkAddTag", icon : "ion-backspace", hasPopover : true, addURL : "addSingleCodepenTag", listURL : "listCodepenTags" },
		{ name : "Toggle View", title : "Toggle View", id : "lnkToggleView", icon : "ion-android-apps", hasPopover : false},
		{ name : "Refresh View", title : "Refresh View", id : "lnkReloadList", icon : "ion-android-refresh", hasPopover : false, listURL : "listCodepens"},
		]
	}
};

var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

$(function() {
	formValidationModule.init({formId: '#frmAddEditCodePen'});
	
	
	$('.library-dropdown a[data-toggle=dropdown]').on('click', function (event) {
		$(this).parent().toggleClass("open");
	});
	
	setTimeout(function() {
		bindAssetPanelControlls(obj_assetPanel);
		buildLibrariesDropdown();

		
		codeEditorModule.init({});
		
		codeEditorModule.htmlEditor.on('keyup', function() {
			delay(function(){
				codeEditorModule.setIframeContent();
			}, 2000 );
		});
		codeEditorModule.cssEditor.on('keyup', function() {
			delay(function(){
				codeEditorModule.setIframeContent();
			}, 2000 );
		});
		codeEditorModule.jsEditor.on('keyup', function() {
			delay(function(){
				codeEditorModule.setIframeContent();
				
			}, 2000 );
		});
		
	}, 1000);
	
	moduleTags.listTags('listCodepenTags');
	moduleCategories.listCat('listCodepenCategories');
	
	//codeEditorModule.listCodepens('category', 'css');
});

$('body').on('click', '.btnSaveToDisk', function() {
	// If internet is available then download all the CSS and JS Library from server for off-line usage
	if(navigator.onLine === true || navigator.onLine === "true") {
		codeEditorModule.downloadAllResources(cssJsLibrariesObj);
	}
	else {
		initGNotification("Files can not be downloaded. Please check your internet connection.", "error", 8000);
	}
});

function buildLibrariesDropdown() {
	var dropdownListHTML = "";
	
	if(navigator.onLine === true) {
		cssJsLibrariesObj["isOnline"] = true;
	}
	else {
		cssJsLibrariesObj["isOnline"] = false;
	}
	
	GTemplateModule.init({templateId : "#libraries-template", templateContainer : '.library-dropdown', bindArea :'ul', dataObj : cssJsLibrariesObj, partials : [] });
	
} 

var codeEditorOpts, codeEditorModule = {
	base_tpl : "<!doctype html>\n" +
	"<html>\n\t" +
	"<head>\n\t" +
	"<meta charset=\"utf-8\">\n\t" +
	"<title>Test</title>\n\t" +
	"<\/head>\n\t" +
	"<body>\n\t" +
	"<\/body>\n\t" +
	"<\/html>",
	htmlEditor : "",
	cssEditor : "",
	jsEditor : "",
	init : function(settings) {
		codeEditorOpts = settings;
		
		//$('#hdnPenName').val("mytest.html");
		
		if($('#hdnPenName').val() == "") {
			codeEditorModule.loadCodePen("");
		}
		else {
			codeEditorModule.loadCodePen($('#hdnPenName').val());
		}
		
		var codemirrorOpts = {
			lineNumbers: true,
			viewportMargin: Infinity,
			//mode: "text/html",
			profile: 'xhtml',
			styleActiveLine: true,
			matchBrackets: true,
			matchTags: {bothTags: true},
			autoCloseTags: true,
			foldCode : {scanUp :true},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
			theme : "lesser-dark", // vibrant-ink, solarized dark, ambiance, lesser-dark
			lineWrapping : true,
			styleActiveLine: true,
			onChange: function (inst, changes) {
				//render();
				console.log("Test onchange");
			}
		};
		
		var mixedMode = {
			name: "htmlmixed",
			scriptTypes: [
			{matches: /\/x-handlebars-template|\/x-mustache/i, mode: null},
			{matches: /(text|application)\/(x-)?vb(a|script)/i, mode: "vbscript"}
			]
		};
		
		codeEditorOpts["codemirrorOpts"] = codemirrorOpts;
		
		this.htmlEditor = CodeMirror(document.getElementById("editor_html"), codemirrorOpts);
		this.htmlEditor.setOption("mode", mixedMode);
		
		this.cssEditor = CodeMirror(document.getElementById("editor_css"), codemirrorOpts);
		this.cssEditor.setOption("mode", "css");
		
		this.jsEditor = CodeMirror(document.getElementById("editor_js"), codemirrorOpts);
		this.jsEditor.setOption("mode", {name: "javascript", json: true});
		
		//$('.editor-holder .CodeMirror').addClass('js-scrollbar').attr('data-scrollbar-theme', 'light');
		G_initCustomScrollbar();
		
	},
	initEditors : function() {
		
	},
	getEditorVal : function(editor) {
		return editor.getValue();
	},
	setEditorVal : function(editor, value) {
		return editor.setValue(value);
	},
	generateTemplate : function(libraryArray) {
		var scriptTag = "", styleTag = "";
		console.log(libraryArray);
		for(var i = 0; i < libraryArray.length; i++) {
			if(libraryArray[i].type == "js") {
				scriptTag += '<script src="'+libraryArray[i].name+'"><\/script>\n';
			}
			else if(libraryArray[i].type == "css") {
				styleTag += '<link rel="stylesheet" type="text/css" href="'+libraryArray[i].name+'" />\n';
			}
		}
		
		var template = "<!doctype html>\n" +
		"<html>\n\t" +
		"<head>\n\t" +
		"<meta charset=\"utf-8\">\n\t" +
		styleTag +
		"<title>Test</title>\n\t" +
		"<\/head>\n\t" +
		"<body>\n\t" +
		scriptTag +
		"<\/body>\n\t" +
		"<\/html>";
		
		return template;
	},
	prepareSource : function(libraryArray) {
		var scriptTag = "", styleTag = "";
		if(libraryArray) {
			if(libraryArray.length > 0) {
				for(var i = 0; i < libraryArray.length; i++) {
					if(libraryArray[i].type == "js") {
						scriptTag += '\n\n<script src="'+libraryArray[i].name+'"><\/script>\n';
					}
					else if(libraryArray[i].type == "css") {
						styleTag += '\n<link rel="stylesheet" type="text/css" href="'+libraryArray[i].name+'" />\n';
					}
				}
			}
		}
		
		var html = codeEditorModule.htmlEditor.getValue(),
		css = codeEditorModule.cssEditor.getValue(),
		js = codeEditorModule.jsEditor.getValue(),
		src = '';
		
		// HTML
		src = this.base_tpl.replace('<\/body>', html + '<\/body>');
		
		// CSS
		css = styleTag + '<style class="code-editor-style">\n' + css + '<\/style>\n';
		src = src.replace('<\/head>', css + '<\/head>');
		
		// Javascript
		js = scriptTag + '\n<script id="userScript">' + js + '<\/script>\n';
		src = src.replace('<\/body>', js + '<\/body>');
		
		
		return src;
	},
	addEditCodepen : function() {
		var $addEditCodepenForm = $('#frmAddEditCodePen');
		var mode = $addEditCodepenForm.find('#hdnMode').val();
		
		var penName = $addEditCodepenForm.find('#txtCodepenName').val();
		penName = penName.replace(/([\W]+)/gi, "_").toLowerCase();
		
		var addEditFormDataObj = {
			id : $addEditCodepenForm.find('#hdnCodepenId').val(),
			penName : penName + '.html',
			title : $addEditCodepenForm.find('#txtCodepenName').val(),
			category: $addEditCodepenForm.find('#optCategories').text(),
			categoryId : $addEditCodepenForm.find('#optCategories').val(),
			tags : $addEditCodepenForm.find('#txtTags').val(),
			description : $addEditCodepenForm.find('#txtareaPenDescription').val(),
			isStarred : false,
			dateCreated : new Date(),
			dateModified : new Date()
		};
		
		console.log("addEditFormDataObj", addEditFormDataObj);
		
		$.validate({
			onSuccess : function($form) {
				if(mode == "add") {
					addEditFormDataObj.mode = "add";
					//
					$('.library-dropdown li input[type=checkbox]').prop('checked', false);
					
					commonAjaxCall('addEditCodepen', addEditFormDataObj, "json", "POST", processAddNewCodepan);
					return false;
				}
				else if(mode == "edit") {
					addEditFormDataObj.mode = "edit";
					commonAjaxCall('addEditCodepen', addEditFormDataObj, "json", "POST", processAddNewCodepan);
					return false;
				}
				
			}
		});
	},
	
	getCodepenDetail : function(codepenId, codepenDBId) {
		$('#frmAddEditCodePen #hdnMode').val('edit');
		$('#frmAddEditCodePen #hdnCodepenId').val(codepenDBId);
		
		var mode = $('#modalAddSnippetForm #hdnMode').val();
		var editDataObj = {
			id : codepenId,
			_id : codepenDBId,
			dateModified : new Date(),
			mode : mode
		};
		commonAjaxCall('getCodepenDetail', editDataObj, "json", "POST", processGetCodepenDetail);		
	},
	
	saveTempCodePens : function() {
		var html = codeEditorModule.htmlEditor.getValue(),
		css = codeEditorModule.cssEditor.getValue(),
		js = codeEditorModule.jsEditor.getValue();
		
		var tempPenDataObj = {
			path : '',
			data : [
			{ fileName : "temp.html", data : html},
			{ fileName : "temp.css", data : css},
			{ fileName : "temp.js", data : js}
			]
		};
		commonAjaxCall('saveTempCodePens', tempPenDataObj, "json", "POST", processTempPens);
	},
	saveCodePen : function() {
		if($('#hdnPenName').val() == "") {
			$('#modalAddEditCodePenForm').modal('show');
		}
		else {
			var source = this.prepareSource(libraryArray);
			
			var savePenDataObj = {
				path : '',
				fileName : $('#hdnPenName').val(),
				data : source
			};
			commonAjaxCall('saveCodePen', savePenDataObj, "json", "POST", processSaveCodePen);
		}
	},
	setIframeContent : function() {
		
		var source = this.prepareSource(libraryArray);
		
		var iframe = document.querySelector('#iframe_result_view'),
		iframe_doc = iframe.contentDocument;
		
		iframe_doc.open();
		iframe_doc.write(source);
		iframe_doc.close();
	},
	loadCodePen : function(fileName) {
		
		$('#hdnPenName').val(fileName);
		
		if(fileName != "") {
			var loadPenDataObj = {
				path : '',
				fileName : fileName
			};
			commonAjaxCall('loadCodePen', loadPenDataObj, "json", "POST", processLoadCodePen);
		}
	},
	downloadAllResources : function(cssJsLibrariesObj) {
		cssJsLibrariesObj["dateSaved"] = new Date();
		// Download all JS and CSS frameworks for Off-line use.
		commonAjaxCall('downloadAllResources', cssJsLibrariesObj, "json", "POST", processDownloadAllResources);
	},
	listCodepens : function(filterBy, filterValue) {
		var listDataObj = {			
			filterBy : filterBy,
			filterValue : filterValue			
		};
		
		commonAjaxCall('listCodepens', listDataObj, "json", "POST", processListCodepens);
	},
	deleteCodepen : function(codepenId, codepenDBId) {
		alertify.confirm("Are you sure you want to delete this codepen?", function (e) {
			if (e) {
				var deleteDataObj = {
					id : codepenId,
					_id : codepenDBId
				};
				commonAjaxCall('deleteCodepen', deleteDataObj, "json", "POST", processDeleteCodepen);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	}
};

function processDownloadAllResources(resultObj) {
	console.log("processDownloadAllResources", resultObj);
	initGNotification("All the Javascript and CSS Libraries are saved to disk.<br/>Location : ../database/code-pans/offline-resources/", "success", 8000);
}

function processListCodepens(resultObj) {
	console.log("processListCodepens", resultObj);
	//GTemplateModule.init({templateId : "#codepens-list-template", templateContainer : '.codepens-wrapper', bindArea :'.codepens-wrapper__list', dataObj : resultObj, partials : [] });
	
	GTemplateModule.init({templateId : "#codepens-list-template", templateContainer : '#slick-data-wrapper', bindArea :'.slick-slider-content', dataObj : resultObj, partials : [] });
	
	$('.result-area-wrapper').addClass('active').next().removeClass('active');
	
	$('.slick-slider-content').removeClass('slick-initialized');
	initSlick();
}

// START :: Callback Functions
function processAddNewCodepan(resultObj) {
	console.log("processAddNewCodepan", resultObj);
	$('#hdnPenName').val(resultObj.pens.penName)
	codeEditorModule.loadCodePen(resultObj.pens.penName);
	codeEditorModule.saveCodePen();
	$('#modalAddEditCodePenForm').modal('hide');
}

// Get Codepen Data for Editing
function processGetCodepenDetail(resultObj) {
	
	$('#modalAddEditCodePenForm').modal('show');
	console.log("processGetCodepenDetail", resultObj);
	
	var $frm = $('#frmAddEditCodePen');
	
	populateWithoutPrefix($frm, resultObj.pens[0]);
	
	// Display Tags in Selectize Dropdown
	if(resultObj.pens[0].keywords && resultObj.pens[0].keywords != "") {
		var tagsArray = resultObj.pens[0].keywords.split(",");
		var finalTagsArray = [];
		
		var control = $selectizeTags[0].selectize;
		control.clear();
		control.setValue(tagsArray); 
	}
}

// Delete Codepen
function processDeleteCodepen(resultObj) {
	console.log("processDeleteCodepen", resultObj);
	
	codeEditorModule.listCodepens('category', $('#hdnSelectedCategory').val());
	
	moduleTags.listTags('listCodepenTags');
	moduleCategories.listCat('listCodepenCategories');
}

function processSaveCodePen(resultObj) {
	console.log("processSaveCodePen", resultObj);
}
function processTempPens(resultObj) {
	console.log("processTempPens", resultObj);
}

$('body').on('click', '.library-dropdown li input[type=checkbox]', function() {
	checkLibrarys();
});

function checkLibrarys() {
	libraryArray.length = 0;
	
	$('.library-dropdown li input[type=checkbox]').each(function(index) {
		var libraryObj = {}
		if($(this).prop('checked') === true) {
			libraryObj.name = $(this).val();
			libraryObj.type = $(this).attr('data-type');
			libraryArray.push(libraryObj);
		}
		else if($(this).prop('checked') === false) {
			for(var i = 0; i < libraryArray.length; i++) {
				if($(this).val() == libraryArray[i].name) {
					libraryArray.splice(i, 1);
				}
			}
			
		}
	});
	
	codeEditorModule.setIframeContent();
}

function processLoadCodePen(resultObj) {
	console.log("processLoadCodePen", resultObj);
	
	if(resultObj && resultObj.data) {
		if(resultObj.data == "") {
			libraryArray.length = 0;
			
			var iframe_doc = document.querySelector('#iframe_result_view').contentDocument;
			iframe_doc.open();
			iframe_doc.write("");
			iframe_doc.close();
			
			codeEditorModule.setEditorVal(codeEditorModule.cssEditor, "");
			codeEditorModule.setEditorVal(codeEditorModule.jsEditor, "");
			codeEditorModule.setEditorVal(codeEditorModule.htmlEditor, "");
		}
		else {
			var htmlString = resultObj.data;
			htmlString = htmlString.replace(/(\<script (.*)\>([\S.]*)\<\/script\>)/gi, '').replace(/(\<script id=\"userScript\"\>([\s\S.]*)\<\/script\>)/gi, "");
			
			// Get Content of "Body" Tag by stripping scripts tag to avoid saving dynamically
			// Generated content like Handlebars Template rendering results.
			var doc = document.querySelector('#iframeTempLoadPenContent').contentDocument;
			doc.open();
			doc.write(htmlString);
			doc.close();
			
			var iframe_doc = document.querySelector('#iframe_result_view').contentDocument;
			iframe_doc.open();
			iframe_doc.write(resultObj.data);
			iframe_doc.close();
			
			var $test = $(iframe_doc);
			
			if($test.find('link').length > 0) {
				for(var i = 0; i < $test.find('link').length; i++) {
					var libraryObj = {}
					libraryObj.name = $test.find('link:eq('+i+')').attr('href');
					libraryObj.type = 'css';
					libraryArray.push(libraryObj);
				}
			}
			if($test.find('script').length > 0) {
				for(var i = 0; i < $test.find('script').length; i++) {
					var scriptSrc = $test.find('script:eq('+i+')').attr('src');
					
					if(scriptSrc !== undefined) {
						var libraryObj = {}
						libraryObj.name = scriptSrc;
						libraryObj.type = 'js';
						libraryArray.push(libraryObj);
					}
				}
			}
			
			for(var i = 0; i < libraryArray.length; i++) {
				$('.library-dropdown li input[type=checkbox]').each(function(index) {
					if($(this).val() == libraryArray[i].name) {
						$(this).prop('checked', true);
					}
				});
			}
			
			// Set Style
			codeEditorModule.setEditorVal(codeEditorModule.cssEditor, $.trim($test.find('style').html()));
			
			// Set Script data
			codeEditorModule.setEditorVal(codeEditorModule.jsEditor, $test.find('#userScript').html());
			
			// Set HTML
			var code = $(doc).find('body').html();
			codeEditorModule.setEditorVal(codeEditorModule.htmlEditor, $.trim(code));
		}
	}
	else {
		libraryArray.length = 0;
		var iframe_doc = document.querySelector('#iframe_result_view').contentDocument;
		iframe_doc.open();
		iframe_doc.write("");
		iframe_doc.close();
		
		codeEditorModule.setEditorVal(codeEditorModule.cssEditor, "");
		codeEditorModule.setEditorVal(codeEditorModule.jsEditor, "");
		codeEditorModule.setEditorVal(codeEditorModule.htmlEditor, "");
	}
	
	$('.result-area-wrapper').removeClass('active').next().addClass('active');
	$('.result-area-wrapper').find('.slick-slider-content').empty();
}

$('body').on('click', '.code-box-wrapper h3', function (e) {
	$(this).next('div').slideToggle();
});

// Close Library Dropdown
$('body').on('click', function (e) {
	if (!$('.library-dropdown').is(e.target) && $('.library-dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
		$('.library-dropdown').removeClass('open');
	}
});

$('body').on('click', '#lnkAddNewRecord', function() {
	var $modal = $('#modalAddEditCodePenForm');
	$modal.modal('show');
	resetForm('#frmAddEditCodePen');
	$modal.find('#hdnMode').val('add');
});

// Load snippets List on Category change
$('body').on('click', 'ul.panel-categories li a', function() {
	var categoryName = $(this).attr('data-category').toLowerCase();
	var categoryId = $(this).attr('data-category-id');
	codeEditorModule.listCodepens('category', categoryName);
	
	$('#frmAddNewCategory #hdnSelectedCategory').val(categoryName);
	
	if(!$(this).closest('li').hasClass('active')) {
		$(this).closest('li').addClass('active').siblings('li').removeClass('active');
	}
	else {
		
	}
});

/*------------------------------------
	START :: Tags Management
--------------------------------------*/
// List Snippets By Selected Tag
$('body').on('click', '.tags-wrapper a', function() {
	var listDataObj = {
		filterBy : 'tags',
		filterValue : $(this).attr('data-tag')
	};
	codeEditorModule.listCodepens(listDataObj);
});


function initSlick() {	
	$('.slick-slider-content').slick({
		accessibility: true,
		pauseOnHover : true,
		//autoplay : true,
		initialSlide : 0,
		dots: true,
		infinite: false,
		//vertical : true,
		prevArrow : '<button class="btn prevPage"><i class="ion-chevron-left"></i></button>',
		nextArrow : '<button class="btn nextPage"><i class="ion-chevron-right"></i></button>'
		}).mousewheel(function(event) {
		
		if (event.deltaY < 0) {
			$('.slick-slider-content').slick('slickNext');
		}
		else {
			$('.slick-slider-content').slick('slickPrev');
		}
	});
}

$('.result-area-wrapper').on('show_external_url', function(e) {
	var $this = $(this);
	$this.find('.iframe-loader').show();
	if(!$this.hasClass('active')) {
		$this.addClass('active');
	}
	else {
		$this.removeClass('active');
	}	
});

$('body').on('click', '.result-area-wrapper a.close-result-view', function() {
	$('.result-area-wrapper').removeClass('active').next().addClass('active');
	$('.result-area-wrapper').find('.slick-slider-content').empty();
});