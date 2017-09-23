/*---------------------------------------
	START : Tags Functions
-----------------------------------------*/
var $selectizeTags, selectizeTagsControl;

$(function() {
	formValidationModule.init({formId: '#frmAddNewTag'});

	$('.setTagColor').colorpicker();
	$('.editTagColor').colorpicker();
});
/*---------------------------------------
	START : Tags Management Module
-----------------------------------------*/
var moduleTags = {
	listTags : function(url) {
        var tagsDataObj = {};
        commonAjaxCall(url, tagsDataObj, "json", "GET", processListTags);
	},
    addSingleTag : function(url, listURL) {
        var singleTagDataObj = {
            tagName : $('#txtAddTag').val(),
            tagColor : $('#txtTagColor').val()
		};
        $.validate({
            onSuccess : function($form) {
                commonAjaxCall(url, singleTagDataObj, "json", "POST", function(data) {
					processAddSingleTag(data, listURL);
				});
                return false;
			}
		});
	},
    editTag : function(url, listURL) {
        var $inputEditTag = $('#frmEditTag #txtEditTag');

        var tagName = $inputEditTag.attr('data-tag');
        var tagNewName = $('#frmEditTag #txtEditTag').val();
        var tagId = $inputEditTag.attr('data-tag-id');
        var tagColor = $('#frmEditTag #txtEditTagColor').val();


        var editTagDataObj = {
            tagName : tagName,
            cid : tagId,
            newName : tagNewName,
            tagColor : tagColor
		};
        commonAjaxCall(url, editTagDataObj, "json", "POST", function(data) {
			processEditTag(data, listURL);
		});
	},
    deleteTag : function(ele, url, listURL) {
        var tagCID = $(ele).closest('li').attr('data-tag-id');
        var delTagDataObj = {
            cid : tagCID
		};
		//console.log("delTagDataObj", delTagDataObj);
        commonAjaxCall(url, delTagDataObj, "json", "POST", function(data) {
			processDeleteTag(data, listURL);
		});
	}
};

var eventHandler = function(name) {
    return function() {
      //  console.log(name, arguments);
	};
};

/*---------------------------------------
	START : Tags Management Callback Functions
-----------------------------------------*/
function processListTags(resultObj) {
	//console.log("processListTags", resultObj);

	var tagsArray = [];
	$.each(resultObj.tags, function(key,value) {
		tagsArray.push(value);
	});

	initSelectize.init({selectId : '#txtTags', delimiter : ',', data : tagsArray});

	// Bind Tags Template
	GTemplateModule.init({templateId : "#tags-list-template", templateContainer : '#tags', bindArea :'.tags-wrapper', dataObj : resultObj, partials : [] });

	GTemplateModule.init({templateId : "#manage-tags-list-template", templateContainer : '#modalSettings', bindArea :'.manage-tags-listing', dataObj : resultObj, partials : [] });

	$("#holder-tags").jPages({
		containerID  : "manage-tags__listing",
		perPage      : 10,
		startPage    : 1,
		startRange   : 1,
		midRange     : 5,
		endRange     : 1,
		keyBrowse   : true,
		first       : "first",
		last        : "last",
		animation   : "fadeInUp", //"bounceInUp",
		scrollBrowse   : false
	});

}

function processAddSingleTag(resultObj, listURL) {
	moduleTags.listTags(listURL);
	addNewTagToDropdown(resultObj);
	resetForm('#frmAddNewTag');
}

function processEditTag(resultObj, listURL) {
	moduleTags.listTags(listURL);

	var $inputTag = $('#frmEditTag #txtEditTag');

	var tagName = $inputTag.attr('data-tag');
	var tagNewName = $('#frmEditTag #txtEditTag').val();
	var tagId = $inputTag.attr('data-tag-id');
	updateTagsDropdown(tagId, tagNewName);
}

// Delete Tag callback
function processDeleteTag(resultObj, listURL) {
	moduleTags.listTags(listURL);
}

// Add New Categories To Dropdown
function addNewTagToDropdown(resultObj) {
	var temp =resultObj.tags.length - 1;
	var control = $selectizeTags[0].selectize; // Get Selectize Instance
	control.clear(); // Resets or clears all selected items from the control.

	// Adds an available option. If it already exists, nothing will happen. Note: this does not refresh the options list dropdown (use refreshOptions() for that). : addOption(data)
	control.addOption({
		cid: resultObj.tags[temp].cid,
		name: resultObj.tags[temp].name
	});
	control.updateOption(resultObj.tags[1].cid, {cid: 1, tagName: name})
}

// Update value of the Tags Dropdown
function updateTagsDropdown(tagId, tagName) {
	var control = $selectizeTags[0].selectize;
	control.clear(); // Resets or clears all selected items from the control.
	$selectSource.refreshItems();
	// Updates an option available for selection. If it is visible in the selected items or options dropdown, it will be re-rendered automatically. : updateOption(value, data)
	// Ex : test.selectize.updateOption('a', {value: 'a', test: 'test'});
	control.updateOption(tagId, {cid: tagId, name: tagName}) // Update Selectize Dropdown Value after change
}

// List Snippets By Selected Tag
/*
$('body').on('click', '.tags-wrapper a', function() {
	_mainModule.list('tags', $(this).attr('data-tag'));
});
*/
// Add New Tag
$('body').on('click', '#btnAddTag', function() {
	var addURL = $(this).data("add-url");
	var listURL = $(this).data("list-url");
	moduleTags.addSingleTag(addURL, listURL);
});

// Edit Selected Tag
$('body').on('click', '#btnSaveEditaedTag', function() {
	moduleTags.editTag(obj_assetPanel.module.urls.editTag, obj_assetPanel.module.urls.listTag);
});

// Delete Selected Tag
$('body').on('click', '#modalSettings .lnkDeleteTag', function() {
	moduleTags.deleteTag($(this), obj_assetPanel.module.urls.delTag, obj_assetPanel.module.urls.listTag);
});

// Edit Selected Tag
$('body').on('click', '#modalSettings .lnkEditTag', function() {
	var tagName = $(this).closest('li').attr('data-tag');
	var tagId = $(this).closest('li').attr('data-tag-id');
	var tagColor = $(this).closest('li').attr('data-tag-color');

	$('#frmEditTag #txtEditTag').val(tagName).attr('data-tag', tagName).attr('data-tag-id', tagId);
	$('#frmEditTag #txtEditTagColor').val(tagColor);
	$('.editTagColor').colorpicker('setValue', tagColor);
});

var selOpts, initSelectize = {
	init : function(settings) {
		selOpts = settings;

		this.bindSelectize();
	},
	bindSelectize : function() {
		$selectizeTags = $(selOpts.selectId).selectize({
			delimiter: selOpts.delimiter,
			maxItems: null,
			valueField: 'tagName',
			labelField: 'tagName',
			searchField: 'tagName',
			options : selOpts.data,
			create: true,
			onDropdownOpen  : eventHandler('onDropdownOpen')
		});
	}
};
