/*-----------------------------------------
	Main Module
-------------------------------------------*/

var _moduleOpts, _mainModule = {
	init : function(settings) {
		_moduleOpts = settings;
	},
	add : function(formData) {
		var mode = $('#hdnMode').val();
		//console.log("mode", mode);
		$.validate({
			onSuccess : function($form) {
				if(mode == "add") {
					formData.mode = "add";
				}
				else if(mode == "edit") {
					formData.mode = "edit";
				}

				commonAjaxCall(obj_assetPanel.module.urls.addRecord[0], formData, "json", "POST", obj_assetPanel.module.urls.addRecord[1]);
				return false;
			}
		});
	},
	getDetail : function(recordId) {
		var getDetailObj = {
			recordId : recordId
		};

		commonAjaxCall(obj_assetPanel.module.urls.getDetail[0], getDetailObj, "json", "POST", obj_assetPanel.module.urls.getDetail[1]);
	},
	deleteRec : function(deleteDataObj) {
		alertify.confirm("Are you sure you want to delete this record?", function (e) {
			if (e) {
				commonAjaxCall(obj_assetPanel.module.urls.deleteRec[0], deleteDataObj, "json", "POST", obj_assetPanel.module.urls.deleteRec[1]);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	},
	list : function(filterBy, filterValue) {
		var listDataObj = {
			filterBy : filterBy,
			filterValue : filterValue,
			isGroupBy : false,
			groupBy : ''
		};

		commonAjaxCall(obj_assetPanel.module.urls.listAll[0], listDataObj, "json", "POST", obj_assetPanel.module.urls.listAll[1]);
	}
};

// Add or Edit Snippet CallBack

function processAddEditRecord(resultObj) {

	$.when(resultObj).then(function() {
		//moduleUploadOpt.dbId = resultObj.bookmarks._id;
		resetForm(obj_assetPanel.module.urls.frmAddEdit); // Reset Form

		$(obj_assetPanel.module.urls.frmModal).modal('hide'); // Hide Modal Form

		refreshView(); // Refresh List view, Tags and Categories

		if($('#hdnMode').val() == "add") {
			initGNotification("New "+obj_assetPanel.module.name+" has been added successfully.", "success", 4000);
		}
		else if($('#hdnMode').val() == "edit") {
			initGNotification(obj_assetPanel.module.name+" has been updated successfully.", "success", 4000);
		}
	});

}

// Callback : Delete Main Record
function processDeleteRecord(resultObj) {
	_mainModule.list('category', $('#hdnSelectedCategory').val());

	// List all Tags
	moduleTags.listTags(obj_assetPanel.module.urls.listTag);

	// List all Categories
	moduleCategories.listCat(obj_assetPanel.module.urls.listCat);
}

// Refresh List view, Tags and Categories
function refreshView() {
	if($('#optCategories option:selected').text() == "") {
		_mainModule.list('category', '');
	}
	else {
		if($('#txtSearch').val() !== "") {
			var filterBy = $('#frmSearch input[type=radio]:checked').val();
			_mainModule.list(filterBy, $('#txtSearch').val());
		} else {
			_mainModule.list('category', $('#optCategories option:selected').text());
		}
	}
	//_mainModule.list('category', '');
	// List all Tags
	moduleTags.listTags(obj_assetPanel.module.urls.listTag);

	// List all Categories
	moduleCategories.listCat(obj_assetPanel.module.urls.listCat);
}

/*=========================================
	On Click Functions
===========================================*/
// Show all Favourite Records ( List Starred Records )
$('body').on('click', '#lnkViewStarredList', function(e) {
	e.stopPropagation();
	_mainModule.list('isStarred', 'true');
});

// Open Add/Edit From in Modal
$('body').on('click', '#lnkAddNewRecord', function() {
	var control = $selectizeTags[0].selectize;
	control.clear();

	$('#hdnMode').val('add');

	$(obj_assetPanel.module.urls.frmModal).modal('show');	// Open Modal

	resetForm(obj_assetPanel.module.urls.frmAddEdit); // Clear form
});

// Load Records on Category Click
$('ul.panel-categories').on('click', 'li a', function() {
	var categoryName = $(this).attr('data-category').toLowerCase();
	var categoryId = $(this).attr('data-category-id');

	$('#frmAddNewCategory #hdnSelectedCategory').val(categoryName);

	//_mainModule.list('category', categoryName);
	startWorker();
	w.postMessage({
		filterBy : 'category',
		filterValue : categoryName
	}); // Send data to our worker.

	if(!$(this).closest('li').hasClass('active')) {
		$(this).closest('li').addClass('active').siblings('li').removeClass('active');
	}
	else {

	}
});

// List Records on Click of Tag
$('.tags-wrapper').on('click', 'a', function() {
	//_mainModule.list('tags', $(this).attr('data-tag'));
	startWorker();
	w.postMessage({
		filterBy : 'tags',
		filterValue : $(this).attr('data-tag')
	}); // Send data to our worker.
});

// Search Functions
function clearSearch(ele) {
	$(ele).hide().closest('form').find('input[type="text"]').val("");
	_mainModule.list('category', 'css');
}

// Key Board Events
// combinations
Mousetrap.bind(['ctrl+n', 'meta+n'], function(e) {
	if (e.preventDefault) {
		e.preventDefault();
		} else {
		// internet explorer
		e.returnValue = false;
	}
	_opanAddEditModal();
});

function _opanAddEditModal() {
	$(obj_assetPanel.module.urls.frmModal).modal('show');
}


function QueryStringToJSON(queryString) {
    var pairs = queryString.split('&');

    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
	});

    return JSON.parse(JSON.stringify(result));
}
