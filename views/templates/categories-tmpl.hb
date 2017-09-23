<!-- Template :: Categories -->
<script id="categories-list-template" type="text/x-handlebars-template">
	<li class="cat-all active">
<a href="javascript:;" data-category="" data-category-id="0">All <span class="badge fr">{{this.totalRecords}}</span></a>
</li>
{{#each categories}}
<li>
	<a href="javascript:;" data-category="{{this.name}}" data-category-id="{{this.cid}}">
		{{#if this.color}}
		<span class="tag-color uppercasetext" style="border:2px solid {{this.color}};" data-toggle="tooltip" data-placement="top" title="{{this.color}}"></span>
		{{else}}
		<span class="tag-color uppercasetext" style="border:2px solid #FFF;" data-toggle="tooltip" data-placement="top" title="{{this.color}}"></span>
		{{/if}}
	{{this.name}} <span class="badge fr">{{#if this.snipcount}}{{this.snipcount}}{{else}}0{{/if}}</span></a>
</li>
{{/each}}
</script>


<!-- Template :: Manage Categories  -->
<script id="manage-categories-list-template" type="text/x-handlebars-template">
	{{#each categories}}
	<li class="boxsize animated fadeInLeft" data-category="{{this.name}}" data-category-id="{{this.cid}}" data-category-color="{{this.color}}">
	
	{{#if this.color}}
	<span class="tag-color uppercasetext" style="background-color:{{this.color}};" data-toggle="tooltip" data-placement="top" title="{{this.color}}"></span>
    {{/if}}
	
<a href="javascript:;" data-category="{{this.name}}" data-category-id="{{this.cid}}">{{this.name}}</a>

<div class="item-controls style2">
	<a href="javascript:;" class="lnkEditCategory"><i class="ion-edit" data-toggle="tooltip" data-placement="top" title="Edit"></i></a>
	<a href="javascript:;" class="lnkDeleteCategory"><i class="glyphicon glyphicon-trash" data-toggle="tooltip" data-placement="top" title="Delete"></i></a>
</div>
</li>
{{/each}}
</script>