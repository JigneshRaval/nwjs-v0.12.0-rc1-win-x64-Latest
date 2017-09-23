/*----------------------------------------------------
	START : Upload Images, Files Related Functions
------------------------------------------------------*/
//var imageData = {}, uploadFileObj;
var moduleUploadOpt, moduleUpload = {
	imageData : {},
	uploadFileObj : null,
	init : function(settings) {
		moduleUploadOpt = settings;
		console.log("moduleUploadOpt", moduleUploadOpt, this);
	},
	initUploadForm : function(container, url, isMultiple, isAutoSubmit, fileTypes) {		
		this.uploadFileObj = $(container).find("#fileuploader").uploadFile({
			url:url,
			method : "POST",
			multiple:isMultiple,
			autoSubmit:isAutoSubmit,
			allowedTypes : fileTypes,
			showFileCounter: true,
			showPreview : true,
			showDelete : true,
			showCancel :true,
			showProgress : true,
			nestedForms : true,
			dragDropStr: '<span class="ajax-upload-dragdrop-icon"><i class="ion-upload"></i></span><span class="ajax-upload-dragdrop-title titillium w500">Upload default image</span>',
			maxFileSize : 5242880, // 5 mb = 5242880 bytes
			fileName:"myfile",
			onLoad : function() {				
				moduleUpload.imageData.images = [];
				console.log("onLoad : File Uploader", moduleUpload.imageData.images);
			},
			//formData: { snippetId : $('#frmAddEditBookmark').find('#hdnBookmarkId').val() },
			onSelect:function(files) {
				moduleUploadOpt.selectedImagesLength = files.length;
				moduleUploadOpt.uploadObj = this;
				
				console.log("onSelect :: moduleUploadOpt", moduleUploadOpt, files);
				return true; //to allow file submission.
			},
			onSubmit:function(files) {
				console.log("on Files Submit", JSON.stringify(files), files[0]);
				console.log(files[0].split('.')[0]);
				moduleUpload.renameFiles(files[0].split('.')[0], files[0].split('.')[1]); // Filename, File Extention
			},
			onSuccess:function(files,data,xhr) {
				moduleUpload.imageData["images"].push(data.images[0]);
				console.log("onSuccess", files, moduleUpload.imageData["images"], JSON.stringify(data));
				//$.when(data).then(moduleUpload.updateImagesData(moduleUpload.imageData.images));
			},
			afterUploadAll:function() {
				console.log("afterUploadAll updating database entry ===", moduleUpload.imageData["images"]);
				moduleUpload.updateImagesData(moduleUpload.imageData.images);
			}
		});
	},
	renameFiles : function(fileName, ext) {
		var date = new Date();
		var fullDate = date.getDate() + "_" + (date.getMonth()+1) + "_" + date.getFullYear();
		console.log("Renaming File :", fileName, fullDate);
		var newName = fileName.replace(/\W+/g, '-').toLowerCase() + "_" + fullDate + "."+ ext;
		console.log("NEw Name :", newName);
		return newName;
	},
	// Update Database Records
	updateImagesData : function(imagesArray) {
		var uploadImageDataObj = {
			_id : moduleUploadOpt.dbId,
			images : imagesArray
		};
		
		commonAjaxCall(moduleUploadOpt.updateDBURL, uploadImageDataObj, "json", "POST", processUploadImages);
	},
	removeImage : function(imageName) {
		var removeImageDataObj = {
			_id : moduleUploadOpt.dbId,
			images : [imageName]
		};
		console.log("removeImage ==", moduleUploadOpt, removeImageDataObj);
		commonAjaxCall(moduleUploadOpt.removeDBURL, removeImageDataObj, "json", "POST", processRemoveImage);
	},	
	
};

function processUploadImages(resultObj) {
	console.log("processUploadImages", resultObj);
	$('body').find('.ajax-file-upload-statusbar').remove();

	moduleUpload.imageData.images.length = 0
	refreshView();
}	