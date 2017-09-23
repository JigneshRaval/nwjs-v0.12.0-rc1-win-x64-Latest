/*====================================
	START : Snippet Module
======================================*/
var $selectizeLanguages, selectizeLanguagesControl;
var autoCompObj = "";

var obj_assetPanel = {
	module : {
		name : "Tasks",
		urls : {
			listCat : 'listTaskCategories',
			addCat : 'addTaskCategory',
			editCat : 'editTaskCategory',
			delCat : 'deleteTaskCategory',
			listTag : 'listTaskTags',
			addTag : 'addSingleTaskTag',
			editTag : 'editTaskTag',
			delTag : 'deleteTaskTag',
			listAll : ['listAllTasks', processListAllTasks],
			addRecord : ['addEditTask', processAddEditRecord],
			getDetail : ['getTaskDetailToEdit', processGetDetail, false], // URL and CallBack, Populate Form : True/False
			deleteRec : ['deleteTask', processDeleteRecord],
			frmAddEdit : '#frmAddEditTask', 
			frmModal : '#modalAddEditTasksForm'
		},
		controls : [
		{ name : "add", title : "Add New", id : "lnkAddNewRecord", icon : "ion-plus", hasPopover : false },
		{ name : "Favourites", title : "Favourites", id : "lnkViewStarredList", icon : "ion-star", hasPopover : false },
		{ name : "Add Category", title : "Add Category", id : "lnkAddCategory", icon : "ion-folder", hasPopover : true, addURL : "addTaskCategory", listURL : "listTaskCategories" },
		{ name : "Add Tag", title : "Add Tag", id : "lnkAddTag", icon : "ion-backspace", hasPopover : true, addURL : "addSingleTaskTag", listURL : "listTaskTags" },
		{ name : "Toggle View", title : "Toggle View", id : "lnkToggleView", icon : "ion-android-apps", hasPopover : false},
		{ name : "Refresh View", title : "Refresh View", id : "lnkReloadList", icon : "ion-android-refresh", hasPopover : false, listURL : "listAllTasks"},
		]
	}
};

$(function () {	
	var tDate = new Date();
	
	$(".date-picker").attr('data-date-options' ,'{"format" : "MM/DD/YYYY hh:mm A", "minDate" : "'+tDate+'", "defaultDate" : "'+tDate+'", "showClear" : true}');
	$(".date-picker").datetimepicker();
	
});

$(function() {
	
	//moduleTasks.getTaskStats();
	moduleCategories.listCat('listTaskCategories');
	//moduleTasks.listAllTasks('all');
	moduleTags.listTags('listTaskTags');
	_mainModule.list('category', '');
	
	// Form Validation
	formValidationModule.init({formId: '#frmAddEditTask'});
	formValidationModule.init({formId: '#frmAddSubTask'});
	formValidationModule.init({formId: '#frmSnippetComments'});
	
	$(".slider-task-progress").noUiSlider({
		range: {
			'min': 0,
			'max': 100
		},
		connect: 'lower',
		//snap: true,
		start: 0,
		step: 5,
		// Full number format support.
		format: wNumb({
			mark: '',
			decimals: 0
		}),
	})
	
	$(".slider-task-progress").Link('lower').to('-inline-<div class="range-slider-tooltip"></div>', function ( value ) {
		// The tooltip HTML is 'this', so additional
		// markup can be inserted here.
		$(this).html('<span>' + value + '%</span>');
	});
	
	// Filtering Plugin    : jquery.fastLiveFilter.js : Good
	$('#txtSearch').fastLiveFilter('#tasks-wrapper__list', {
		timeout: 100,
		callback: function(total) {
			console.log(total, $('#txtSearch').val());
			
			var filterBy = $('#frmSearch input[type=radio]:checked').val();
			var filterValue = $('#txtSearch').val();
			
			if(filterValue != "") {
				_mainModule.list(filterBy, filterValue);
				initPagination(1, 5, "tasks-wrapper__list", "#holder-tasks");
			}
			else {
			}
			
		}
	});
	initSummnerNoteEditor(200, 200); // Height and Minimum Height
	
	setTimeout(function() {
		bindAssetPanelControlls(obj_assetPanel);
	}, 500);
});
$('body').on('shown.bs.modal', '#modalAddEditTasksForm', function () {
	
	var tDate = new Date();
	console.log("Modal Shown", tDate);
	$('#modalAddEditTasksForm').find('.date-picker').each(function(index) {
		$(this).data('DateTimePicker').date(tDate);
	});
})
/*---------------------------------------------
	START :: Module Code
-----------------------------------------------*/
var mTaskOpts, moduleTasks = {
	init : function(settings) {
		mTaskOpts = settings;
	},
	getTaskStats : function() {
		var taskStatsDataObj = {
		};
		commonAjaxCall('getTaskStats', taskStatsDataObj, "json", "GET", processGetTaskStats);
	},
	/* listAllTasks : function(categoryName) {
		// list by all, tag, category, date, title
		if(categoryName == 'all') {
			$('.tasks-controls-title').text("All Tasks");
		}
		var groupBy = $('.groupby-dropdown input[type=radio]:checked').val();
		console.log(groupBy);
		if(groupBy === undefined || groupBy === 'all') {
			$('.groupby-dropdown input[type=radio]:checked').prop('checked', false);
			groupBy = "";
		}
		
		var listDataObj = {
			id : 1,
			category: categoryName,
			archived : false,
			isGroupBy : true,
			groupBy : groupBy
		};
		
		commonAjaxCall('listAllTasks', listDataObj, "json", "POST", processListAllTasks);
	}, */
	listDueToday : function() {
		var now = new Date();
		var filterBy = "dueDate";
		
		// Get the current date at midnight.
		var filterValue = (now.getMonth()+1) +"/"+ now.getDate() +"/"+ now.getFullYear();
		
		_mainModule.list('dueDate', filterValue);
	},
	listArchivedTasks : function() {
		// list by all, tag, category, date, title
		$('.tasks-controls-title').text("Archived Tasks");
		
		_mainModule.list('archived', true);
	},
	addEditTask : function() {
		// Setup form validation
		
		var $addEditTaskForm = $('#frmAddEditTask');
		var mode = $addEditTaskForm.find('#hdnMode').val();
		
		var addEditFormDataObj = {
			id : $addEditTaskForm.find('#hdnTaskId').val(),
			title : $addEditTaskForm.find('#txtTaskTitle').val(),
			category: $addEditTaskForm.find('#optCategories').text(),
			categoryId : $addEditTaskForm.find('#optCategories').val(),
			priority : $addEditTaskForm.find('#optTaskPriority').val(),
			progress : 5,
			tags : $addEditTaskForm.find('#txtTaskTags').val(),
			description : $addEditTaskForm.find('#txtareaTaskDescription').code(),
			comments : [""],
			note : $addEditTaskForm.find('#txtareaNote').val(),
			startDate : $addEditTaskForm.find('#txtTaskSrartDate').val(),
			dueDate : $addEditTaskForm.find('#txtTaskDueDate').val(),
			assignedTo : $addEditTaskForm.find('#optTaskAssignedTo').val(),
			remindMe : $addEditTaskForm.find('#optTaskReminder').val(),
			taskStatus : $addEditTaskForm.find('#optTaskReminder').val(),
			taskProgress : $addEditTaskForm.find(".slider-task-progress").val(),
			estimatedTime : $addEditTaskForm.find('#txtTaskEstTime').val()
		};
		
		if(mode == "add") {
			addEditFormDataObj.archived = false;
			addEditFormDataObj["subTasks"] = [];
		}
		else if(mode == "edit") {
			
		}
		
		_mainModule.add(addEditFormDataObj);
		/* 
			$.validate({
			onSuccess : function($form) {
			if(mode == "add") {
			addEditFormDataObj.mode = "add";					
			addEditFormDataObj.archived = false;
			addEditFormDataObj["subTasks"] = [];
			
			commonAjaxCall('addEditTask', addEditFormDataObj, "json", "POST", processAddNewTask);
			return false;
			}
			else if(mode == "edit") {
			addEditFormDataObj.mode = "edit";
			
			commonAjaxCall('addEditTask', addEditFormDataObj, "json", "POST", processEditTask);
			return false;
			}
			
			}
		}); */
	},
	generateBulkSubTasks : function(subTasksText) {
		// Not Required or Use in future if required
		var wrapperEle = document.createElement("div");
		
		var tempArray = [],
		finalSubTasksArray = [],
		finalText = "";
		
		if(subTasksText != "")
		{
			tempArray = subTasksText.split(/\n/gi); 
			
			for(var i =0; i < tempArray.length; i++) {
				finalText = finalText + '<p>'+tempArray[i]+'</p>';
			}
			wrapperEle.innerHTML = finalText;
			
			var texts = [].map.call( wrapperEle.querySelectorAll("p"), function(v){
				return v.textContent || v.innerText || "";
			});
			
			for(var i = 0; i < texts.length; i++) {
				var subTaskObj = {};
				subTaskObj.id = i;
				subTaskObj.title = texts[i];
				subTaskObj.status = "Pending";
				subTaskObj.dateCompleted = new Date();
				subTaskObj.dueDate = $('#frmAddEditTask').find('#txtTaskDueDate').val();
				
				finalSubTasksArray.push(subTaskObj);
			}
			
			return finalSubTasksArray;
		}
		else {
			
		}
	},
	/*editTask : function(bmId, taskDBId, bmImage) {
		 $('#modalAddEditTasksForm #hdnMode').val('edit');
			$('#modalAddEditTasksForm #hdnSnippetId').val(bmDBId);
			$('#modalAddEditTasksForm #imagePreview').attr('src', bmImage); // Set Image
			var mode = $('#modalAddEditTasksForm #hdnMode').val();
			var editDataObj = {
			id : bmId,
			_id : bmDBId,
			dateModified : new Date(),
			mode : mode
			};
		commonAjaxCall('getTaskDetailToEdit', editDataObj, "json", "POST", processGetTaskToEdit);
		
		obj_assetPanel.module.urls.getDetail[2] = true;
		_mainModule.getDetail(taskDBId);	
		
	}, */
	setReminder : function(taskId, taskDBId, reminderType) {
		console.log(taskId, taskDBId, reminderType);
		var setReminderDataObj = {
			id : taskId,
			_id : taskDBId,
			remindMe : reminderType
		};
		
		commonAjaxCall('setReminder', setReminderDataObj, "json", "POST", processSetReminder);
	},
	
	/* deleteTask : function(taskId, taskDBId) {
		alertify.confirm("Are you sure you want to delete this snippet?", function (e) {
			if (e) {
				var deleteDataObj = {
					id : taskId,
					_id : taskDBId
				};
				commonAjaxCall('deleteTask', deleteDataObj, "json", "POST", processDeleteTask);
			}
			else {
				alertify.error("You've clicked Cancel");
				return false;
			}
		});
	}, */
	
	archiveTask : function(taskDBId, archived) {
		var archivedDataObj = {
			_id : taskDBId,
			archived : archived
		};
		
		commonAjaxCall('archiveTask', archivedDataObj, "json", "POST", processArchiveTask);
	},
	// Sub Tasks functions
	addSubTask : function(ele, taskDBId) {
		var $subTaskForm = $(ele).closest('form');
		
		var addSubTaskDataObj = {
			_id : taskDBId,
			title : $subTaskForm.find('#txtSubTaskTitle').val(),
			status : "Pending",
			dueDate : $subTaskForm.find('#txtSubTaskDueDate').val()
		};
		
		$.validate({
			onSuccess : function($form) {
				commonAjaxCall('addSubTask', addSubTaskDataObj, "json", "POST", processAddSubTask);
				return false;
			}
		});
	},
	
	archiveSubTask : function(subTaskId, taskDBId, status) {
		var archSubTaskDataObj = {
			_id : taskDBId,
			id : subTaskId,
			status : status,
			dateCompleted : new Date(),
		};
		commonAjaxCall('archiveSubTask', archSubTaskDataObj, "json", "POST", processArchiveSubTask);
	},
	
	showSubTaskToEdit : function(ele) {
		$(ele).closest('tr').find('.input-group').show();
	},
	
	cancelSubTaskToEdit : function(ele) {
		$(ele).closest('tr').find('.input-group').hide();
	},
	
	saveSingleSubTask : function(ele, subTaskId, taskDBId) {
		var subTaskTitle = $(ele).closest('tr').find('#txtSubTaskTitle').val();
		var editSubTaskDataObj = {
			_id : taskDBId,
			id : subTaskId,
			title : subTaskTitle
		};
		console.log(editSubTaskDataObj);
		commonAjaxCall('saveSingleSubTask', editSubTaskDataObj, "json", "POST", processSaveSingleSubTask);
	},
	deleteSubTask : function(subTaskId, taskDBId) {
		var deleteSubTaskDataObj = {
			_id : taskDBId,
			id : subTaskId
		};
		commonAjaxCall('deleteSubTask', deleteSubTaskDataObj, "json", "POST", processDeleteSubTask);
	}
}
/*--------------------------------
	START :: Sub Task Functions
----------------------------------*/
function processAddSubTask(resultObj) {
	console.log("processAddSubTask", resultObj);
	
	updateSubTasksTemplate(resultObj);
}
function processArchiveSubTask(resultObj) {
	console.log("processArchiveSubTask", resultObj);
	// Set Progress Slider value in Add/Edit Task form
	$('#frmAddEditTask').find(".slider-task-progress").val(resultObj.tasks[0].taskProgress);
	
	updateSubTasksTemplate(resultObj);	
}

function processSaveSingleSubTask(resultObj) {
	console.log("processArchiveSubTask", resultObj);
	$(".sub-tasks-wrapper").html(partialTemplate(resultObj.tasks[0])); // Bind Partial Template
}

function processDeleteSubTask(resultObj) {
	console.log("processArchiveSubTask", resultObj);
	
	$('#frmAddEditTask').find(".slider-task-progress").val(resultObj.tasks[0].taskProgress);
	
	updateSubTasksTemplate(resultObj);
}

function updateSubTasksTemplate(resultObj) {
	// Update Task Row using Handlebars
	var contentSrc=$("#tasks-list-partial").html();
	var contentTemplate = Handlebars.compile(contentSrc);
	
	var wrapperEle = document.createElement("div");
	wrapperEle.innerHTML = contentTemplate(resultObj);
	
	
	$('.tasks-wrapper__list li[data-snippet-id="'+resultObj.tasks[0]._id+'"]').html(wrapperEle.querySelector('li.item').innerHTML).find('.js-expand-collapse-content').show(); // Bind Partial Template
}

function processGetTaskStats(resultObj) {
	console.log("processGetTaskStats", resultObj);
	$('.tasks-menu .count-all-tasks').text(resultObj.stats.totalTasks);
	$('.tasks-menu .count-archived-tasks').text(resultObj.stats.totalArchivedTasks);
	$('.tasks-menu .count-total-categories').text(resultObj.stats.totalCategories);
	getCountOfDueToday(resultObj);
}

function getCountOfDueToday(resultObj) {
	var countDueToday = 0;
	var dateOne = new Date();
	
	$.each(resultObj.tasks, function(key, value) {
		if(value.remindMe == "Hourly") {
			
		}
		if(value.remindMe == "Daily" && value.archived == 'false') {
			var tt = compareTwoDates(dateOne, value.dueDate);
			if(tt == "equal") {
				countDueToday = countDueToday + 1;
				var options = {
					icon: "../../images/jrsnipp-logo-red-stripe.png",
					body: value.title
				};
				webkitWinModule.showNotification(options);
			}
		}
		if(value.remindMe == "Weekly") {
			
		}
	});
	
	$('.tasks-menu .count-due-today').text(countDueToday);
}

// List Snippets CallBack
function processListAllTasks(resultObj) {
	console.log("processListAllTasks....", resultObj);
	if(resultObj.categoryName != "" && resultObj.categoryName =="all") {
		GTemplateModule.init({templateId : "#tasks-list-template", templateContainer : '.tasks-wrapper', bindArea :'.tasks-wrapper__list', dataObj : resultObj, options :[ {groupByCat : "true"} ], partials : [ {partialName : "tasks-list"}, {partialName : "sub-tasks"}] });
	}
	else {
		GTemplateModule.init({templateId : "#tasks-list-template", templateContainer : '.tasks-wrapper', bindArea :'.tasks-wrapper__list', dataObj : resultObj, options :[ {groupByCat : "false"} ], partials : [ {partialName : "tasks-list"}, {partialName : "sub-tasks"}] });
	}
	
	initPagination(1, 15, "tasks-wrapper__list", "#holder-tasks"); // pass values for startPage and Records perPage
	
	// Show-hide Content on click of "More" button
	_GShowMoreContentModule.init();
	
	// Show Tootips
	$('[data-toggle="tooltip"]').tooltip('hide');
	//$('[data-toggle="popover"]').popover();
	
	bindPopovers();
}

/* 
$('body').on('click', '.filterby-dropdown input[type="radio"]', function() {
	autoCompObj["filterBy"] = $(this).val();
}); */

$('body').on('click', '.groupby-dropdown input[type="radio"]', function() {
	//moduleTasks.listAllTasks('all');
	_mainModule.list('category', '');
});


function processStarredTasks(resultObj) {
	console.log("processStarredTasks", resultObj);
}


function processGetDetail(resultObj) {
	console.log(obj_assetPanel.module.urls.getDetail[2]);
	
	if(obj_assetPanel.module.urls.getDetail[2] === true) {
		$('#hdnMode').val("edit");
		$('#modalAddEditTasksForm').modal('show');
		populateForm(resultObj);
		obj_assetPanel.module.urls.getDetail[2] = false;
	}
	else {
		console.log("processTaskDetail", resultObj);
	}
}

// Edit Task CallBack
function processGetTaskToEdit(resultObj) {
	console.log("processEditSnippet....", resultObj);
	resetForm('#frmAddEditTask');
	var $frm = $('#frmAddEditTask');
	
	populateWithoutPrefix($frm, resultObj.task[0]);
	
	$frm.find(".slider-task-progress").val(resultObj.task[0].taskProgress);
	
}

// Get Snippet Data for Editing
function populateForm(resultObj) {
	var $frm = $('#frmAddEditTask');
	
	populateWithoutPrefix($frm, resultObj.recordDetail[0]);
	
	var tagsArray = resultObj.recordDetail[0].tags.split(",");
	var finalTagsArray = [];
	
	var control = $selectizeTags[0].selectize;
	control.clear();
	control.setValue(tagsArray);
	
	$frm.find(".slider-task-progress").val(resultObj.task[0].taskProgress);
}

function processSetReminder(resultObj) {
	console.log("processSetReminder....", resultObj);
	//moduleTasks.listAllTasks($('#optCategories option:selected').text());
	_mainModule.list('category', $('#optCategories option:selected').text());
}

// Delete Snippet CallBack
function processDeleteTask(resultObj) {
	//moduleTasks.listAllTasks($('#hdnSelectedCategory').val());
	_mainModule.list('category', $('#hdnSelectedCategory').val());
	moduleCategories.listCat('listTaskCategories');
}

// Delete Snippet CallBack
function processArchiveTask(resultObj) {
	moduleTasks.getTaskStats();
	//moduleTasks.listAllTasks($('#hdnSelectedCategory').val());
	_mainModule.list('category', $('#hdnSelectedCategory').val());
	moduleCategories.listCat('listTaskCategories');
}

$('body').on('click', '#tasks-wrapper__list li input[name^="chkTask_"]', function() {
	var archived = $(this).prop('checked');
	var taskDBId = $(this).attr('data-taskdb-id');
	
	moduleTasks.archiveTask(taskDBId, archived);
});

$('body').on('click', '#tasks-wrapper__list li input[name^="chkSubTask_"]', function() {
	var status = "";
	if($(this).prop('checked') == true) {
		status = "Completed";
	}
	else {
		status = "Pending";
	}
	var subTaskId = $(this).attr('data-subtask-id');
	var taskDBId = $(this).attr('data-taskdb-id');
	
	moduleTasks.archiveSubTask(subTaskId, taskDBId, status);
});

// Edit Selected Category
$('body').on('click', '#modalSettings .lnkDeleteCategory', function() {
	moduleCategories.deleteCat($(this), 'deleteTaskCategory');
});

/* 
	$('body').on('click', 'a.lnkAddNewTask', function() {
	var $modal = $('#modalAddEditTasksForm');
	$modal.modal('show');
	resetForm('#frmAddEditTask');
	$modal.find('#hdnMode').val('add');
	$modal.find('.bookmark-default-image').show();
	$modal.find('.attachments-upload').hide();
	});
*/

$('body').on('click', '.lnkFilterTasks', function() {
	$('.panel-filter-tasks').slideToggle();
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
}); */

$('body').on('click', '.tasks-controls a', function() {
	if(!$(this).hasClass('active')) {
		$(this).addClass('active').siblings().removeClass('active');
	}
	else {
		$(this).removeClass('active');
	}
});

$('body').on('click', '.lnkReloadList', function() {
	moduleTasks.listAllTasks($('#hdnSelectedCategory').val());
});

$('body').on('click', '.snippets-wrapper__footer .lnkShowUploadForm', function() {
	$('.attachments-upload, .attachments-preview').addClass('active');
});


$('body').on('click', '.search-by-filters h3 i', function() {
	if(!$(this).parent('h3').hasClass('active')) {
		$(this).parent('h3').addClass('active').next('div').slideDown();
	}
	else {
		$(this).parent('h3').removeClass('active').next('div').slideUp();
	}
});

// Sub Task Related Functions
//========================================
$('body').on('click', '.lnkShowSubTaskForm', function() {
	$(this).next().slideToggle();
	var tDate = new Date();
	$(".date-picker").attr('data-date-options' ,'{"format" : "MM/DD/YYYY hh:mm A", "minDate" : "'+tDate+'", "defaultDate" : "'+tDate+'", "showClear" : true}');
	$(".date-picker").datetimepicker();
	
	$('body').find('.task-more-details').find('.date-picker').each(function(index) {
		$(this).data('DateTimePicker').date(tDate);
	});
});

$('body').on('click', '.lnkShowBulkSubTaskForm', function() {
	$(this).next().slideToggle();
	
});
$('body').on('click', '#submitBulkSubTask', function() { 
	var taskDBId = $(this).attr('data-taskdb-id');
	
	var subTasksText = $(this).prev('#txtAreaBlukSubTasks').val().trim();
	var subTasksList = moduleTasks.generateBulkSubTasks(subTasksText);
	console.log("Bulk subTasksList:",taskDBId, subTasksText,  subTasksList);
	
	var addBulkSubTaskDataObj = {
		_id : taskDBId,
		subTaskArr : subTasksList
	};
	commonAjaxCall('addBulkSubTask', addBulkSubTaskDataObj, "json", "POST", processAddSubTask);
	
});


function compareTwoDates(dateOne, dateTwo) {
	var rightnow = new Date();
	var backthen = new Date(dateTwo);
	
	if(dateOne != "" || dateOne !== undefined) {
		rightnow = dateOne; //Today Date
	}
	
	rightnow.setHours(0,0,0,0);
	backthen.setHours(0,0,0,0);
	
	if (rightnow.getTime() > backthen.getTime())
	{
		//console.log(rightnow + " is greater than " + backthen + ".");
		return "greater";
	}
	else if (rightnow.getTime() == backthen.getTime())
	{
		//console.log(rightnow + " are equal " + backthen + ".");
		return "equal";
	}
	else
	{
		//console.log("Oh, no! " + backthen + " is Greater than " + rightnow);
		return "lower";
	}
}

// Not in use , Done in controller
function calcTaskProgress(resultObj){
    var avgLength = 0,
	totalSubTasks = 0;
	for (var i in resultObj.tasks) {
		// console.log("o." + prop + " = " + resultObj.tasks[prop]);
		if(resultObj.tasks[i].subTasks) {
			console.log(resultObj.tasks[i].subTasks);
			totalSubTasks = resultObj.tasks[i].subTasks.length;
			
			for (var j in resultObj.tasks[i].subTasks) {
				console.log(resultObj.tasks[i].subTasks[j].status);
				if(resultObj.tasks[i].subTasks[j].status == "Completed") {
					avgLength += 1;
				}
			}
		}
	}
	
	var taskProgress = 100 * (avgLength/totalSubTasks);
	return taskProgress;
}
/* 
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
	$('#modalAddEditTasksForm').modal('show');
}			 */	