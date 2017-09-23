<!-- Template :: Left Nav Panel Template -->
<script id="leftnav-panel-template" type="text/x-handlebars-template">
	{{#if items}}
		{{#each items}}
		
		<li>
	<a href="{{this.iconClass}}.html"><i class="jicon-{{this.iconClass}}"></i><span><em class="arrow small arrow-left"></em>{{this.name}}</span></a>

{{#if subnav}}
<div class="control-panel-subnav">
	<ol>
		<li>
			<a href="#" class="button medium color green lnkAddNewSnippet" data-toggle="modal" data-target="#modalAddSnippetForm"><i class="ion-plus"></i> Add New Snippet</a>
		</li>
	</ol>
</div>
{{/if}}

</li>
{{/each}}
{{/if}}
</script>		