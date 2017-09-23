/*====================================
	START : Snippet Module
======================================*/
var $selectizeLanguages, selectizeLanguagesControl;

$(function() {
	moduleTags.listTags('listInspTags');
	moduleCategories.listCat('listInspCategories');
	moduleInspirations.listAllInspirations('all');
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddEditInspirations'});
	formValidationModule.init({formId: '#frmUploadImages'});
	
	initSummnerNoteEditor(200, 200); // Height and Minimum Height
	
	moduleUpload.init({
		selectedImagesLength : 0,
		dbId : "",
		updateDBURL : 'saveInspImagesData',
		removeDBURL : ''
		});
	moduleUpload.initUploadForm('#modalAddEditInspirations', "inspirationsUpload", true, false, "jpg,png,gif,jpeg"); // container, url, isMultiple, isAutoSubmit, fileTypes
});
/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mInspirationOpts, moduleInspirations = {
	init : function(settings) {
		mInspirationOpts = settings;
	},
	
	getURLDetails : function() {
		var bookmarkURLDataObj = {
			url : $('#frmAddEditInspirations').find('#txtInspirationURL').val()
		};
		commonAjaxCall('getURLDetails', bookmarkURLDataObj, "json", "POST", function(data) {
			processGetURLDetails(data);
		});
	},
	
	listAllInspirations : function(categoryName) {
		// list by all, tag, category, date, title
		var listDataObj = {
			id : 1,
			category: categoryName
		};
		commonAjaxCall('listAllInspirations', listDataObj, "json", "POST", processListAllInspirations);
	},
	listFilteredInspirations : function(listDataObj) {
		// list by all, tag, category, date, title
		commonAjaxCall('listFilteredInspirations', listDataObj, "json", "POST", processListAllInspirations);
	},
	addEditInspiration : function() {
		var $addEditInspirationForm = $('#frmAddEditInspirations');
		var mode = $addEditInspirationForm.find('#hdnMode').val();
		
		var addEditFormDataObj = {
			id : $addEditInspirationForm.find('#hdnInspirationsId').val(),
			category: $addEditInspirationForm.find('#optCategories').text(),
			categoryId : $addEditInspirationForm.find('#optCategories').val(),
			tags : $addEditInspirationForm.find('#txtInspirationKeywords').val(),
			description : $addEditInspirationForm.find('#txtareaInspirationDescription').val(),
			isStarred : false,
			images : imagesList,
			dateCreated : new Date(),
			dateModified : new Date(),
			mode : mode
		};
		
		var imageObj = moduleInspirations.checkDefaultImg();
		
		console.log("imageObj ===", imageObj);
		if(imageObj.imagePath == "") {
			addEditFormDataObj.images = [];
			addEditFormDataObj.imagePath = "";
		}
		else {
			addEditFormDataObj.images = imageObj.images;
			addEditFormDataObj.imagePath = imageObj.imagePath;
		}
		
		console.log("addEditFormDataObj", addEditFormDataObj, moduleUpload.imageData, moduleUpload.imageData.length);
		
		$.validate({
			onSuccess : function($form) {
				if(mode == "add") {
					addEditFormDataObj.mode = "add";
					
					commonAjaxCall('addEditInspirations', addEditFormDataObj, "json", "POST", processAddNewInspiration);
					return false;
				}
				else if(mode == "edit") {
					addEditFormDataObj.mode = "edit";
					
					commonAjaxCall('addEditInspirations', addEditFormDataObj, "json", "POST", processEditInspiration);
					return false;
				}				
			}
		});
	},
	
	checkDefaultImg : function () {
		var $addEditInspirationForm = $('#frmAddEditInspirations');
		var imgURL = $('#modalAddEditInspirations').find('#uploadImageURL').val();
		var $imgPreview = $('#modalAddEditInspirations').find('#imagePreview');
		var defaultImagePath = "", filename, imgObj = {};
		
		if(imgURL == "" || imgURL == null) {
			defaultImagePath = $imgPreview.attr('src');
		}
		else {
			$imgPreview.attr('src', imgURL);
			defaultImagePath = $imgPreview.attr('src');
		}
		
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
	
	editInspiration : function(bmId, bmDBId, bmImage) {
		$('#modalAddEditInspirations #hdnMode').val('edit');
		$('#modalAddEditInspirations #hdnInspirationsId').val(bmDBId);
		$('#modalAddEditInspirations #imagePreview').attr('src', bmImage); // Set Image
		$('#modalAddEditInspirations #uploadImageURL').val(bmImage); // Set Image
		var mode = $('#modalAddEditInspirations #hdnMode').val();
		var editDataObj = {
			id : bmId,
			_id : bmDBId,
			dateModified : new Date(),
			mode : mode
		};
		commonAjaxCall('getInspirationsDetail', editDataObj, "json", "POST", processGetInspirationToEdit);
	},
	
	deleteInspiration : function(commentId, InspirationDBId, imageName) {
		alertify.confirm("Are you sure you want to delete this Inspiration?", function (e) {
			if (e) {
				var deleteDataObj = {
					id : commentId,
					_id : InspirationDBId,
					imageName : imageName
				};
				commonAjaxCall('deleteInspiration', deleteDataObj, "json", "POST", processDeleteInspiration);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	}
}

// Add Snippet CallBack
function processAddNewInspiration(resultObj) {
	console.log("processAddNewInspiration", resultObj);
	
	resetForm('#frmAddEditInspirations');
	$('#modalAddEditInspirations').modal('hide');
	moduleUploadOpt.dbId = resultObj.bookmarks._id;
	
	$.when( resultObj ).then(function() {
		refreshView();
		initGNotification("New Inspiration has been added successfully.", "success", 4000);
	});
}

function processEditInspiration(resultObj) {
	console.log("processEditInspiration ===", resultObj);
	
	resetForm('#frmAddEditInspirations');
	$('#modalAddEditInspirations').modal('hide');
	
	$.when( resultObj ).then(function() {
		refreshView();
		initGNotification("Inspiration has been updated successfully.", "success", 4000);
	});
}

$('body').on('click', '#btnUploadInspirations', function() {
	moduleUpload.uploadFileObj.startUpload();
});

$('#startUpload').on('click', function() {
	$('#startUpload').trigger('file-upload');
});
$('#startUpload').on('file-upload', function() {
	moduleUpload.uploadFileObj.startUpload();
});

// Edit Inspiration CallBack
function processGetInspirationToEdit(resultObj) {
	console.log("processGetInspirationToEdit....", resultObj);
	
	resetForm('#frmAddEditInspirations');
	var $frm = $('#frmAddEditInspirations');
	
	moduleUploadOpt.dbId = resultObj.inspirations[0]._id;
	
	populateWithoutPrefix($frm, resultObj.inspirations[0]);
}

// Delete Snippet CallBack
function processDeleteInspiration(resultObj) {
	moduleInspirations.listAllInspirations($('#hdnSelectedCategory').val());
	
	moduleTags.listTags('listInspTags');
	moduleCategories.listCat('listInspCategories');
}

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
	var $formInspiration =  $('#frmAddEditInspirations');
	if(resultObj.title && (resultObj.title !== undefined || resultObj.title != "")) {
		$formInspiration.find('#txtInspirationTitle').val(resultObj.title);
	}
	if(resultObj.tags && (resultObj.tags !== undefined || resultObj.tags != "")) {
		$formInspiration.find('#txtInspirationKeywords').val(resultObj.tags);
	}
	if(resultObj.description && (resultObj.description !== undefined || resultObj.description != "")) {
		$formInspiration.find('#txtareaInspirationDescription').val(resultObj.description);
	}
	if(resultObj.image && resultObj.image != "") {
		//$formInspiration.find('.bookmark-default-image').show();
		$('#modalAddEditInspirations #uploadImageURL').val(resultObj.image)
		$('#modalAddEditInspirations').find('#imagePreview').attr('src', resultObj.image);
	}
	else {
		//$formInspiration.find('.bookmark-default-image').hide();
		//$formInspiration.find('.attachments-upload').show();
	}
}


// List Snippets CallBack
function processListAllInspirations(resultObj) {
	console.log("processListAllInspirations....", resultObj);
		
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
		}
	});
	$('.slick-slider-content').removeClass('slick-initialized');
	initSlick()

	
	$('.inspirations-wrapper__list li').each(function(index) {
		var $chkStarred =  $(this).find('input[type="checkbox"]');
		
		$chkStarred.on('click',function() {
			var isStarred = $(this).prop('checked');
			var inspirationId = $(this).attr('data-bookmark-id');
			
			var favInspDataObj = {
				_id : inspirationId,
				isStarred : isStarred
			};
			commonAjaxCall('starredInspiration', favInspDataObj, "json", "POST", processStarredInspirations);
		});
	});
}

function processListFilteredInspirations(resultObj) {
	console.log("processListFilteredInspirations....", resultObj);
	
	GTemplateModule.init({templateId : "#inspirations-list-template", templateContainer : '.inspirations-wrapper', bindArea :'#basic .slidee', dataObj : resultObj, partials : [] });
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#inspirations-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total);
		}
	});
	
	$('.inspirations-wrapper__list li').each(function(index) {
		var $chkStarred =  $(this).find('input[type="checkbox"]');
		
		$chkStarred.on('click',function() {
			var isStarred = $(this).prop('checked');
			var inspirationId = $(this).attr('data-inspirations-id');
			
			var favInspDataObj = {
				_id : inspirationId,
				isStarred : isStarred
			};
			commonAjaxCall('starredInspiration', favInspDataObj, "json", "POST", processStarredInspirations);
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
	
	moduleInspirations.listFilteredInspirations(listDataObj);
});

function processStarredInspirations(resultObj) {
	console.log("processStarredInspirations", resultObj);
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	if($('#optCategories option:selected').text() == "") {
		moduleInspirations.listAllInspirations('all');
	}
	else {
		moduleInspirations.listAllInspirations($('#optCategories option:selected').text());
	}
}

// Load Inspirations List on Category change
$('body').on('click', 'ul.panel-categories li a', function() {
	var categoryName = $(this).attr('data-category').toLowerCase();
	var categoryId = $(this).attr('data-category-id');
	moduleInspirations.listAllInspirations(categoryName);
	$('#frmAddNewCategory #hdnSelectedCategory').val(categoryName);
	
	if(!$(this).closest('li').hasClass('active')) {
		$(this).closest('li').addClass('active').siblings('li').removeClass('active');
	}
	else {
		
	}
});



$('body').on('click', 'ul.panel-categories a', function() {
	var catName = $(this).attr('data-category');
	
	moduleInspirations.listAllInspirations(catName);
});

$('body').on('click', 'a.lnkAddNewInspiration', function() {
	var $modal = $('#modalAddEditInspirations');
	$modal.modal('show');
	resetForm('#frmAddEditInspirations');
	$modal.find('#hdnMode').val('add');
	$modal.find('#hdnInspirationsId').val(0);
	//$modal.find('.bookmark-default-image').show();
	//$modal.find('.attachments-upload').hide();
});

// Edit Inspiration Category
$('body').on('click', '#btnSaveEditaedCat', function() {
	moduleCategories.editCat('editInspCategory', 'listInspCategories');
});

// Edit Selected Tag
$('body').on('click', '#btnSaveEditaedTag', function() {
	moduleTags.editTag('editInspTag', 'listInspTags');
});

// Delete Selected Tag
$('body').on('click', '#modalSettings .lnkDeleteTag', function() {
	moduleTags.deleteTag($(this), 'deleteInspTag', 'listInspTags');
});

// List Snippets By Selected Tag
$('body').on('click', '.tags-wrapper a', function() {
	var listDataObj = {
		filterBy : 'tags',
		filterValue : $(this).attr('data-tag')
	};
	moduleInspirations.listFilteredInspirations(listDataObj);
});

// Search Functions
function clearSearch(ele) {
	$(ele).hide().closest('form').find('input[type="text"]').val("");
	moduleInspirations.listAllInspirations($('#hdnSelectedCategory').val());
}

$('body').on('click', '.inspirations-wrapper__footer li > a', function() {
	if(!$(this).parent('li').hasClass('active')) {
		var tabIndex = $(this).parent('li').index();
		$(this).parent('li').addClass('active').siblings().removeClass('active');
		
		$(this).closest('ul').next('.inspirations-wrapper__footer-content').find('section').removeClass('active');
		$(this).closest('ul').next('.inspirations-wrapper__footer-content').find('section:eq('+tabIndex+')').addClass('active');
	}
	else {
		//$(this).parent('li').removeClass('active');
		//$(this).closest('ul').next('.Inspirations-wrapper__footer-content').find('section').removeClass('active');
	}
});

$('body').on('click', '#modalAddEditInspirations .lnkChangeDefaultImage', function() {
	$('#modalAddEditInspirations').find('.bookmark-default-image').find('#imagePreview').attr('src', "");
	$('#modalAddEditInspirations #uploadImageURL').val("")
	//$('#modalAddEditInspirations').find('.attachments-upload').show();
});

$('body').on('click', '#modalAddEditInspirations .lnkChangeUploadImageURL', function() {
	$('#modalAddEditInspirations').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
});

// Key Board Events
// combinations
Mousetrap.bind(['ctrl+n', 'meta+n'], function(e) {
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

$('#modalAddEditInspirations').on('shown.bs.modal', function (e) {
	if($('#modalAddEditInspirations #hdnMode').val() == "add") {
		$('#modalAddEditInspirations').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
	}
	
	//moduleUpload.init('#modalAddEditInspirations', "bookmarkUpload", false, false, "jpg,png,gif,jpeg", 'saveInspImagesData', tempDBId); // container, url, isMultiple, isAutoSubmit, fileTypes, saveToDB CallBack, dbId
});

function refreshView() {
	if($('#optCategories option:selected').text() == "") {
		moduleInspirations.listAllInspirations('all');
	}
	else {
		moduleInspirations.listAllInspirations($('#optCategories option:selected').text());
	}
	
	moduleTags.listTags('listInspTags');
	moduleCategories.listCat('listInspCategories');
}