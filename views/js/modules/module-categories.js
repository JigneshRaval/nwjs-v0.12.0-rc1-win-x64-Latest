/*---------------------------------------
	START : Categories Functions
-----------------------------------------*/
var $selectizeCategories, selectizeCategoriesControl;

/*---------------------------------------
	START : Categories Management Module
-----------------------------------------*/
var moduleCategories = {
	listCat : function(url){
		var listCatDataObj = {};
		commonAjaxCall(url, listCatDataObj, "json", "GET", processListCategories);
	},
	addCat : function(url, listURL){
		var $frmCat = $('.popover').find('#frmAddNewCategory');
		
		var catName = $frmCat.find('#txtAddCategory').val().toLowerCase();
		
		var addCatDataObj = {
			category : catName,
			color : $frmCat.find('#txtCategoryColor').val()
		};
		
		$.validate({
			onSuccess : function($form) {
				
				commonAjaxCall(url, addCatDataObj, "json", "POST", function(data) {
					processAddNewCategory(data, listURL);
				});
				return false;
			}
		});
	},
	editCat : function(url, listURL){
		var $frm = $('#frmEditCategory');		
		var $inputCategory = $('#frmEditCategory #txtEditCategory');
		
		var categoryName = $inputCategory.attr('data-category');
		var categoryNewName = $frm.find('#txtEditCategory').val();
		var categoryId = $inputCategory.attr('data-category-id');
		var catColor = $frm.find('#txtEditCatColor').val();
		
		var editCategoriesDataObj = {
			name : categoryName,
			cid : categoryId,
			newName : categoryNewName,
			color : catColor
		};
		commonAjaxCall(url, editCategoriesDataObj, "json", "POST", function(data) {
			processEditCategory(data, listURL);
		});
	},
	deleteCat : function(ele, url, listURL){
		var catCID = $(ele).closest('li').attr('data-category-id');
		var delCategoryDataObj = {
			cid : catCID
		};
		commonAjaxCall(url, delCategoryDataObj, "json", "POST", function(data) {
			processDeleteCategory(data, listURL);
		});
	}
};

$(function() {
	formValidationModule.init({formId: '#frmAddNewCategory'});
	$('.setCategoryColor').colorpicker();
	$('.editCategoryColor').colorpicker();
});

// List all the available Categories
function processListCategories(resultObj) {
	console.log("processListCategories...", resultObj)
	initCategoriesDropdown(resultObj);
	
	$('#hdnSelectedCategory').val('all');
	
	// Bind Categories Template
	GTemplateModule.init({templateId : "#categories-list-template", templateContainer : '#categories', bindArea :'ul', dataObj : resultObj, partials : [] });
	
	GTemplateModule.init({templateId : "#manage-categories-list-template", templateContainer : '#modalSettings', bindArea :'.manage-categories-listing', dataObj : resultObj, partials : [] });
	
	$("#holder-category").jPages({
		containerID  : "manage-categories__listing",
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
	
	//G_initCustomScrollbar();
}
/*---------------------------------------
	START : Callback Functions
-----------------------------------------*/
// Add New Category
function processAddNewCategory(resultObj, listURL) {
	console.log("processAddNewCategory...", resultObj);
	$('#frmAddNewCategory #txtAddCategory').val("");
	moduleCategories.listCat(listURL);
	addNewCatToDropdown(resultObj);
}

// Edit
function processEditCategory(resultObj, listURL) {
	console.log("processEditCategory...", resultObj);
	moduleCategories.listCat(listURL);
	
	var $inputCategory = $('#modalSettings #txtEditCategory');
	
	var categoryName = $inputCategory.attr('data-category');
	var categoryNewName = $('#modalSettings #txtEditCategory').val();
	var categoryId = $inputCategory.attr('data-category-id');
	updateCategoriesDropdown(categoryId, categoryNewName);
}

// Delete Category
function processDeleteCategory(resultObj, listURL) {
	console.log("processDeleteCategory...", resultObj);
	moduleCategories.listCat(listURL);
}

// Populate Categories Dropdown
function initCategoriesDropdown(resultObj) {
	var categoriesArray = [];
	$.each(resultObj.categories, function(key,value) {
		categoriesArray.push(value);
	});
	
	// Bind all tags to Selectize Dropdown
	$selectizeCategories = $('#optCategories').selectize({
		mode: "single",
		sortField : 'name',
		valueField: 'cid',
		labelField: 'name',
		searchField: 'name',
		openOnFocus: true,
		dataAttr : 'data-test',
		options : categoriesArray,
		create: false
	});
}

// Add New Categories To Dropdown
function addNewCatToDropdown(resultObj) {
	console.log("updating Categories Dropdown ..", resultObj);
	
	var temp =resultObj.categories.length - 1;
	var control = $selectizeCategories[0].selectize; // Get Selectize Instance
	control.clear(); // Resets or clears all selected items from the control.
	
	// Adds an available option. If it already exists, nothing will happen. Note: this does not refresh the options list dropdown (use refreshOptions() for that). : addOption(data)
	control.addOption({
		cid: resultObj.categories[temp].cid,
		name: resultObj.categories[temp].name
	});
	control.updateOption(resultObj.categories[temp].cid, {
		cid: resultObj.categories[temp].cid, name: resultObj.categories[temp].name
	});
}

// Update value of the Categories Dropdown
function updateCategoriesDropdown(catId, catName) {
	console.log("updating Categories Dropdown ..", catId, catName);
	
	var control = $selectizeCategories[0].selectize;
	control.clear(); // Resets or clears all selected items from the control.
	
	// Updates an option available for selection. If it is visible in the selected items or options dropdown, it will be re-rendered automatically. : updateOption(value, data)
	// Ex : test.selectize.updateOption('a', {value: 'a', test: 'test'});
	control.updateOption(catId, {cid: catId, name: catName}) // Update Selectize Dropdown Value after change
}

// Add New Category
$('body').on('click', '#btnAddCategory', function() {
	var addURL = $(this).data("add-url");
	var listURL = $(this).data("list-url");
	moduleCategories.addCat(addURL, listURL);
});

// Edit Bookmark Category
$('body').on('click', '#btnSaveEditaedCat', function() {	
	moduleCategories.editCat(obj_assetPanel.module.urls.editCat, obj_assetPanel.module.urls.listCat);
});

// Delete Selected Category
$('#modalSettings').on('click', '#modalSettings .lnkDeleteCategory', function() {
	moduleCategories.deleteCat($(this), obj_assetPanel.module.urls.delCat);
	// List all Categories
	moduleCategories.listCat(obj_assetPanel.module.urls.listCat);
});

// Edit Selected Category
$('#modalSettings').on('click', '.lnkEditCategory', function() {
	var categoryName = $(this).closest('li').attr('data-category');
	var categoryId = $(this).closest('li').attr('data-category-id');
	var catColor = $(this).closest('li').attr('data-category-color');
	
	$('#frmEditCategory #txtEditCategory').val(categoryName).attr('data-category', categoryName).attr('data-category-id', categoryId);
	$('#frmEditCategory #txtEditCatColor').val(catColor);
	$('.editCategoryColor').colorpicker('setValue', catColor);
});