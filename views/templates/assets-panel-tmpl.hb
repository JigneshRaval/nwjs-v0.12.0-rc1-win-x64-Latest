<!-- Template :: Categories -->
<script id="assets-panel-template" type="text/x-handlebars-template">
	<div class="fr" data-module="{{module.name}}">
	{{#if module}}
		
		{{#each module.controls}}
		
		{{#if this.hasPopover}}
			
			{{#compare this.name "==" "Add Category"}}
		<a href="javascript:;" class="boxsize popover-extcontent" data-toggle="popover" data-container="body" data-trigger="click" title="Add New Category" data-html="true" data-placement="bottom" data-findwhere="next"><i class="ion-folder" data-toggle="tooltip" data-placement="top" title="Add New Category" data-container="body"></i></a>
		
		<!-- START :: Add New Category Form -->
		<div class="pop-content pop-content-categories" style="display:none;">
			<form id="frmAddNewCategory" name="frmAddNewCategory">
				<input type="hidden" name="hdnSelectedCategory" id="hdnSelectedCategory" value="" />
				<div class="input-group">
					<input type="text" name="txtAddCategory" id="txtAddCategory" class="form-control" placeholder="Add Category" data-validation="required" maxlength="30" data-validation-length="max30" data-validation-error-msg="Please provide category name" />
					<div class="input-group-btn">
						<button type="submit" class="btn btn-default" id="btnAddCategory" data-add-url="{{this.addURL}}" data-list-url="{{this.listURL}}"><i class="ion-plus"></i></button>							
					</div>
				</div>
				<br/>
				<div class="input-group setCategoryColor" data-container="body" data-color="#30B1FF">
					<input type="text" name="txtCategoryColor" id="txtCategoryColor" class="form-control" placeholder="Select Tag Color" data-validation="required" maxlength="30" data-validation-length="max30" data-validation-error-msg="Please Select Color for the Category." value="#30B1FF" />
					<span class="input-group-addon"><i></i></span>
				</div>
			</form>
		</div>
		<!-- END :: Add New Category Form -->
		{{/compare}}
		
		{{#compare this.name "==" "Add Tag"}}
		
		<a href="javascript:;" class="boxsize popover-extcontent" data-toggle="popover" data-container="body" data-trigger="click" title="Add New Tag" data-html="true" data-placement="bottom" data-findwhere="next"><i class="ion-backspace" data-toggle="tooltip" data-placement="top" title="Add Tag" data-container="body"></i></a>
		
		<!-- START :: Add New Tag Form -->
		<div class="pop-content pop-content-tags" style="display:none;">
			<form id="frmAddNewTag" name="frmAddNewTag">
				<div class="input-group">
					<input type="text" name="txtAddTag" id="txtAddTag" class="form-control" placeholder="Add Tag" data-validation="required" maxlength="30" data-validation-length="max30" data-validation-error-msg="Please provide valid tag name" />
					
					<div class="input-group-btn">
						<button type="submit" class="btn btn-default" id="btnAddTag" data-add-url="{{this.addURL}}" data-list-url="{{this.listURL}}"><i class="ion-plus"></i></button>
					</div>
				</div>
				<br/>
				<div class="input-group setTagColor" data-container=".setTagColor" data-color="#30B1FF">
					<input type="text" name="txtTagColor" id="txtTagColor" class="form-control" placeholder="Select Tag Color" data-validation="required" maxlength="30" data-validation-length="max30" data-validation-error-msg="Please Select Color for the tag." value="#30B1FF" />
					<span class="input-group-addon"><i></i></span>
				</div>
			</form>
		</div>
		<!-- END :: Add New Tag Form -->
		{{/compare}}
		
		{{else}}
		<a href="javascript:;" class="boxsize" id="{{this.id}}" data-toggle="tooltip" data-placement="top" title="{{this.title}}" data-container="body" 
		{{#if this.listURL}}data-list-url="{{this.listURL}}"{{/if}}
		><i class="{{this.icon}}"></i></a> 
		
		{{/if}}
		
		{{/each}}
		
		{{#compare module.name "==" "CodePlayer"}}
		<a href="javascript:;" class="lnkSaveThisPen boxsize" data-toggle="tooltip" data-placement="top" title="Save This Pen" data-container="body" onclick="codeEditorModule.saveCodePen();"><i class="ion-checkmark-circled"></i></a>
		
		<!-- START : CSS,JS Libraries ( Frameworks ) Dropdown -->
		<div class="eleinlineblock posRel dropdown library-dropdown">
			<a href="javascript:;" data-toggle="dropdown" class="boxsize" onclick=""><i class="ion-archive" data-toggle="tooltip" data-placement="top" title="Include CSS and JS Libraries" data-container="body"></i></a>
			<div class="dropdown-menu padding10px dropdown-libraries">
				<div class="js-scrollbar" style="max-height:300px;">
					<ul class="nomargin nopadding nobullets checkbox-group normal tdark clearfix">
					</ul>
				</div>
				
				<p class="alignC nomargin"><a href="javascript:;" class="btnSaveToDisk button small color yellow lhNormal">Save to Disk</a></p>
			</div>
		</div>
		<!-- END : CSS,JS Libraries ( Frameworks ) Dropdown -->
		{{/compare}}
		
		{{/if}}
</div>
</script>