/*-----------------------------------------
	JRSnipps : Common Function Librery
-------------------------------------------*/
// Custom Modal Overlay Functions using Animate.css
$('body').on('click', '[data-toggle="close-overlay"]', function() {
	var $this = $(this);
	$this.closest('.modal-overlay').find('.modal-overlay-content').removeClass('animated bounceInDown').addClass('animated bounceOutUp');
	setTimeout(function() {
		$this.closest('.modal-overlay').hide();
	}, 600);
});

$('body').on('click', '[data-toggle="open-overlay"]', function() {
	var $this = $(this);
	var modalId = $this.attr('data-modalid');
	$(modalId).show().find('.modal-overlay-content').removeClass('animated bounceOutUp').addClass('animated bounceInDown');
});


function initSummnerNoteEditor(height, minh) {
	if($('.note-editor').length > 0) {
		$('.summernote').destroy();
		summernoteEditor(height, minh); // Height and Minimum Height
	}
	else {
		summernoteEditor(height, minh); // Height and Minimum Height
	}
}

function summernoteEditor(height, minh) {
	var mixedMode = {
		name: "htmlmixed",
		scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
		mode: null},
		{matches: /(text|application)\/(x-)?vb(a|script)/i,
		mode: "vbscript"}]
	};

	$('.summernote').summernote({
		height: height, // set editor height
		minHeight: minh, // set minimum height of editor
		toolbar: [
		['style', ['bold', 'italic', 'underline', 'clear', 'fontsize', 'color']],
		['para', ['ul', 'ol', 'paragraph']],
		['height', ['height']],
		['table', ['table']],
		['insert', ['link', 'picture']],
		['misc', ['undo','redo','codeview','help', 'fullscreen']]
		],
		codemirror: { // codemirror options
			lineNumbers: true,
			mode: mixedMode,
			profile: 'xhtml',
			styleActiveLine: true,
			matchBrackets: true,
			matchTags: {bothTags: true},
			autoCloseTags: true,
			foldCode : {scanUp :true},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
			theme : "vibrant-ink", // vibrant-ink, solarized dark, ambiance
			lineWrapping : true,
			styleActiveLine: true,
		},
		onfocus: function(e) {
		//console.log('Editable area is focused');
		},
		onblur: function(e) {
			//console.log('Editable area loses focus');
			setHTMLEditorCode();
		},
		onenter: function(e) {
			//console.log('Enter/Return key pressed');
			document.execCommand('insertHTML', false, '<p></p>');
			// prevent the default behaviour of return key pressed
			return false;
			}/* ,
			onImageUpload: function(files, editor, $editable) {
			console.log('image upload:', files, editor, $editable);
			// NOTE :: This function will not display image in Editor
		} */
	});
}


// Hide popover on outside click
/*
$('body').on('click', function (e) {
	$('[data-toggle="popover"]').each(function () {
		//the 'is' for buttons that trigger popups
		//the 'has' for icons within a button that triggers a popup
		if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
			$(this).popover('hide');
		}
	});
});
*/

function showNotification(message, type, delay) {
	$.bootstrapGrowl(message, {
		ele: 'body', // which element to append to
		type: type, // (null, 'info', 'danger', 'success')
		offset: {from: 'bottom', amount: 20}, // 'top', or 'bottom'
		align: 'right', // ('left', 'right', or 'center')
		width: 350, // (integer, or 'auto')
		delay: delay, // Time while the message will be displayed. It's not equivalent to the *demo* timeOut!
		allow_dismiss: true, // If true then will display a cross to close the popup.
		stackup_spacing: 10 // spacing between consecutively stacked growls.
	});
}
/*-------------------------------------
	START : Pagination Functions
---------------------------------------*/

function initPagination(startPage, perPage, paginationContainerID, paginationHolder) {

	//console.log("pagination ....", startPage, perPage, paginationContainerID, paginationHolder);
	/* initiate the plugin */
	$("div"+paginationHolder).jPages({
		containerID  : paginationContainerID,
		perPage      : perPage,
		startPage    : startPage,
		startRange   : 1,
		midRange     : 5,
		endRange     : 1,
		keyBrowse   : true,
		first       : "first",
		previous    : "a.prevPage",
		next        : "a.nextPage",
		last        : "last",
		animation   : "fadeInUp", //"bounceInUp",
		scrollBrowse   : false,
		callback    : function( pages, items ){
			$(".custom-pagination-btns .pagination-legend").html('Page <input value="'+ pages.current+'" type="text" name="txtJumpToPage" id="txtJumpToPage"> of '+ pages.count);
			$('.js-scrollbar').mCustomScrollbar("update");
		}
	});
}

$('body').on('keypress', '#txtJumpToPage', function(e){

	if(e && e.keyCode == 13)
	{
		var page = parseInt($(this).val());

		/* jump to that page */
		$("#holder-snippets").jPages(page);
	}

});
/* on select change */
$("#optItemsPerPage").change(function(){
	destroyPagination("#holder-snippets");

	/* get new nº of items per page */
	var newPerPage = parseInt( $(this).val() );

	/* destroy jPages and initiate plugin again */
	$("#holder-snippets").jPages({
		containerID   : "snippets-wrapper__list",
		perPage       : newPerPage
	});

	//initPagination(1, newPerPage, "snippets-wrapper__list", "#holder-snippets");

	/* destroy jPages and initiate plugin again */
	/*
		$("div.holder").jPages({
		containerID   : "snippets-wrapper__list",
		perPage       : newPerPage
		});
	*/
});

function destroyPagination(paginationHolder) {
	// console.log("destroyPagination..");
	$("div"+paginationHolder).jPages("destroy");
};

function commonAjaxCall(url, data, dataType, method, callback, async) {
	//console.log(this, url, data, dataType, method, async, this.filterBy);
	var isAsync = null;

	if(async !== null || async !== "undefined" || async !== undefined) {
		isAsync = true;
	}
	else {
		isAsync = async;
	}
	$.ajax({
		url: url,
		type: method,
		dataType: 'json',
		data: data,
		timeout:5000,
		async : isAsync,
		//error: function (jqxhr, textStatus, errorThrown) { },
		error: function(req,error){
			if(error === 'error'){error = req.statusText;}
			var errormsg = 'There was a communication error: '+error;
			//container.html(errormsg).effect('highlight',{color:'#c00'},1000);
		},
		beforeSend: function(){
			//
			$('.loading-indicator').addClass('loading');
		},
		complete : function(){
			//
			$('.loading-indicator').removeClass('loading');
		},
		success: callback
	});
}
// Testing for Javascript Call and Apply Method
function commonAjaxCallTest(dataObj) {
	//console.log(this, url, data, dataType, method, async, this.filterBy);
	var isAsync = null;

	if(dataObj.async !== null || dataObj.async !== "undefined" || dataObj.async !== undefined) {
		isAsync = true;
	}
	else {
		isAsync = dataObj.async;
	}
	$.ajax({
		url: dataObj.url,
		type: dataObj.method,
		dataType: dataObj.dataType,
		data: dataObj.data,
		timeout:5000,
		async : isAsync,
		//error: function (jqxhr, textStatus, errorThrown) { },
		error: function(req,error){
			if(error === 'error'){error = req.statusText;}
			var errormsg = 'There was a communication error: '+error;
			//container.html(errormsg).effect('highlight',{color:'#c00'},1000);
		},
		beforeSend: function(){
			//
			$('.loading-indicator').addClass('loading');
		},
		complete : function(){
			//
			$('.loading-indicator').removeClass('loading');
		},
		success: dataObj.callback
	});
}



// Accordion

$('body').on('touchstart click', '.js-expand-collapse-wrapper .js-expand-collapse', function(e){
	e.preventDefault();
	if($(this).attr('data-toggle-expand-collapse') == "true") {
		if(!$(this).closest('li').hasClass('active')){
			var accordionIndex = $(this).closest('li').index();
			$(this).closest('li').addClass('active').siblings('li').removeClass('active');
			$(this).closest('li').find('.js-expand-collapse-content').slideDown().addClass('active');
			//$('.js-scrollbar').mCustomScrollbar("update");
			//$('.js-horizontal-scrollbar').mCustomScrollbar("update");
		}
		else {
			$(this).closest('li').removeClass('active');
			$(this).closest('li').find('.js-expand-collapse-content').slideUp().removeClass('active');
		}
	}
	else {
		if(!$(this).closest('li').hasClass('active')){
			var accordionIndex = $(this).closest('li').index();
			$(this).closest('li').addClass('active').siblings('li').removeClass('active');
			//$(this).closest('li').find('.js-expand-collapse-content').slideDown().addClass('active');
			//$('.js-scrollbar').mCustomScrollbar("update");
			//$('.js-horizontal-scrollbar').mCustomScrollbar("update");
		}
		else {
			//$(this).closest('li').removeClass('active');
			//$(this).closest('li').find('.js-expand-collapse-content').slideUp().removeClass('active');
		}
	}
});

// Scroll To Specific location in page
function scrollTop(needScroll, scrollTo) {
	// needScroll = true or false
	// scrollTo = give class or ID of specific html element like DIV, P, Body etc..
	if(needScroll === true) {
		$('html, body').animate({scrollTop:$(scrollTo).offset().top - 20}, 'fast');
	}
}
var partialTemplate = "";
/* = Handlebars : Template Binding function ===================*/
var GTempOpt, GTemplateModule = {
	init : function(settings) {

		GTempOpt = settings;
		if(GTempOpt.options && GTempOpt.options !== "undefined") {
			GTempOpt.dataObj['options'] = GTempOpt.options;
		}

		//console.log("GTempOpt====", GTempOpt);

		this.bindTemplate();
	},
	bindTemplate : function() {

		$(GTempOpt.templateContainer +' '+GTempOpt.bindArea).empty(); // Clear Old Data

		// Register Partials ( Child Templates )
		if(GTempOpt.partials && GTempOpt.partials.length > 0){
			for(var i =0; i < GTempOpt.partials.length; i++) {
				var partialSource =  $('#'+GTempOpt.partials[i].partialName +"-partial").html();
				partialTemplate = Handlebars.compile(partialSource);

				//Handlebars.registerPartial(GTempOpt.partials[i].partialName, $('#'+GTempOpt.partials[i].partialName +"-partial").html());

				Handlebars.registerPartial(GTempOpt.partials[i].partialName, partialTemplate);

			}
		}
		var source   = $(GTempOpt.templateId).html();
		var template = Handlebars.compile(source);

		$(GTempOpt.templateContainer +' '+GTempOpt.bindArea).html(template(GTempOpt.dataObj));

		/* Partial Binding
			var source = "<ul>{{#people}}<li>{{> link}}</li>{{/people}}</ul>";

			Handlebars.registerPartial('link', '<a href="/people/{{id}}">{{name}}</a>')
			var template = Handlebars.compile(source);

			var data = { "people": [
			{ "name": "Alan", "id": 1 },
			{ "name": "Yehuda", "id": 2 }
			]};

			template(data);

			// Should render:
			// <ul>
			//   <li><a href="/people/1">Alan</a></li>
			//   <li><a href="/people/2">Yehuda</a></li>
			// </ul>
		*/
	}
};

// Init Custom Scrollbar Plugin : Vertical
/*
function G_initCustomScrollbar() {
	$('.js-scrollbar').each(function() {

		var theme = $(this).attr('data-scrollbar-theme');
		if(theme === 'undefined' || theme === undefined) {
			theme = "dark-2";
		}
		else {

		}

		$(this).mCustomScrollbar({
			mouseWheel: {
				enable: true,
				normalizeDelta: true,
				scrollAmount : 100
			},
			contentTouchScroll: true,
			updateOnContentResize : true,
			axis:"y",
			theme: theme, // dark-2, "light-thin", "dark-thin", "inset", "inset-dark",  "light-2"
			scrollInertia: 500,
			keyboard:{
				enable: false,
				scrollAmount : 50,
				scrollType : "stepless" // "stepless", "stepped"
			},
			advanced:{
				updateOnContentResize: true,
				updateOnBrowserResize: true,
				autoScrollOnFocus:false
			},
			callbacks:{
				onInit:function(){
					//console.log("scrollbars initialized", this);
				},
				onUpdate:function(){
					//console.log("Scrollbars updated");
				}
			}
		});
	});

	$('.js-scrollbar').mCustomScrollbar("update");
}

// Init Custom Scrollbar Plugin : Horizontal
function G_initCustomScrollbar_Horizontal() {
	$('.js-scrollbar').mCustomScrollbar({
		mouseWheel:true,
		contentTouchScroll: true,
		updateOnContentResize : true,
		axis:"x",
		theme: "inset-3",
		scrollInertia: 150,
		advanced:{
			updateOnContentResize: true,
			updateOnBrowserResize: true
		},
	});
	$('.js-scrollbar').mCustomScrollbar("update");
}
*/
$('.control-panel__content h3').on('click', function() {
	if(!$(this).hasClass('active')){
		$(this).addClass('active').next().slideDown();

	}
	else {
		$(this).removeClass('active').next().slideUp();
	}
});


$('.control-panel > ul > li').on('click', function() {
	if(!$(this).hasClass('active')) {
		$(this).addClass('active').siblings('li').removeClass('active');
		$(this).find('.control-panel-subnav').addClass('active');
	}
	else {
		$(this).removeClass('active');
		$(this).find('.control-panel-subnav').removeClass('active');
	}
});
// Reset all form fields and HTML Editors
function resetForm(formID) {
	$(formID).each(function(){
		this.reset();
		$(formID).find('.note-editable').empty();
		/* if($(formID).find('.selectized').length > 0){
			$.each($(formID).find('.selectized'), function(key, value) {
			var $selectSource  = $(this)[0].selectize;

			$selectSource.clear();
			$selectSource.refreshItems();
			});
		} */
	});
}

/*
	**    Common Methods
*/
function populateWithPrefix(frm, prefixKey,entry) {
	$.each(entry, function(key, value){
		// to handle blank values
		//$('[name='+prefixKey+'\\.'+key+']', frm).val(value);
		if($('[name='+prefixKey+'\\.'+key+']', frm).hasClass('html-editor')) {
			$('[name='+prefixKey+'\\.'+key+']', frm).code(value);
		}
		else if($('[name='+prefixKey+'\\.'+key+']', frm).hasClass('selectized')) {
			// Set Value for Custom select dropdown
			var $getOptList = $('[name='+prefixKey+'\\.'+key+']', frm)[0].selectize;
			$getOptList.setValue(value);
		}
		else if($('[name='+prefixKey+'\\.'+key+']', frm).hasClass('select-unstyled')) {
			// Set Value for Custom select dropdown
			$('[name='+prefixKey+'\\.'+key+']', frm).val(value);
		}
		else {
			$('[name='+prefixKey+'\\.'+key+']', frm).val(value);
		}
	});
}


function populateWithoutPrefix(frm,entry) {
	$.each(entry, function(key, value){
		// to handle blank values
		if($('[data-form-field='+key+']', frm).hasClass('summernote')) {
			$('[data-form-field='+key+']', frm).code(value);
		}
		else if($('[data-form-field='+key+']', frm).hasClass('selectized')) {
			// Set Value for Custom select dropdown

			var getOptList = $('[data-form-field='+key+']', frm)[0].selectize;
			getOptList.clear();
			getOptList.setValue(value);
		}
		else if($('[name='+key+']', frm).hasClass('select-unstyled')) {
			// Set Value for Custom select dropdown
			$('[data-form-field='+key+']', frm).val(value);
		}
		else {
			if(key == "codes") {
				for(var i = 0; i < value.length; i++) {
					$('[data-form-field="'+key+'['+i+'].code"]', frm).val(value[i].code);
					var getOptList = $('[data-form-field="'+key+'['+i+'].codeLanguage"]', frm)[0].selectize;
					getOptList.clear();
					getOptList.setValue(value[i].codeLanguage);

				}
			}

			$('[data-form-field='+key+']', frm).val(value);
		}
	});
}


// Show-hide Content on click of "More" button
// Show More and Less Description
var _GShowMoreContentOpt, _GShowMoreContentModule = {
	ellipsestext : "...",
	container : '[data-toggle="more-less-content"] .more-content',
	content : "",
	finalHTML : "",
	init : function(settings) {
		_GShowMoreContentOpt = settings;

		this.getContent();
	},
	getContent : function() {
		$(this.container).each(function() {
			if(!$(this).hasClass('js-stripped')) {
				var stripMethod = $(this).closest('[data-toggle="more-less-content"]').attr('data-strip-method');
				var stripValue = $(this).closest('[data-toggle="more-less-content"]').attr('data-strip-value');
				$(this).addClass('js-stripped');
				this.content = $(this).html();

				// Show or Hide More button
				if(this.content == "") {
					$(this).closest('[data-toggle="more-less-content"]').find('.more-link').hide();
				}
				else {
					$(this).closest('[data-toggle="more-less-content"]').find('.more-link').show();
				}

				if(stripMethod == "showStrippedOnly"){
					this.finalHTML = _GShowMoreContentModule.showStrippedOnly(this.content, stripValue);
				}
				else if(stripMethod == "byChar"){
					this.finalHTML = _GShowMoreContentModule.stripByChar(this.content, stripValue);
				}
				else if(stripMethod == "byWord"){
					this.finalHTML = _GShowMoreContentModule.stripByWords(this.content, stripValue);
				}

				if(this.finalHTML == this.content) {
					$(this).closest('[data-toggle="more-less-content"]').find('.more-link').hide();
				}
				$(this).html(this.finalHTML);
			}
			else {

			}
		});
	},
	showStrippedOnly : function(content, stripValue) {
		var removeHTMLTags = content.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,"").replace(/<!--[\s\S]*?-->/g,"");
		var strippedContent = removeHTMLTags.substr(0, stripValue);

		var newContent = '<div class="strippedContent">'+$.trim(strippedContent)+' '+this.ellipsestext+'</div>';
		return newContent;
	},
	stripByChar : function(content, stripValue) {
		//var strippedString = content.replace(/(<([^>]+)>)/ig,"");
		var strippedString = content.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,"").replace(/<!--[\s\S]*?-->/g,"");

		if(strippedString.length > stripValue) {
			var strippedContent = strippedString.substr(0, stripValue);
			var newContent = '<div class="strippedContent">'+$.trim(strippedContent)+' '+this.ellipsestext+'</div><div class="morecontent" style="display:none;">'+$.trim(content)+'</div>';
			return newContent;
		}
		return content;
	},
	stripByWords : function(content, stripValue) {
		//var strippedString = content.replace(/(<([^>]+)>)/ig,"");
		var strippedString = content.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,"").replace(/<!--[\s\S]*?-->/g,"");

		if(strippedString.split(' ').length > stripValue) {
			var cut = strippedString.indexOf(' ', stripValue);
			var strippedContent = strippedString.split(' ', stripValue).join(' ');
			var newContent = '<div class="strippedContent">'+$.trim(strippedContent)+' '+this.ellipsestext+'</div><div class="morecontent" style="display:none;">'+$.trim(content)+'</div>';
			return newContent;
		}
		return content;
	}
};

$('body').on('touchstart click','[data-toggle="more-less-content"] .more-link', function() {
	if($(this).hasClass("less")) {
		$(this).removeClass("less").find('span').text("more");
		$(this).closest('[data-toggle="more-less-content"]').find('.strippedContent').slideDown();
		$(this).closest('[data-toggle="more-less-content"]').find('.morecontent').slideUp();
	}
	else {
		$(this).addClass("less").find('span').text("less");
		$(this).closest('[data-toggle="more-less-content"]').find('.strippedContent').slideUp();
		$(this).closest('[data-toggle="more-less-content"]').find('.morecontent').slideDown();
	}

	return false;
});

/* = Bootstrap Growl Notification ===================*/
function showGNotification(resultObj, autoHide){
	showGNotification(resultObj, autoHide, true);
}

function showGNotification(resultObj, autoHide, showSuccess){
	var delayAmt = 4000, gMessage = "", gType = null;

	autoHide == true ? delayAmt = 4000 : delayAmt = 0;

	if(resultObj.kgresponse.kgResult == true && showSuccess==true) {
		gMessage = "Your request processed successfully.";
		gType = "success";
		initGNotification(gMessage, gType, delayAmt);
	}
	else if(resultObj.kgresponse.kgResult == false ) {
		gMessage = resultObj.kgresponse.kgResponseMessages;
		gType = "error";
		initGNotification(gMessage, gType, delayAmt);
	}
	else if(resultObj.kgresponse.kgResult) {
		gMessage = "No message"; gType = "info";
		//initGNotification(gMessage, gType, delayAmt);
	}
}

function initGNotification(gMessage, gType, delayAmt) {
	$.bootstrapGrowl(gMessage, {
		ele: 'body', // which element to append to
		type: gType, // (null, 'info', 'error', 'success', 'warning')
		offset: {from: 'bottom', amount: 50}, // 'top', or 'bottom'
		align: 'right', // ('left', 'right', or 'center')
		width: 300, // (integer, or 'auto')
		delay: delayAmt,
		allow_dismiss: true,
		stackup_spacing: 15 // spacing between consecutively stacked growls.
	});
}


/* = Form Validation Function ===================*/

var validOpt, formValidationModule = {
	forms : "form",
	init : function(settings){
		validOpt = settings;
		if( validOpt.formId == "" ) {
			this.forms = 'form';
		}
		else {
			this.forms = validOpt.formId;
		}
		this.applyValidation();
	},
	applyValidation : function() {

		$.validate({
			form : this.forms,
			validateOnBlur : false,
			addSuggestions : false,
			//scrollToTopOnError : true,
			onError : function($form) {
				//if( !$.formUtils.haltValidation ) {
				//alert('Invalid '+$form.attr('id'));
			//}
		}
	});
}
};

/*---------- Inline Overlay ----------*/
// Open Advanced Options Overlay
$('body').on('touchstart click', '.js-show-inline-overlay', function() {
	var overlayId = $(this).data('inline-overlayid');
	$('body').find('#'+overlayId).addClass('active');
	//G_initCustomScrollbar();
});
// Close Advanced Options Overlay
$('body').on('touchstart click', '.js-inline-overlay a.inline-overlay--close-overlay', function() {
	$(this).closest('.inline-overlay').removeClass('active');
});

/* = Summernote Set Editor content to Textarea on form submit ===================*/
var articleImgArray = [];
function setHTMLEditorCode() {
	$('.summernote').each(function(){
		var getHTML = $(this).code();
		var setHTML = $('<div class="content-unstyled">').append(getHTML);
		var removeStyle = setHTML.find('*').removeAttr('style id class');

// If Iframe extract content form it



		if(setHTML.find('img').length > 0) {
			setHTML.find('img').each(function(i) {
				$(this).attr('width', "").attr('height', "");
				var originalURL = $(this).attr('src');
				articleImgArray.push(originalURL);

				// Rename FileName
				var fileName = $(this).attr('src').split('/').pop(); // Get FileName
				var name = fileName.split('.')[0];
				var ext = fileName.split('.').pop();
				if(ext.indexOf('?') > -1) {
					ext = ext.split('?')[0];
				}
				var date = new Date();
				var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();

				var newName = name.replace(/\W+/g, '-').toLowerCase() + "_" + fullDate + "."+ ext;


				$(this).attr('data-src', '../database/uploads/images/article_images/'+ newName); // Keep Original URL in data- attributes
				$(this).attr('data-original-src', originalURL); // Keep Original URL in data- attributes

			});
		}
		else {
			articleImgArray.length = 0;
		}

		var unstyledHTML = removeStyle.closest('.content-unstyled').html();


		if(typeof unstyledHTML == 'undefined') {
			unstyledHTML = getHTML;
		}
		$(this).code(unstyledHTML);

	});
}

function selectText(element) {
	var doc = document
	, text = doc.getElementById(element)
	, range, selection
	;
	if (doc.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(text);
		range.select();
		} else if (window.getSelection) {
		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(text);
		selection.removeAllRanges();
		selection.addRange(range);
	}
}

function SaveToDisk(fileURL, fileName) {
	// for non-IE
	if (!window.ActiveXObject) {
		var save = document.createElement('a');
		save.href = fileURL;
		save.target = '_blank';
		save.download = fileName || 'unknown';

		var event = document.createEvent('Event');
		event.initEvent('click', true, true);
		save.dispatchEvent(event);
		(window.URL || window.webkitURL).revokeObjectURL(save.href);
	}

	// for IE
	else if ( !! window.ActiveXObject && document.execCommand)     {
		var _window = window.open(fileURL, '_blank');
		_window.document.close();
		_window.document.execCommand('SaveAs', true, fileName || fileURL)
		_window.close();
	}
}




$(document).ready(function() {

	// Fixed Multiple Bootstrap Model Error
	// Since confModal is essentially a nested modal it's enforceFocus method
	// must be no-op'd or the following error results
	// "Uncaught RangeError: Maximum call stack size exceeded"
	// But then when the nested modal is hidden we reset modal.enforceFocus
	var enforceModalFocusFn = $.fn.modal.Constructor.prototype.enforceFocus;

	$.fn.modal.Constructor.prototype.enforceFocus = function() {};

	$('.search-wrapper input[type=text]').val("");

	//initSummnerNoteEditor(300, 300); // Height and Minimum Height
	//$("pre.htmlCode").snippet("html", {style:"ide-codewarrior", showNum:true, clipboard:"js/ZeroClipboard.swf"});

	$('.setTagColor').colorpicker();
	$('.editTagColor').colorpicker();

	//G_initCustomScrollbar();
	$('.dropdown-toggle').dropdown();
	$('[data-toggle="tooltip"]').tooltip('hide')
	/*$('body .popover').popover({
		container : 'body',
		html: true
	});
	*/

	// Search Text Highlighter Plugin : FilteringHighlight.js
	//$('#txtSearch').filteringHighlight('#snippets-wrapper__list', 'filteringHighlight', 200);

	Mousetrap.bind('f12', function(e) {
		webkitWinModule.showDevTool();
		return false;
	});

	Mousetrap.bind('f5', function(e) {
		webkitWinModule.reloadWin();
		return false;
	});

});


$(function() {

	$(".top-edge").hover(
	function () {
		$('.app-controls').stop(true,true).slideDown('medium');
	},
	function () {
		$('.app-controls').stop(true,true).slideUp('medium');
	});

	setTimeout(function() {
		$('.app-controls').stop(true,true).slideUp('medium');
	}, 1000);

});

/* = Load External Template Files =============*/
/*
	function loadJSONTemplate(templatesPathObj) {

	//console.log(templatesPathObj);
	$.each(templatesPathObj.files, function(key, value) {

	if(value.filetype == "json") {

	$('head').append('<script type="text/javascript" src="'+value.path+'"><\/script>');
	}
	else if(value.filetype == "html") {
	console.log(value.path,value.container);
	$(value.container).load(value.path);

	$.ajax({
	url: value.path,
	type: 'GET',
	data : {},
	async : true,
	dataType: "html",
	success: function(data) {
	$('body #handlebars-templates-wrapper').append(data);
	console.log(" Loading HTML Files ...");
	}
	});
	}
	});
	}*/

	/* Partial Rendering =========
		// HTML Code
		<script type="text/x-handlebars-template" id="all-handlebar">
		{{#each tabs}}
		<div id=tab{{@index}}>{{this.text}}</div>
		{{/each}}
		<div id="tab-content">{{> tabContentPartial}}
		</script>
		<script type="text/x-handlebars-template" id="tab-content-partial">
		<div id="mycontent">
		<div id="text">{{mycontent.text}}</div>
		<div id="text">{{mycontent.image}}</div>
		</div>
		</script>
		<script type="text/javascript">
		source=$("#all-handlebar").html();
		var template = Handlebars.compile(source);
		Handlebars.registerPartial("tabContentPartial", $("#tab-content-partial").html())
		var context = {
		mycontent : {
		text="something that has to change everytime I click on a different tab",
		image="idem"
		};
		var html = template(context);
		$("body").html(html);
		</script>


		var source=$("#all-handlebar").html();
		var contentSrc=$("#tab-content-partial").html();
		var template = Handlebars.compile(source);
		var contentTemplate = Handlebars.compile(contentSrc);

		//because you already have a compiled version of your content template now you can pass this as partial
		Handlebars.registerPartial("tabContentPartial", contentTemplate);
		var context = {
		mycontent : {
		text : "something that has to change everytime I click on a different tab",
		image : "idem"
		}
		};

		var html = template(context);
		$("body").html(html);


		//Then at the time where you need to change the content you will just pass the data of the content to the content template and then replace the content of #tab-content with the new result. This way you could also create different content templates.
		//replace the content with the result of the template
		$("#tab-content").html( contentTemplate(newContent) );
		*/

// Function to remove iframes from github Code
function getIframecontent() {
  //var content = document.getElementById('test1'); // Give any Id to the parent container
  var content = document.querySelector('main .section-content > div:last-child'); // Give any Id to the parent container
  var iframes = document.querySelectorAll('iframe'); // Select all iFrame elements
  var figures = document.querySelectorAll('figure.graf--iframe'); // Select all iFrame parent Elements

  if(content) {
    if(iframes && iframes.length > 0) {
      // Loop through all the iFrames
      for(var i = 0, len = iframes.length; i < len; i++) {
        var contDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
        var iframeContent = contDoc.querySelector('table').innerText;

        var preNode = document.createElement('pre');
        var codeNode = document.createElement('code');

        codeNode.innerText = iframeContent;
        preNode.appendChild(codeNode);
        // replace all iFrame parent nodes with the new <pre> tags
        content.replaceChild(preNode, figures[i]);
      }

      console.log(content);
      //copytext(content.innerHTML);
      createCopyButton('main .section-content > div:last-child');
    }
  } else {
    alert("Please assign id to content wrapper.")
  }
}

//getIframecontent();

// Get content from embeded gists
function getGistContent() {
  var parent = document.querySelector('.entry-content');
  var gists = document.querySelectorAll('.gist');

  var scripts = parent.querySelectorAll('script');
  var styles = parent.querySelectorAll('link');

  if(parent) {
    if(gists && gists.length > 0) {
      // Loop through all the iFrames
      for(var i = 0, len = gists.length; i < len; i++) {
        var gistContent = gists[i].querySelector('table').innerText;

        var preNode = document.createElement('pre');
        var codeNode = document.createElement('code');

        codeNode.innerText = gistContent;
        preNode.appendChild(codeNode);
        // replace all iFrame parent nodes with the new <pre> tags
        parent.replaceChild(preNode, gists[i]);
        if(scripts[i].src.indexOf('github.com') > -1) {
            parent.removeChild(scripts[i]);
        }
        if(styles[i].href.indexOf('github.com') > -1) {
            parent.removeChild(styles[i]);
        }
      }

      console.log(parent);
      //copytext(content.innerHTML);
      createCopyButton('.entry-content');
    }
  } else {
    alert("Please assign id to content wrapper.")
  }
}

//getGistContent();

function getCodeFromTable() {
    var content = document.querySelector('div.entry-content');
    var tables = document.querySelectorAll('.crayon-syntax');

    if(tables && tables.length > 0) {
        for(var i = 0; i < tables.length; i++) {
            var tableContent = tables[i].querySelector('table td.crayon-code').innerText;
            var preNode = document.createElement('pre');
            var codeNode = document.createElement('code');

            codeNode.innerText = tableContent;
            preNode.appendChild(codeNode);
            // replace all iFrame parent nodes with the new <pre> tags
            content.replaceChild(preNode, tables[i]);

            console.log(tableContent);
        }
    }
};

//getCodeFromTable();

// Append button to copy data to Clipboard
function createCopyButton(parentId) {
  var button = document.createElement('button');
  button.innerText = "Copy Code";
  button.style.position = "relative";
  document.body.appendChild(button);
  // document.execCommand will work only inside event
  button.addEventListener('click', function() {
    var textVal = document.querySelector(parentId).innerHTML;
    textVal = textVal.replace(/“|”/g, '"').replace(/’/g, "'");
		copytext(textVal);
  });
}

// Copy To Clipboard : Method 1
function copytext(text) {
  var textField = document.createElement('textarea');
  textField.style.position = "relative";
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.focus();
  textField.select();
  var pp = document.execCommand('copy');
  console.log(pp);
  textField.remove();
}

// Copy To Clipboard : Method 2
function copyText2() {
	var urlField = document.querySelector('#test1');

	// create a Range object
	var range = document.createRange();
	// set the Node to select the "range"
	range.selectNode(urlField);
	// add the Range to the set of window selections
	window.getSelection().addRange(range);

	// execute 'copy', can't 'cut' in this case
	var tt = document.execCommand('copy');
	console.log(tt);
}
