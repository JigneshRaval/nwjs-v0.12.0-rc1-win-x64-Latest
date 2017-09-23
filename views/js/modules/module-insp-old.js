

/*====================================
	START : Snippet Module
======================================*/
var $selectizeLanguages, selectizeLanguagesControl;
var imageData = [];
var temp1 = {};
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

$(window).resize(function(e) {
	//$frame.sly('reload');
});

$(function() {
	
	moduleBookmarks.listCategories();
	moduleBookmarks.listAllInspirations('all');
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddEditInspirations'});
	formValidationModule.init({formId: '#frmUploadImages'});
	formValidationModule.init({formId: '#frmSnippetComments'});
	
	moduleUpload.init({
		selectedImagesLength : 0,
		dbId : "",
		updateDBURL : 'saveBMImagesData',
		removeDBURL : ''
	});
	moduleUpload.initUploadForm('#modalAddEditInspirations', "uploadInspirations", false, false, "jpg,png,gif,jpeg"); // container, url, isMultiple, isAutoSubmit, fileTypes
	
	initSummnerNoteEditor(200, 200); // Height and Minimum Height
});

function processUploadImages(resultObj) {
	console.log("processUploadImages", resultObj);
	$('.ajax-upload-dragdrop form').each(function(){
		//this.reset();
	});
	imageData.length = 0;
}

/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mBookmarkOpts, moduleBookmarks = {
	init : function(settings) {
		mBookmarkOpts = settings;
	},
	uploadImages : function(uploadFileObj) {
		var uploadImageDataObj = {
			//snippetId : $('#frmAddSnippet').find('#hdnSnippetId').val(),
			//myImages : $('#frmUploadImages #file').val()
		};
		
		uploadFileObj.startUpload();
	},
	updateImagesDataInDB : function(imagesArray) { // Not usint , Remove Later
		console.log("updateImagesDataInDB", imagesArray);
		var uploadImageDataObj = {
			snippetId : $('#frmAddEditInspirations #hdnInspirationsId').val(),
			images : imagesArray
		};
		commonAjaxCall('updateInspImagesData', uploadImageDataObj, "json", "POST", processUploadImages, false);
		
		setTimeout(function(){
			$('body').find('.ajax-file-upload-statusbar').remove();
		}, 3500);
	},
	removeImage : function(imageName, snippetDBId) {
		var removeImageDataObj = {
			snippetId : snippetDBId,
			imageName : imageName
		};
		commonAjaxCall('removeInspImage', removeImageDataObj, "json", "POST", processRemoveImage);
	},
	getURLDetails : function() {
		var bookmarkURLDataObj = {
			url : $('#frmAddEditInspirations').find('#txtBookmarkURL').val()
		};
		commonAjaxCall('getURLDetails', bookmarkURLDataObj, "json", "POST", processGetURLDetails);
	},
	
	uploadImageFromURL : function() {
		var imageURLDataObj = {};
		
		var $addEditBookmarkForm = $('#frmAddEditInspirations');
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
				imageURLDataObj.bmDBId = $addEditBookmarkForm.find('#hdnInspirationsId').val();
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
	
	listAllInspirations : function(categoryName) {
		// list by all, tag, category, date, title
		var listDataObj = {
			id : 1,
			category: categoryName
		};
		commonAjaxCall('listAllInspirations', listDataObj, "json", "POST", processListAllInspirations);
	},
	listFilteredBookmarks : function(listDataObj) {
		// list by all, tag, category, date, title
		commonAjaxCall('listFilteredBookmarks', listDataObj, "json", "POST", processListFilteredBookmarks);
	},
	addEditBookmark : function(imagesList) {
		// Setup form validation
		
		var $addEditBookmarkForm = $('#frmAddEditInspirations');
		var mode = $addEditBookmarkForm.find('#hdnMode').val();
		
		
		
		
		
		var addEditFormDataObj = {
			id : $addEditBookmarkForm.find('#hdnInspirationsId').val(),
			category: $addEditBookmarkForm.find('#optCategories').text(),
			categoryId : $addEditBookmarkForm.find('#optCategories').val(),
			tags : $addEditBookmarkForm.find('#txtBookmarkKeywords').val(),
			description : $addEditBookmarkForm.find('#txtareaBookmarkDescription').val(),
			isStarred : false,
			images : imagesList,
			dateCreated : new Date(),
			dateModified : new Date(),
			mode : mode
		};
		
		console.log("imagesList....", imagesList, addEditFormDataObj);
		commonAjaxCall('addEditInspirations', addEditFormDataObj, "json", "POST", processAddNewBookmark, false);
		
		setTimeout(function(){
			$('body').find('.ajax-file-upload-statusbar').remove();
		}, 3500);
		/* $.validate({
			onSuccess : function($form) {
			
			console.log("uploadFileObj", uploadFileObj, uploadFileObj.existingFileNames);
			
			if(mode == "add") {
			var imageObj = moduleBookmarks.checkDefaultImg();
			
			addEditFormDataObj.mode = "add";
			//addEditFormDataObj.images = imageObj.images[0];
			//addEditFormDataObj.imagePath = imageObj.imagePath;
			
			commonAjaxCall('addEditInspirations', addEditFormDataObj, "json", "POST", processAddNewBookmark, false);
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
			
			//commonAjaxCall('addEditInspirations', addEditFormDataObj, "json", "POST", processEditBookmark);
			return false;
			}
			
			}
		}); */
	},
	
	checkDefaultImg : function () {
		var $addEditBookmarkForm = $('#frmAddEditInspirations');
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
		$('#modalAddEditInspirations #hdnMode').val('edit');
		$('#modalAddEditInspirations #hdnSnippetId').val(bmDBId);
		$('#modalAddEditInspirations #imagePreview').attr('src', bmImage); // Set Image
		var mode = $('#modalAddEditInspirations #hdnMode').val();
		var editDataObj = {
			id : bmId,
			_id : bmDBId,
			dateModified : new Date(),
			mode : mode
		};
		commonAjaxCall('getBookmarkDetail', editDataObj, "json", "POST", processGetBookmarkToEdit);
		
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
	},
	
	listCategories : function() {
		var categoriesDataObj = {};
		commonAjaxCall('listBMCategories', categoriesDataObj, "json", "GET", processListCategories);
	},
	
	addCategory : function() {
		var catName = $('#frmAddNewCategory #txtAddCategory').val().toLowerCase();
		
		var categoriesDataObj = {
			category : catName
		};
		
		$.validate({
			onSuccess : function($form) {
				
				commonAjaxCall('addBMCategory', categoriesDataObj, "json", "POST", processAddNewCategory);
				return false;
			}
		});
	},
	
	editCategory : function() {
		var $inputCategory = $('#modalSettings #txtEditCategory');
		
		var categoryName = $inputCategory.attr('data-category');
		var categoryNewName = $('#modalSettings #txtEditCategory').val();
		var categoryId = $inputCategory.attr('data-category-id');
		
		
		
		var editCategoriesDataObj = {
			name : categoryName,
			cid : categoryId,
			newName : categoryNewName
		};
		commonAjaxCall('editBMCategory', editCategoriesDataObj, "json", "POST", processEditCategory);
	},
	
	deleteCategory : function(ele) {
		var catCID = $(ele).closest('li').attr('data-category-id');
		var delCategoryDataObj = {
			cid : catCID
		};
		commonAjaxCall('deleteBMCategory', delCategoryDataObj, "json", "POST", processDeleteCategory);
	}
}

$('body').on('click', '#btnUploadInspirations', function() {
	moduleBookmarks.uploadImages(uploadFileObj);
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

function processGetURLDetails(resultObj) {
	console.log("processGetURLDetails", resultObj);
	var $formBookmark =  $('#frmAddEditInspirations');
	$formBookmark.find('#txtBookmarkTitle').val(resultObj.title);
	$formBookmark.find('#txtBookmarkKeywords').val(resultObj.tags);
	$formBookmark.find('#txtareaBookmarkDescription').val(resultObj.description);
	if(resultObj.image && resultObj.image != "") {
		$formBookmark.find('.bookmark-default-image').show();
		$formBookmark.find('#imagePreview').attr('src', resultObj.image);
	}
	else {
		$formBookmark.find('.bookmark-default-image').hide();
		$formBookmark.find('.attachments-upload').show();
	}
}

function processUploadImageFromURL(resultObj) {
	console.log("processUploadImageFromURL", resultObj);
	$('#modalAddEditInspirations').modal('hide');
	initGNotification("Image has been updated successfuly.", "success", 4000);
	moduleBookmarks.listAllInspirations($('#optCategories option:selected').text());
}

function processRemoveImage(resultObj) {
	console.log("processRemoveImage", resultObj);
	moduleBookmarks.getSnippetDetail(resultObj.snippets[0]._id);
}

// List Snippets CallBack
function processListAllInspirations(resultObj) {
	console.log("process listAllInspirations....", resultObj);
	/* 
	$("#txtSearch").autocomplete({
		source:resultObj.bookmarks
	}); */
	
	GTemplateModule.init({templateId : "#inspirations-list-template", templateContainer : '#slick-data-wrapper', bindArea :'.slick-slider-content', dataObj : resultObj, partials : [] });
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#inspirations-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total);
			//destroyPagination("#holder-bookmarks");
			//initPagination(1, 6, "inspirations-wrapper__list", "#holder-bookmarks");
		}
	});
	
	$('.slick-slider-content').removeClass('slick-initialized');
	initSlick();

	$('.inspirations-wrapper__list li').each(function(index) {
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
	
	GTemplateModule.init({templateId : "#inspirations-list-template", templateContainer : '.inspirations-wrapper', bindArea :'.slick-slider-content', dataObj : resultObj, partials : [] });
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#inspirations-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total);
			//destroyPagination("#holder-bookmarks");
			//initPagination(1, 6, "inspirations-wrapper__list", "#holder-bookmarks");
		}
	});
	$('.inspirations-wrapper #basic .slidee').removeAttr('style'); // Reset Sly Slider width
	
	$('.inspirations-wrapper #basic .slidee-child').each(function(i) {
		$(this).width($('.inspirations-wrapper #basic').width());
	});
	
		
	$('.inspirations-wrapper__list li').each(function(index) {
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
		moduleBookmarks.listAllInspirations('all');
	}
	else {
		moduleBookmarks.listAllInspirations($('#optCategories option:selected').text());
	}
}

// Load snippets List on Category change
$('body').on('click', 'ul.panel-categories li a', function() {
	var categoryName = $(this).attr('data-category').toLowerCase();
	var categoryId = $(this).attr('data-category-id');
	moduleBookmarks.listAllInspirations(categoryName);
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
	
	resetForm('#frmAddEditInspirations');
	$('#modalAddEditInspirations').modal('hide');
	//moduleBookmarks.listSnippets($('#optSnippetCategory option:selected').text());
	if($('#optCategories option:selected').text() == "") {
		moduleBookmarks.listAllInspirations('all');
	}
	else {
		moduleBookmarks.listAllInspirations($('#optCategories option:selected').text());
	}
	
	moduleBookmarks.listCategories();
	initGNotification("New snippet has been added successfuly.", "success", 4000);
}

function processEditBookmark(resultObj) {
	console.log("Editing snippet...", resultObj);
	
	resetForm('#frmAddEditInspirations');
	$('#modalAddEditInspirations').modal('hide');
	if($('#optCategories option:selected').text() == "") {
		moduleBookmarks.listAllInspirations('all');
	}
	else {
		moduleBookmarks.listAllInspirations($('#optCategories option:selected').text());
	}
	moduleBookmarks.listCategories();
	initGNotification("Snippet has been updated successfuly.", "success", 4000);
}

// Edit Bookmark CallBack
function processGetBookmarkToEdit(resultObj) {
	console.log("processEditSnippet....", resultObj);
	resetForm('#frmAddEditInspirations');
	var $frm = $('#frmAddEditInspirations');
	
	populateWithoutPrefix($frm, resultObj.snippet[0]);
}

// Delete Snippet CallBack
function processDeleteBookmark(resultObj) {
	moduleBookmarks.listAllInspirations($('#hdnSelectedCategory').val());
	moduleBookmarks.listCategories();
}

$('.expand-icon-panel').on('click', function(){
	if(!$('body').hasClass('opened')){
		$('body').addClass('opened');
		//sly.reload();
		//sly.toStart();
	}
	else {
		$('body').removeClass('opened');
		//sly.reload();
		//sly.toStart();
	}
	
});

$('body').on('click', 'ul.panel-categories a', function() {
	var catName = $(this).attr('data-category');
	
	moduleBookmarks.listAllInspirations(catName);
});

$('body').on('click', 'a.lnkAddNew', function() {
	var $modal = $('#modalAddEditInspirations');
	$modal.modal('show');
	resetForm('#frmAddEditInspirations');
	$modal.find('#hdnMode').val('add');
	$modal.find('.bookmark-default-image').show();
});

// Search Functions
function clearSearch(ele) {
	$(ele).hide().closest('form').find('input[type="text"]').val("");
	moduleBookmarks.listAllInspirations($('#hdnSelectedCategory').val());
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

$('body').on('click', '#lightGallery .lnkRemoveImg', function() {
	var imageName = $(this).attr('data-image-name');
	var snippetDBId = $(this).closest('.snippets-wrapper__content').attr('data-snippet-id');
	
	moduleBookmarks.removeImage(imageName, snippetDBId)
});


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
	$('#modalAddEditInspirations').modal('show');
}

$('body').on('click', '#modalAddEditInspirations .lnkChangeDefaultImage', function() {
	$('#modalAddEditInspirations').find('.bookmark-default-image').hide().find('#imagePreview').attr('src', "");
	$('#modalAddEditInspirations').find('.attachments-upload').show();
});

$('body').on('click', '#modalAddEditInspirations .lnkChangeUploadImageURL', function() {
	$('#modalAddEditInspirations').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
});

/* 
function initUploadForm(container, url, isMultiple, isAutoSubmit, fileTypes) {
	uploadFileObj = $(container).find("#fileuploader").uploadFile({
		url:url,
		method : "POST",
		async: false,
		forceSync: true,
		multiple:isMultiple,
		autoSubmit:isAutoSubmit,
		allowedTypes : fileTypes,
		showPreview : true,
		showDelete : true,
		showCancel :true,
		showProgress : true,
		dragDropStr: '<span class="ajax-upload-dragdrop-icon"><i class="ion-upload"></i></span><span class="ajax-upload-dragdrop-title titillium w500">Upload default image for Bookmark</span>',
		maxFileSize : 5242880, // 5 mb = 5242880 bytes
		fileName:"myfile",
		formData: { snippetId : $('#frmAddEditInspirations').find('#hdnInspirationsId').val() },
		onSelect:function(files)
		{
			console.log("uploadFileObj", uploadFileObj);
			console.log($(this));
			//showImagePreview(input);
			files[0].name;
			return true; //to allow file submission.
		},
		onSubmit:function(files) {
			
			//temp1.images = JSON.stringify(files);
			console.log("onSubmit", temp1.images, files);
		},
		onSuccess:function(files,data,xhr) {
			//imageData.push(files);
			console.log("onSuccess", $(this), this, data, JSON.stringify(data));
			temp1.images = data.images;
			//moduleBookmarks.addEditBookmark(data.images);
			console.log("temp1.images", temp1, temp1.images);
		},
		afterUploadAll:function() {
			console.log("afterUploadAll", temp1.images);
			
			var mode = $('#frmAddEditInspirations').find('#hdnMode').val();
			moduleBookmarks.addEditBookmark(temp1.images);
		}
	});	
}
 */