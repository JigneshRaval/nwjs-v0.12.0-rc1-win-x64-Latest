<!-- Template :: Tags -->
<script id="tags-list-template" type="text/x-handlebars-template">
    {{#each tags}}
<a href="javascript:;" class="tag" data-tag="{{this.tagName}}" data-tag-id="{{this.cid}}" data-color="{{this.tagColor}}">
{{#if this.tagColor}}
	<span class="circle smaller" style="background-color:{{this.tagColor}};" data-toggle="tooltip" data-placement="top" title="{{this.tagColor}}"></span>
    {{/if}}
{{this.tagName}}</a>
{{/each}}
</script>


<!-- Template :: Manage Tags  -->
<script id="manage-tags-list-template" type="text/x-handlebars-template">
    {{#each tags}}
    <li class="boxsize animated fadeInLeft" data-tag="{{this.tagName}}" data-tag-id="{{this.cid}}" data-tag-color="{{this.tagColor}}">
    {{#if this.tagColor}}
	<span class="tag-color uppercasetext" style="background-color:{{this.tagColor}};" data-toggle="tooltip" data-placement="top" title="{{this.tagColor}}"></span>
    {{/if}}
    <a href="javascript:;" data-tag="{{this.tagName}}" data-tag-id="{{this.cid}}">{{this.tagName}}</a>
	
    <div class="item-controls style2">
        <a href="javascript:;" class="lnkEditTag"><i class="ion-edit" data-toggle="tooltip" data-placement="top" title="Edit"></i></a>
        <a href="javascript:;" class="lnkDeleteTag"><i class="glyphicon glyphicon-trash" data-toggle="tooltip" data-placement="top" title="Delete"></i></a>
	</div>
</li>
{{/each}}
</script>