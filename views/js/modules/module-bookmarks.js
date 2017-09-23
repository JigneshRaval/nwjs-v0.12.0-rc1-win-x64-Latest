/*====================================
	START : Snippet Module
======================================*/
var $selectizeLanguages, selectizeLanguagesControl;

var obj_assetPanel = {
	module : {
		name : "Bookmarks",
		urls : {
			listCat : 'listBMCategories',
			addCat : 'addBMCategory',
			editCat : 'editBMCategory',
			delCat : 'deleteBMCategory',
			listTag : 'listBMTags',
			addTag : 'addSingleBMTag',
			editTag : 'editBMTag',
			delTag : 'deleteBMTag',
			listAll : ['listAllBookmarks', processListAllBookmarks],
			addRecord : ['addEditBookmark', processAddEditRecord],
			getDetail : ['getBookmarkDetail', processGetDetail, false],
			deleteRec : ['deleteBookmark', processDeleteRecord],
			frmAddEdit : '#frmAddEditBookmark',
			frmModal : '#modalAddBookmarkForm'
		},
		controls : [
		{ name : "add", title : "Add New", id : "lnkAddNewRecord", icon : "ion-plus", hasPopover : false },
		{ name : "Favourites", title : "Favourites", id : "lnkViewStarredList", icon : "ion-star", hasPopover : false },
		{ name : "Add Category", title : "Add Category", id : "lnkAddCategory", icon : "ion-folder", hasPopover : true, addURL : "addBMCategory", listURL : "listBMCategories" },
		{ name : "Add Tag", title : "Add Tag", id : "lnkAddTag", icon : "ion-backspace", hasPopover : true, addURL : "addSingleBMTag", listURL : "listBMTags" },
		{ name : "Toggle View", title : "Toggle View", id : "lnkToggleView", icon : "ion-android-apps", hasPopover : false},
		{ name : "Refresh View", title : "Refresh View", id : "lnkReloadList", icon : "ion-android-refresh", hasPopover : false, listURL : "listAllBookmarks"},
		]
	}
};

$(function() {
	moduleTags.listTags('listBMTags');
	moduleCategories.listCat('listBMCategories');
	_mainModule.list('category', '');
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddEditBookmark'});
	formValidationModule.init({formId: '#frmUploadImages'});
	formValidationModule.init({formId: '#frmSnippetComments'});
	
	initSummnerNoteEditor(200, 200); // Height and Minimum Height
	
	moduleUpload.init({
		selectedImagesLength : 0,
		dbId : "",
		updateDBURL : 'saveBMImagesData',
		removeDBURL : ''
	});
	
	moduleUpload.initUploadForm('#modalAddBookmarkForm', "bookmarkUpload", false, false, "jpg,png,gif,jpeg"); // container, url, isMultiple, isAutoSubmit, fileTypes
	
	setTimeout(function() {
		bindAssetPanelControlls(obj_assetPanel);
	}, 1000);
});
/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mBookmarkOpts, moduleBookmarks = {
	init : function(settings) {
		mBookmarkOpts = settings;
	},
	
	getURLDetails : function() {
		var bookmarkURLDataObj = {
			url : $('#frmAddEditBookmark').find('#txtBookmarkURL').val()
		};
		commonAjaxCall('getURLDetails', bookmarkURLDataObj, "json", "POST", function(data) {
			processGetURLDetails(data);
		});
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
			tags : $addEditBookmarkForm.find('#txtTags').val(),
			description : $addEditBookmarkForm.find('#txtareaBookmarkDescription').val(),
			isStarred : false,
			comments : [],
			note : $addEditBookmarkForm.find('#txtareaNote').val(),
			dateCreated : new Date(),
			dateModified : new Date()
		};
		
		var imageObj = moduleBookmarks.checkDefaultImg();
		
		if(imageObj.imagePath == "") {
			addEditFormDataObj.images = [];
			addEditFormDataObj.imagePath = "";
		}
		else {
			addEditFormDataObj.images = imageObj.images;
			addEditFormDataObj.imagePath = imageObj.imagePath;
		}
		
		_mainModule.add(addEditFormDataObj);
	},
	
	checkDefaultImg : function () {
		var $addEditBookmarkForm = $('#frmAddEditBookmark');
		var imgURL = $('#modalAddBookmarkForm').find('#uploadImageURL').val();
		var $imgPreview = $('#modalAddBookmarkForm').find('#imagePreview');
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
				var renameFile = filename.split('.')[0];
				var fileExt = filename.split('.')[1];
				
				renameFile = renameFile.replace(/[^\w\s]/gi, "_"); // Rename file and remove all the other characters which are not word, digit, whitespace
				imgObj["images"] = [renameFile + '.' + fileExt];
				imgObj["imagePath"] = defaultImagePath;
			}
			else {
				imgObj["images"] = [defaultImagePath];
				imgObj["imagePath"] = defaultImagePath;
			}
		}
		
		console.log("imgObj", imgObj, renameFile);
		return imgObj;
	},
	
	editBookmark : function(bmId, bmDBId, bmImage) {
		obj_assetPanel.module.urls.getDetail[2] = true;
		_mainModule.getDetail(bmDBId);
	}
}

$('#startUpload').on('click', function() {
	$('#startUpload').trigger('file-upload');
});

$('#startUpload').on('file-upload', function() {
	moduleUpload.uploadFileObj.startUpload();
});


// Edit Bookmark CallBack
function processGetDetail(resultObj) {
	console.log("processGetDetail", resultObj);
	
	var bmDBId = resultObj.recordDetail[0]._id;
	
	if(obj_assetPanel.module.urls.getDetail[2] === true) {
		$('#hdnMode').val("edit");
		$('#modalAddBookmarkForm #hdnBookmarkId').val(bmDBId);
		$('#modalAddBookmarkForm #imagePreview').attr('src', resultObj.recordDetail[0].imagePath); // Set Image
		$('#modalAddBookmarkForm #uploadImageURL').val(resultObj.recordDetail[0].imagePath); // Set Image
		$('#modalAddBookmarkForm').modal('show');
		
		populateForm(resultObj);
		obj_assetPanel.module.urls.getDetail[2] = false;
	}
	else {
		
	}
}

function populateForm(resultObj) {
	console.log("processEditSnippet....", resultObj);
	resetForm('#frmAddEditBookmark');
	var $frm = $('#frmAddEditBookmark');
	
	moduleUploadOpt.dbId = resultObj.recordDetail[0]._id;
	
	populateWithoutPrefix($frm, resultObj.recordDetail[0]);
	
	var tagsArray = resultObj.recordDetail[0].tags.split(",");
	
	var control = $selectizeTags[0].selectize;
	control.clear();
	control.setValue(tagsArray);
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
	var $formBookmark =  $('#frmAddEditBookmark');
	if(resultObj.title && (resultObj.title !== undefined || resultObj.title != "")) {
		$formBookmark.find('#txtBookmarkTitle').val(resultObj.title);
	}
	if(resultObj.tags && (resultObj.tags !== undefined || resultObj.tags != "")) {
		$formBookmark.find('#txtTags').val(resultObj.tags);
	}
	if(resultObj.description && (resultObj.description !== undefined || resultObj.description != "")) {
		$formBookmark.find('#txtareaBookmarkDescription').val(resultObj.description);
	}
	if(resultObj.image && resultObj.image != "") {
		//$formBookmark.find('.bookmark-default-image').show();
		$('#modalAddBookmarkForm #uploadImageURL').val(resultObj.image)
		$('#modalAddBookmarkForm').find('#imagePreview').attr('src', resultObj.image);
	}
	else {
		//$formBookmark.find('.bookmark-default-image').hide();
		//$formBookmark.find('.attachments-upload').show();
	}
}


// List Snippets CallBack
function processListAllBookmarks(resultObj) {
	console.log("processListAllBookmarks....", resultObj);
	
	GTemplateModule.init({templateId : "#bookmarks-list-template", templateContainer : '#slick-data-wrapper', bindArea :'.slick-slider-content', dataObj : resultObj, partials : [] });
	
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
	
	$('.slick-slider-content').removeClass('slick-initialized');
	
	initSlick();
	
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

function processStarredBookmarks(resultObj) {
	console.log("processStarredBookmarks", resultObj);
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	if($('#optCategories option:selected').text() == "") {
		_mainModule.list('category', '');
	}
	else {
		_mainModule.list('category', $('#optCategories option:selected').text());
	}
}

/*------------------------------------
	START :: Tags Management
--------------------------------------*/
$('body').on('click', '.snippets-wrapper__footer li > a', function() {
	if(!$(this).parent('li').hasClass('active')) {
		var tabIndex = $(this).parent('li').index();
		$(this).parent('li').addClass('active').siblings().removeClass('active');
		
		$(this).closest('ul').next('.snippets-wrapper__footer-content').find('section').removeClass('active');
		$(this).closest('ul').next('.snippets-wrapper__footer-content').find('section:eq('+tabIndex+')').addClass('active');
	}
	else {
		
	}
});

$('body').on('click', '#modalAddBookmarkForm .lnkChangeDefaultImage', function() {
	$('#modalAddBookmarkForm').find('.bookmark-default-image').find('#imagePreview').attr('src', "");
	$('#modalAddBookmarkForm #uploadImageURL').val("");
});

$('body').on('click', '#modalAddBookmarkForm .lnkChangeUploadImageURL', function() {
	$('#modalAddBookmarkForm').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
});

$('#modalAddBookmarkForm').on('shown.bs.modal', function (e) {
	if($('#modalAddBookmarkForm #hdnMode').val() == "add") {
		$('#modalAddBookmarkForm').find('.bookmark-upload-image-url').find('#imagePreview').attr('src', "");
	}
});