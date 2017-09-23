/*====================================
	START : Snippet Module
======================================*/
var $selectizeTags, selectizeTagsControl;
var $selectizeCategories, selectizeCategoriesControl;
var $selectizeLanguages, selectizeLanguagesControl;

var uploadFileObj;

var sly,
$frame = $('#basic'),
$wrap = $frame.parent(),
slyOpt = {
	horizontal: 1,
	itemNav: 'basic',
	smart: 1,
	activateOn: 'click',
	mouseDragging: 1,
	touchDragging: 1,
	releaseSwing: 1,
	startAt: 3,
	scrollBar: $wrap.find('.scrollbar'),
	scrollBy: 1,
	pagesBar: $wrap.find('.pages'),
	activatePageOn: 'click',
	speed: 300,
	elasticBounds: 1,
	easing: 'easeOutExpo',
	dragHandle: 1,
	dynamicHandle: 1,
	clickBar: 1,
	
	// Buttons
	prevPage: $wrap.find('.prevPage'),
	nextPage: $wrap.find('.nextPage')
	//prev: $wrap.find('.prevPage'),
	//next: $wrap.find('.nextPage')
}

$(function() {
	moduleCategories.listCat('listBMCategories');
	moduleBookmarks.listAllBookmarks('all');
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddEditBookmark'});
	formValidationModule.init({formId: '#frmUploadImages'});
	formValidationModule.init({formId: '#frmSnippetComments'});
	
	$('.setTagColor').colorpicker();
	$('.editTagColor').colorpicker();
	
	initUploadForm('#modalAddBookmarkForm', "bookmarkUpload", false, true, "jpg,png,gif,jpeg"); // container, url, isMultiple, isAutoSubmit, fileTypes
});

/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mBookmarkOpts, moduleBookmarks = {
	init : function(settings) {
		mBookmarkOpts = settings;
	},
	removeBMImage : function(imageName, snippetDBId) {
		var removeImageDataObj = {
			snippetId : snippetDBId,
			imageName : imageName
		};
		commonAjaxCall('removeBMImage', removeImageDataObj, "json", "POST", processRemoveImage);
	},
	getURLDetails : function() {
		var bookmarkURLDataObj = {
			url : $('#frmAddEditBookmark').find('#txtBookmarkURL').val()
		};
		commonAjaxCall('getURLDetails', bookmarkURLDataObj, "json", "POST", function(data) {
			processGetURLDetails(data);
		});
	},
	
	uploadImageFromURL : function() {
		var imageURLDataObj = {};
		
		var $addEditBookmarkForm = $('#frmAddEditBookmark');
		var mode = $addEditBookmarkForm.find('#hdnMode').val();
		var imgURL = $addEditBookmarkForm.find('#uploadImageURL').val();
		
		if(imgURL != "" || imgURL != null) {
			var $imgPreview = $addEditBookmarkForm.find('.bookmark-upload-image-url').find('#imagePreview');
			$imgPreview.attr('src', imgURL);
			
			if(mode == "add") {
				imageURLDataObj.mode = "add";
			}
			else if(mode == "edit") {
				imageURLDataObj.mode = "edit";
				imageURLDataObj.bmDBId = $addEditBookmarkForm.find('#hdnBookmarkId').val();
			}
			
			//if($imgPreview.attr('src') != "") { }
			var defaultImagePath = $imgPreview.attr('src');
			if(defaultImagePath.lastIndexOf('/') !== -1) {
				var filename = defaultImagePath.substring(defaultImagePath.lastIndexOf('/')+1);
				imageURLDataObj.images = [filename];
				imageURLDataObj.imagePath = defaultImagePath;
			}
			else {
				imageURLDataObj.images = [defaultImagePath];
				imageURLDataObj.imagePath = defaultImagePath;
			}
			
			commonAjaxCall('uploadImageFromURL', imageURLDataObj, "json", "POST", processUploadImageFromURL);
		}
		else {
			return false;
		}
	},
	
	listAllBookmarks : function(categoryName) {
		// list by all, tag, category, date, title
		var listDataObj = {
			id : 1,
			category: categoryName
		};
		commonAjaxCall('listAllBookmarks', listDataObj, "json", "POST", processListAllBookmarks);
	},
	listFilteredBookmarks : function(listDataObj) {
		// list by all, tag, category, date, title
		commonAjaxCall('listFilteredBookmarks', listDataObj, "json", "POST", processListFilteredBookmarks);
	},
	addEditBookmark : function() {
		var $addEditBookmarkForm = $('#frmAddEditBookmark');
		var mode = $addEditBookmarkForm.find('#hdnMode').val();
		
		var addEditFormDataObj = {
			id : $addEditBookmarkForm.find('#hdnBookmarkId').val(),
			url : $addEditBookmarkForm.find('#txtBookmarkURL').val(),
			title : $addEditBookmarkForm.find('#txtBookmarkTitle').val(),
			category: $addEditBookmarkForm.find('#optCategories').text(),
			categoryId : $addEditBookmarkForm.find('#optCategories').val(),
			keywords : $addEditBookmarkForm.find('#txtBookmarkKeywords').val(),
			description : $addEditBookmarkForm.find('#txtareaBookmarkDescription').val(),
			isStarred : false,
			comments : [],
			note : $addEditBookmarkForm.find('#txtareaNote').val(),
			dateCreated : new Date(),
			dateModified : new Date()
		};
		
		$.validate({
			onSuccess : function($form) {
				if(mode == "add") {
					var imageObj = moduleBookmarks.checkDefaultImg();
					
					addEditFormDataObj.mode = "add";
					addEditFormDataObj.images = imageObj.images[0];
					addEditFormDataObj.imagePath = imageObj.imagePath;
					
					commonAjaxCall('addEditBookmark', addEditFormDataObj, "json", "POST", processAddNewBookmark);
					return false;
				}
				else if(mode == "edit") {
					var imageObj = moduleBookmarks.checkDefaultImg();
					
					addEditFormDataObj.mode = "edit";
					if(imageObj.imagePath == "") {
						
					}
					else {
						addEditFormDataObj.images = imageObj.images[0];
						addEditFormDataObj.imagePath = imageObj.imagePath;
					}
					
					commonAjaxCall('addEditBookmark', addEditFormDataObj, "json", "POST", processEditBookmark);
					return false;
				}
				console.log("addEditFormDataObj", addEditFormDataObj);
			}
		});
	},
	
	checkDefaultImg : function () {
		var $addEditBookmarkForm = $('#frmAddEditBookmark');
		var imgURL = $addEditBookmarkForm.find('#uploadImageURL').val();
		var $imgPreview = $addEditBookmarkForm.find('#imagePreview');
		var defaultImagePath = "", filename, imgObj = {};
		
		if(imgURL == "" || imgURL == null) {
			defaultImagePath = $imgPreview.attr('src');
		}
		else {
			$imgPreview.attr('src', imgURL);
			defaultImagePath = $imgPreview.attr('src');
		}
		
		defaultImagePath = $imgPreview.attr('src');
		console.log("defaultImagePath", defaultImagePath);
		
		if(defaultImagePath != "" || defaultImagePath != null) {
			if(defaultImagePath.lastIndexOf('/') !== -1) {
				filename = defaultImagePath.substring(defaultImagePath.lastIndexOf('/')+1);
				imgObj["images"] = [filename];
				imgObj["imagePath"] = defaultImagePath;
			}
			else {
				imgObj["images"] = [defaultImagePath];
				imgObj["imagePath"] = defaultImagePath;
			}
		}
		return imgObj;
	},
	
	editBookmark : function(bmId, bmDBId, bmImage) {
		$('#modalAddBookmarkForm #hdnMode').val('edit');
		$('#modalAddBookmarkForm #hdnSnippetId').val(bmDBId);
		$('#modalAddBookmarkForm #imagePreview').attr('src', bmImage); // Set Image
		var mode = $('#modalAddBookmarkForm #hdnMode').val();
		var editDataObj = {
			id : bmId,
			_id : bmDBId,
			dateModified : new Date(),
			mode : mode
		};
		commonAjaxCall('editBookmark', editDataObj, "json", "POST", processGetBookmarkToEdit);
	},
	
	deleteBookmark : function(commentId, snippetDBId, imageName) {
		alertify.confirm("Are you sure you want to delete this snippet?", function (e) {
			if (e) {
				var deleteDataObj = {
					id : commentId,
					_id : snippetDBId,
					imageName : imageName
				};
				commonAjaxCall('deleteBookmark', deleteDataObj, "json", "POST", processDeleteBookmark);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	}
}

function processGetURLDetails(resultObj) {
	console.log("processGetURLDetails", resultObj);
	var $formBookmark =  $('#frmAddEditBookmark');
	$formBookmark.find('#txtBookmarkTitle').val(resultObj.title);
	$formBookmark.find('#txtBookmarkKeywords').val(resultObj.keywords);
	$formBookmark.find('#txtareaBookmarkDescription').val(resultObj.description);
	if(resultObj.image && resultObj.image != "") {
		$formBookmark.find('.bookmark-default-image').show();
		$formBookmark.find('#imagePreview').attr('src', resultObj.image);
	}
	else {
		//$formBookmark.find('.bookmark-default-image').hide();
		$formBookmark.find('.attachments-upload').show();
	}
}

function processUploadImageFromURL(resultObj) {
	console.log("processUploadImageFromURL", resultObj);
	$('#modalAddBookmarkForm').modal('hide');
	initGNotification("Image has been updated successfuly.", "success", 4000);
	moduleBookmarks.listAllBookmarks($('#optCategories option:selected').text());
}

function processRemoveImage(resultObj) {
	console.log("processRemoveImage", resultObj);
	moduleBookmarks.getSnippetDetail(resultObj.snippets[0]._id);
}

// List Snippets CallBack
function processListAllBookmarks(resultObj) {
	console.log("processListAllBookmarks....", resultObj);
	
	$("#txtSearch").autocomplete({
		source:resultObj.bookmarks
	});
	
	GTemplateModule.init({templateId : "#bookmarks-list-template", templateContainer : '.bookmarks-wrapper', bindArea :'#basic .slidee', dataObj : resultObj, partials : [] });
	
	GTemplateModule.init({templateId : "#bookmarks-list-template", templateContainer : '#slick-data-wrapper', bindArea :'.slick-test', dataObj : resultObj, partials : [] });
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#bookmarks-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total);
		}
	});
	
	$('.bookmarks-wrapper #basic .slidee').removeAttr('style'); // Reset Sly Slider width
	
	// Set Width of Each slide
	$('.bookmarks-wrapper #basic .slidee-child').each(function(i) {
		//$(this).width($('.bookmarks-wrapper #basic').width());
	});
	/* $('.slick-test').slick({
		dots: true,
		infinite: false,
	}); */
	setTimeout(function() {
		sly = new Sly($frame, slyOpt).init().destroy().init();
		sly.on('load', function (eventName) {
			console.log(eventName); // 'load'
			console.log(this.pos);  // Sly position object
			
		});
		sly.toStart();
	}, 500);
	
	$('.bookmarks-wrapper__list li').each(function(index) {
		var $chkStarred =  $(this).find('input[type="checkbox"]');
		
		$chkStarred.on('click',function() {
			var isStarred = $(this).prop('checked');
			var bookmarkId = $(this).attr('data-bookmark-id');
			
			var favBMDataObj = {
				_id : bookmarkId,
				isStarred : isStarred
			};
			commonAjaxCall('starredBookmark', favBMDataObj, "json", "POST", processStarredBookmarks);
		});
	});
}

function processListFilteredBookmarks(resultObj) {
	console.log("processListFilteredBookmarks....", resultObj);
	
	GTemplateModule.init({templateId : "#bookmarks-list-template", templateContainer : '.bookmarks-wrapper', bindArea :'#basic .slidee', dataObj : resultObj, partials : [] });
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#bookmarks-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total);
		}
	});
	$('.bookmarks-wrapper #basic .slidee').removeAttr('style'); // Reset Sly Slider width
	
	$('.bookmarks-wrapper #basic .slidee-child').each(function(i) {
		$(this).width($('.bookmarks-wrapper #basic').width());
	});
	
	sly.reload();    // Reload Sly
	sly.toStart();
	
	
	$('.bookmarks-wrapper__list li').each(function(index) {
		var $chkStarred =  $(this).find('input[type="checkbox"]');
		
		$chkStarred.on('click',function() {
			var isStarred = $(this).prop('checked');
			var bookmarkId = $(this).attr('data-bookmark-id');
			
			var favBMDataObj = {
				_id : bookmarkId,
				isStarred : isStarred
			};
			commonAjaxCall('starredBookmark', favBMDataObj, "json", "POST", processStarredBookmarks);
		});
	});
}

$('.lnkViewStarredList').on('click', function() {
	var categoryName = $('#frmAddNewCategory #hdnSelectedCategory').val();
	var filterBy = 'isStarred';
	var filterValue = 'true';
	
	var listDataObj = {
		category: categoryName,
		filterBy : filterBy,
		filterValue : filterValue
	};
	
	console.log(listDataObj);
	
	moduleBookmarks.listFilteredBookmarks(listDataObj);
});

function calculateContainerSize(){
	sly.reload();
	sly.toStart();
	var itemWidth = $frame.find('.slidee-child').width();
	
	sly.pos.end += $('.frame').width() - itemWidth; // = frame size - item size
	sly.rel.slideeSize = itemWidth;
	console.log('calculating', itemWidth, sly.pos.end, sly.rel.slideeSize)
}

function processStarredBookmarks(resultObj) {
	console.log("processStarredBookmarks", resultObj);
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	if($('#optCategories option:selected').text() == "") {
		moduleBookmarks.listAllBookmarks('all');
	}
	else {
		moduleBookmarks.listAllBookmarks($('#optCategories option:selected').text());
	}
}

// Load snippets List on Category change
$('body').on('click', 'ul.panel-categories li a', function() {
	var categoryName = $(this).attr('data-category').toLowerCase();
	var categoryId = $(this).attr('data-category-id');
	moduleBookmarks.listAllBookmarks(categoryName);
	$('#frmAddNewCategory #hdnSelectedCategory').val(categoryName);
	
	if(!$(this).closest('li').hasClass('active')) {
		$(this).closest('li').addClass('active').siblings('li').removeClass('active');
	}
	else {
		
	}
});

// Add Snippet CallBack
function processAddNewBookmark(resultObj) {
	console.log("Added new snippet...", resultObj);
	
	resetForm('#frmAddEditBookmark');
	$('#modalAddBookmarkForm').modal('hide');
	//moduleBookmarks.listSnippets($('#optSnippetCategory option:selected').text());
	if($('#optCategories option:selected').text() == "") {
		moduleBookmarks.listAllBookmarks('all');
	}
	else {
		moduleBookmarks.listAllBookmarks($('#optCategories option:selected').text());
	}
	
	//moduleBookmarks.listCategories();
	moduleCategories.listCat('listBMCategories');
	initGNotification("New snippet has been added successfuly.", "success", 4000);
}

function processEditBookmark(resultObj) {
	console.log("Editing snippet...", resultObj);
	
	resetForm('#frmAddEditBookmark');
	$('#modalAddBookmarkForm').modal('hide');
	if($('#optCategories option:selected').text() == "") {
		moduleBookmarks.listAllBookmarks('all');
	}
	else {
		moduleBookmarks.listAllBookmarks($('#optCategories option:selected').text());
	}
	//moduleBookmarks.listCategories();
	moduleCategories.listCat('listBMCategories');
	
	initGNotification("Snippet has been updated successfuly.", "success", 4000);
}

// Edit Bookmark CallBack
function processGetBookmarkToEdit(resultObj) {
	console.log("processEditSnippet....", resultObj);
	resetForm('#frmAddEditBookmark');
	var $frm = $('#frmAddEditBookmark');
	
	populateWithoutPrefix($frm, resultObj.snippet[0]);
}

// Delete Snippet CallBack
function processDeleteBookmark(resultObj) {
	moduleBookmarks.listAllBookmarks($('#hdnSelectedCategory').val());
	//moduleBookmarks.listCategories();
	moduleCategories.listCat('listBMCategories');
}

$('.expand-icon-panel').on('click', function(){
	if(!$('body').hasClass('opened')){
		$('body').addClass('opened');
		$('.bookmarks-wrapper #basic .slidee').removeAttr('style'); // Reset Sly Slider width
		
		$('.bookmarks-wrapper #basic .slidee-child').each(function(i) {
			$(this).width($('.bookmarks-wrapper #basic').width());
		});
		sly.reload();    // Reload Sly
		sly.toStart();
	}
	else {
		$('body').removeClass('opened');
		$('.bookmarks-wrapper #basic .slidee').removeAttr('style'); // Reset Sly Slider width
		
		$('.bookmarks-wrapper #basic .slidee-child').each(function(i) {
			$(this).width($('.bookmarks-wrapper #basic').width());
		});
		sly.reload();    // Reload Sly
		sly.toStart();
	}
	
});

$('body').on('click', 'ul.panel-categories a', function() {
	var catName = $(this).attr('data-category');
	
	moduleBookmarks.listAllBookmarks(catName);
});

$('a.lnkAddNewBookmark').on('click', function() {
	var $modal = $('#modalAddBookmarkForm');
	$modal.modal('show');
	resetForm('#frmAddEditBookmark');
	$modal.find('#hdnMode').val('add');
	$modal.find('.bookmark-default-image').show();
	$modal.find('.attachments-upload').hide();
});

// Search Functions
function clearSearch(ele) {
	$(ele).hide().closest('form').find('input[type="text"]').val("");
	moduleBookmarks.listAllBookmarks($('#hdnSelectedCategory').val());
}

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

$('body').on('click', '.snippets-wrapper__footer .lnkShowUploadForm', function() {
	$('.attachments-upload, .attachments-preview').addClass('active');
});

$('body').on('click', '#modalAddBookmarkForm .lnkChangeDefaultImage', function() {
	$('#modalAddBookmarkForm').find('.bookmark-default-image').hide().find('#imagePreview').attr('src', "");
	$('#modalAddBookmarkForm').find('.attachments-upload').show();
});

$('body').on('click', '#modalAddBookmarkForm .lnkChangeUploadImageURL', function() {
	$('#modalAddBookmarkForm').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
});

$(window).resize(function(e) {
	$frame.sly('reload');
});

// Image upload functions

// Update Database Records
function updateImagesData(imagesArray) {
	console.log("updateImagesData", imagesArray);
	var mode = $('#frmAddEditBookmark').find('#hdnMode').val();
	if(mode == 'edit') {
		var uploadImageDataObj = {
			snippetId : $('#frmAddEditBookmark #hdnBookmarkId').val(),
			images : imagesArray
		};
		commonAjaxCall('updateBMImagesData', uploadImageDataObj, "json", "POST", processUploadImages, false);
		
		setTimeout(function(){
			$('body').find('.ajax-file-upload-statusbar').remove();
		}, 3500);
	}
	else if(mode == 'add') {
		$('#frmAddEditBookmark').find('#imagePreview').attr('src', imageData.images);
	}
}

function processUploadImages(resultObj) {
	console.log("processUploadImages", resultObj);
	$('.ajax-upload-dragdrop form').each(function(){
		//this.reset();
	});
	imageData.length = 0;
}

// Key Board Events
// combinations
Mousetrap.bind(['ctrl+a', 'meta+a'], function(e) {
	if (e.preventDefault) {
		e.preventDefault();
		} else {
		// internet explorer
		e.returnValue = false;
	}
	_saveDraft();
});
function _saveDraft() {
	$('#modalAddBookmarkForm').modal('show');
}