/*====================================
	START : Snippet Module
======================================*/
var $selectizeLanguages, selectizeLanguagesControl;

var obj_assetPanel = {
	module : {
		name : "Snippets",
		urls : {
			listCat : 'listSnipCategories',
			addCat : 'addSnipCategory',
			editCat : 'editSnipCategory', 			
			delCat : 'deleteSnipCategory',
			listTag : 'listSnipTags',
			addTag : 'addSingleSnipTag',
			editTag : 'editSnipTag', 			
			delTag : 'deleteSnipTag',
			listAll : ['listSnippets', processListSnippets], // URL and CallBack
			addRecord : ['addSnippet', processAddEditRecord], // URL and CallBack
			getDetail : ['getSnipDetail', processGetDetail, false], // URL and CallBack, Populate Form : True/False
			deleteRec : ['deleteSnippets', processDeleteRecord],
			frmAddEdit : '#frmAddSnippet', 
			frmModal : '#modalAddSnippetForm'
		},
		controls : [
		{ name : "add", title : "Add New", id : "lnkAddNewRecord", icon : "ion-plus", hasPopover : false },
		{ name : "Favourites", title : "Favourites", id : "lnkViewStarredList", icon : "ion-star", hasPopover : false },
		{ name : "Add Category", title : "Add Category", id : "lnkAddCategory", icon : "ion-folder", hasPopover : true, addURL : "addSnipCategory", listURL : "listSnipCategories" },
		{ name : "Add Tag", title : "Add Tag", id : "lnkAddTag", icon : "ion-backspace", hasPopover : true, addURL : "addSingleSnipTag", listURL : "listSnipTags" },
		{ name : "Toggle View", title : "Toggle View", id : "lnkToggleView", icon : "ion-android-apps", hasPopover : false},
		{ name : "Refresh View", title : "Refresh View", id : "lnkReloadList", icon : "ion-android-refresh", hasPopover : false, listURL : "listSnippets"},
		]
	}
};

$(function() {
	moduleTags.listTags('listSnipTags');
	moduleCategories.listCat('listSnipCategories');
	
	// List snippets using web-workers
	//_mainModule.list('category', '');
	startWorker();
	w.postMessage({
		filterBy : 'category',
		filterValue : 'html'
	}); // Send data to our worker.
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddSnippet'});
	formValidationModule.init({formId: '#frmUploadImages'});
	formValidationModule.init({formId: '#frmSnippetComments'});
	
	buildLanguagesDrodown();
	moduleUpload.init({
		selectedImagesLength : 0,
		dbId : "",
		updateDBURL : 'saveSnipImagesData',
		removeDBURL : 'removeSnipImage'
	});
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#snippets-wrapper__list', {
		timeout: 500,
		callback: function(total) {
			
			var filterBy = $('#frmSearch input[type=radio]:checked').val();
			var filterValue = $('#txtSearch').val();
			
			if(filterValue != "") {
				_mainModule.list(filterBy, filterValue);
			}
			else {
			}
		}
	});
	
	setTimeout(function() {
		bindAssetPanelControlls(obj_assetPanel);
	}, 500);
});

/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mSnipOpts, moduleSnippets = {
	init : function(settings) {
		mSnipOpts = settings;
	},
	addSnippet : function() {
		// Setup form validation
		var $addSnippetForm = $('#frmAddSnippet');
		var mode = $addSnippetForm.find('#hdnMode').val();
		var description = $addSnippetForm.find('.summernote').code();
		
		var query_string = QueryStringToJSON($('#frmAddSnippet').serialize());
		
		
		if(description == '' && description == '<p><br></p>') {
			description = "";
		}
		
		description = description.replace(/<p><br><\/p>/gi, ""); // replace with [anythinganything]
		
		var addFormDataObj = {
			id : $addSnippetForm.find('#hdnSnippetId').val(),
			category: $addSnippetForm.find('#optCategories').text(),
			categoryId : $addSnippetForm.find('#optCategories').val(),
			title : $addSnippetForm.find('#txtSnippetTitle').val(),
			refSite : $addSnippetForm.find('#txtRefSite').val(),
			codes : [
			{code : $addSnippetForm.find('#txtareaCode1').val(), codeLanguage : $addSnippetForm.find('#optLanguages1').val()},
			{code : $addSnippetForm.find('#txtareaCode2').val(), codeLanguage : $addSnippetForm.find('#optLanguages2').val()},
			{code : $addSnippetForm.find('#txtareaCode3').val(), codeLanguage : $addSnippetForm.find('#optLanguages3').val()}
			],
			description : description,
			tags : $addSnippetForm.find('#txtTags').val(),
			isStarred : false,
			comments : [],
			images : [],
			articleImages : articleImgArray,
			note : $addSnippetForm.find('#txtareaNote').val(),
			dateCreated : new Date(),
			dateModified : new Date()
		};
		
		_mainModule.add(addFormDataObj);
	},
	editSnippet : function(snippetId, snippetDBId) {		
		obj_assetPanel.module.urls.getDetail[2] = true;
		_mainModule.getDetail(snippetDBId);		
	},
	addEditSnippetComment : function(snippetID, ele) {
		var $snippetCommentForm = $('#frmSnippetComments');
		var mode = $('#frmSnippetComments #hdnSnippetCommentMode').val();
		
		var snippetCommentDataObj = {
			snippetID : snippetID,
			description : $snippetCommentForm.find('#textareaSnippetComment').code(),
			author : "Jignesh Raval"
		};
		
		var noOfComments = $(ele).closest('.snippets-wrapper__footer').find('.comments-listing').find('li').length;
		if(noOfComments > 0) {
			noOfComments += 1;
		}
		else {
			noOfComments =1;
		}
		
		$.validate({
			onSuccess : function($form) {
				if(mode == "add") {
					snippetCommentDataObj.mode = "add";
					snippetCommentDataObj.commentId = noOfComments;
					snippetCommentDataObj.dateCreated = new Date();
					snippetCommentDataObj.dateModified = new Date();
					
					commonAjaxCall('addEditSnippetComment', snippetCommentDataObj, "json", "POST", processAddEditSnippetComment);
					return false;
				}
				else if(mode == "edit") {
					snippetCommentDataObj.mode = "edit";
					snippetCommentDataObj.commentId = $snippetCommentForm.find('#hdnSnippetCommentId').val();
					snippetCommentDataObj.dateModified = new Date();
					
					commonAjaxCall('addEditSnippetComment', snippetCommentDataObj, "json", "POST", processAddEditSnippetComment);
					return false;
				}
			}
		});
	},
	editComment : function(commentId, snippetDBId) {
		$('#frmSnippetComments #hdnSnippetCommentMode').val('edit');
		$('#frmSnippetComments #hdnSnippetCommentId').val(commentId);
		
		var mode = $('#frmSnippetComments #hdnSnippetCommentMode').val();
		
		var editCommentDataObj = {
			commentId : commentId,
			_id : snippetDBId,
			mode : mode
		};
		commonAjaxCall('editSnippetComment', editCommentDataObj, "json", "POST", processLoadSnippetCommentForEditing);
	},
	deleteComment : function(commentId, snippetDBId) {
		alertify.confirm("Are you sure you want to delete this comment?", function (e) {
			if (e) {
				var deleteCommentDataObj = {
					commentId : commentId,
					_id : snippetDBId
				};
				commonAjaxCall('deleteSnippetComment', deleteCommentDataObj, "json", "POST", processDeleteSnippetComment);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	}	
}

/*--------------------------------------
	START :: CallBacks
----------------------------------------*/
// Callback : List All Snippet 
function processListSnippets(resultObj) {
	//console.log("processListSnippets", resultObj);
	GTemplateModule.init({templateId : "#snippets-list-template", templateContainer : '.snippets-wrapper', bindArea :'.snippets-wrapper__list', dataObj : resultObj, partials : [] });
	
	$('#snippets-wrapper__list').paginate({
		itemsPerPage: 8,
		callback: function(page, numberOfPages) {
			$('#snippets-wrapper__list-goto-page').val(page);
			$('.custom-pagination-btns em').text(numberOfPages);
		}
	});
	
	
	$('.snippets-wrapper__list li:first').addClass('active');
	
	if(resultObj.records && resultObj.records.length > 0) {
		_mainModule.getDetail(resultObj.records[0]._id);
	}
	
	_GShowMoreContentModule.init({});
	
	$('.panel-left .count-total-categories').text(resultObj.categories.length);
	$('.panel-left .count-total-tags').text(resultObj.tags.length);

	stopWorker();
}

$('.snippets-wrapper__list').on('click', 'li input[type="checkbox"]', function(index) {
		//var $chkStarred =  $(this).find('input[type="checkbox"]');
		
		//$chkStarred.on('click',function() {
			var isStarred = $(this).prop('checked');
			var snippetId = $(this).attr('data-snippet-id');
			
			var favSnippetDataObj = {
				_id : snippetId,
				isStarred : isStarred
			};
			commonAjaxCall('starredSnippet', favSnippetDataObj, "json", "POST", processStarredSnippet);
//});
	});

// Callback : Get Selected Snippet Detail
function processGetDetail(resultObj) {

	if(obj_assetPanel.module.urls.getDetail[2] === true) {
		$('#hdnMode').val("edit");
		$('#modalAddSnippetForm').modal('show');
		populateForm(resultObj);
		obj_assetPanel.module.urls.getDetail[2] = false;
	}
	else {
		
		GTemplateModule.init({templateId : "#snippets-details-template", templateContainer : '.snippets-wrapper', bindArea :'.snippets-wrapper__detail', dataObj : resultObj, partials : [{partialName :"snippet-comments"}] });
		
		initLightGalleryWithImgZoom(); // Init Light Gallery with Image Zoom Functionality
		
		// Bind : Summernote HTML Editor
		initSummnerNoteEditor(200, 200); // Height and Minimum Height
		
		// Init Syntax Highlighting
		hljs.configure({
			languages : ["html","css", "javascript"]
		});
		
		$('pre, pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		});
		
		$('#lnkShowAttachments .circle').text($("#lightGallery").find('li').length);
		
		$('.snippets-wrapper__content img').each(function() {
			var localImgPath = $(this).attr('data-src');
			$(this).attr('src', localImgPath);
		});
		
		$('.snippets-wrapper__content article.content a').attr('target', "_blank").on('click', function(e) {
			e.preventDefault();
			var url = $(this).attr('href');
			var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
			
			if(valid !== true) {
				
			}
			else {
				$('.iframeURLBrowser').trigger('show_external_url', [url]);
			}
		});
		
		//G_initCustomScrollbar();
		
		//$('.js-scrollbar').mCustomScrollbar("update");
		// Show Tootips
		//$('[data-toggle="tooltip"]').tooltip('hide');
		
		moduleUpload.initUploadForm('.snippets-wrapper__detail', "snipUpload", true, false, "jpg,png,gif,jpeg,pdf,zip"); // container, url, isMultiple, isAutoSubmit, fileTypes
	}
}

function processStarredSnippet(resultObj) {
	
}

// Get Snippet Data for Editing
function populateForm(resultObj) {
	var $frm = $('#frmAddSnippet');
	
	populateWithoutPrefix($frm, resultObj.recordDetail[0]);
	
	var tagsArray = resultObj.recordDetail[0].tags.split(",");
	var finalTagsArray = [];
	
	var control = $selectizeTags[0].selectize;
	control.clear();
	control.setValue(tagsArray);
}

/*------------------------------------
	START :: Comments Management
--------------------------------------*/
// Add Comment CallBack
function processAddEditSnippetComment(resultObj) {
	$("#snipComments").html(partialTemplate(resultObj.records[0])); // Bind Partial Template
	
	$('.snippets-wrapper__detail').find('.comments-form-wrapper').slideUp();
	
	var $frm = $('#frmSnippetComments');
	var mode = $frm.find('#hdnSnippetCommentMode').val();
	var newCommentId = $("#snipComments").find('li').length
	newCommentId = newCommentId + 1;
	
	if(mode == "edit") {
		$frm.find('#textareaSnippetComment').code("");
		$frm.find('#hdnSnippetCommentMode').val("add");
		$frm.find('#hdnSnippetCommentId').val(newCommentId);
		initGNotification("Comment has been updated successfuly.", "success", 4000);
	}
	else if(mode == "add") {
		initGNotification("New comment has been added successfuly.", "success", 4000);
	}
}

// Load Comment Data For Editing
function processLoadSnippetCommentForEditing(resultObj) {
	$('.snippets-wrapper__detail').find('.comments-form-wrapper').slideDown();
	var $frm = $('#frmSnippetComments');
	
	//populateWithoutPrefix($frm, resultObj);
	$frm.find('#textareaSnippetComment').code(resultObj.comment.description);
	$frm.find('#hdnSnippetCommentMode').val("edit");
	$frm.find('#hdnSnippetCommentId').val(resultObj.comment.commentId);
}

// Delete Snippet Comment CallBack
function processDeleteSnippetComment(resultObj) {
	$("#snipComments").html( partialTemplate(resultObj.records[0]) );
}

$('body').on('click', '.snippets-wrapper__footer .lnkAddNewComment', function() {
	$('.comments-form-wrapper').slideDown();
});

$('body').on('click', '.lnkWriteSnippetComment', function() {
	$('.comments-form-wrapper').slideDown();
});

$('body').on('click', '.lnkCloseCommentForm', function() {
	$('.comments-form-wrapper').slideUp();
});

$('body').on('click', '.lnkShowCommentControls', function() {
	if(!$(this).closest('.comments-listing-description').hasClass('active')) {
		$('.comments-listing-description').removeClass('active');
		$(this).closest('.comments-listing-description').addClass('active');
	}
	else {
		$('.comments-listing-description').removeClass('active');
	}
});

/*------------------------------------
	START :: Tags Management
--------------------------------------*/
$('body').on('touchstart click', '.js-expand-collapse-wrapper .js-expand-collapse', function(e){
	
	var snippetId = $(this).closest('li').attr('data-snippet-id');
	_mainModule.getDetail(snippetId);
	
});
/*
$('body').on('click', '.snippets-wrapper__footer li > a', function() {
	if(!$(this).parent('li').hasClass('active')) {
		var tabIndex = $(this).parent('li').index();
		$(this).parent('li').addClass('active').siblings().removeClass('active');
		
		$(this).closest('ul').next('.snippets-wrapper__footer-content').find('section').removeClass('active');
		$(this).closest('ul').next('.snippets-wrapper__footer-content').find('section:eq('+tabIndex+')').addClass('active');
	}
	else {
		//$(this).parent('li').removeClass('active');
		//$(this).closest('ul').next('.snippets-wrapper__footer-content').find('section').removeClass('active');
	}
});
*/


/*------------------------------------
	START :: Image upload functions
--------------------------------------*/
function processRemoveImage(resultObj) {
	_mainModule.getDetail(resultObj.records[0]._id);
}

$('body').on('click', '.snippets-wrapper__footer .lnkShowUploadForm', function() {
	moduleUploadOpt.dbId = $(this).closest('.snippets-wrapper__content').attr('data-snippet-id'); // Get and Set Selected Item Id
	$('.attachments-upload, .attachments-preview').addClass('active');
});

$("body").on('click', '#startUpload', function() {
	moduleUpload.uploadFileObj.startUpload();
	var snippetId = $(this).closest('.snippets-wrapper__content').attr('data-snippet-id');
	setTimeout(function() {
		_mainModule.getDetail(snippetId);
	}, 2500);
});

$('body').on('click', '#lightGallery .lnkRemoveImg', function() {
	var imageName = $(this).attr('data-image-name');
	var snippetDBId = $(this).closest('.snippets-wrapper__content').attr('data-snippet-id');
	
	moduleUploadOpt.dbId = snippetDBId; // Get and Set Selected Item Id
	
	moduleUpload.removeImage(imageName);
});

$('#snippets-wrapper__list').on('click', 'div.item-controls .js-delete-snippet', function() {
	var snipDBId= $(this).attr('data-db-id');
	_mainModule.deleteRec({ _id : snipDBId});
});
$('#snippets-wrapper__list').on('click', 'div.item-controls .js-edit-snippet', function() {
	var snipDBId= $(this).attr('data-db-id');
	var snipId= $(this).attr('data-snippet-id');
	moduleSnippets.editSnippet(snipId, snipDBId);
});

function buildLanguagesDrodown() {
	var optionsHTML = ""
	$.each(snippetLanguagesJSON.languages, function(key,value){
		optionsHTML = optionsHTML + '<option value="'+value.language+'">'+value.title+'</option>';
	});
	$('.optLanguages').html(optionsHTML);
	$selectizeLanguages = $('.optLanguages').selectize({
	});
}

function initLightGalleryWithImgZoom() {
	// Bind LightBox Galley Plugins
	$("#lightGallery").lightGallery({
		selector : '#lightGallery li > div',
		counter : true,
		controls : true,
		enableTouch : true,  // Enables touch support
		enableDrag : true,  // Enables desktop mouse drag support
		closable : false,  //allows clicks on dimmer to close gallery
		currentPagerPosition : 'middle', // Position of selected thumbnail.
		onOpen : function(el) {
			$('#lightGallery > li').each(function(i) {
				var imgSrc = $(this).find('div').attr('data-src');
				$('#lightGallery-slider .lightGallery-slide:eq('+i+')').addClass('zoomer_wrapper').attr("data-image", imgSrc);
			});
			
			// Image Zoom Functionality
			var $this = this;
			var $lgGallery = $('#lightGallery-Gallery');
			
			$lgGallery.find('#lightGallery-zoomer').bind('click', function() {
				var index = parseInt($lgGallery.find("#lightGallery_counter_current").text());
				var $elZoomer = $lgGallery.find('.lightGallery-slide.current').find('.zoomer');
				
				index = index - 1;
				
				
				if($elZoomer.length > 0) {
					$lgGallery.find('.lightGallery-slide').eq(index).zoomer("destroy");
					$this.touch();
				}
				else {
					$lgGallery.find('.lightGallery-slide').eq(index).zoomer({
						controls: {
							postion : "top"
						}
					});
					
					$('.lightGallery').unbind('mousedown');
					$('.lightGallery').unbind('mouseup');
				}
				
			});
		},
		onSlideBefore : function(el) {
			/* My Changes ========*/
			var $lgGallery = $('#lightGallery-Gallery');
			
			if($lgGallery.find('.lightGallery-slide').find('.zoomer').length > 0) {
				$lgGallery.find('#lightGallery-zoomer').trigger('click');
			}
			else {
				
			}
		}
	});
}