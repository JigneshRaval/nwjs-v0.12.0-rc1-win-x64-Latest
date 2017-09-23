<!-- Template :: CSS,JS Libraries ( Frameworks ) Dropdown  -->
<script id="libraries-template" type="text/x-handlebars-template">
	{{#if resources}}
		{{#each resources}}
		
		<li class="boxsize animated fadeInUp">
	<strong>{{title}}</strong>
	<ol class="nobullets">
		{{#each items}}
		<li>
			<input type="checkbox" id="chkResource_{{@../index}}{{@index}}" name="chkResource_{{@../index}}{{@index}}" 
			{{#if ../../isOnline}}{{../../isOnline}}
			value="{{url}}{{fileName}}"
			{{else}}
			value="/database/code-pans/offline-resources/{{fileName}}"
			{{/if}}
			data-type="{{type}}" />
			<label for="chkResource_{{@../index}}{{@index}}"><i></i> {{name}}</label>
		</li>
		{{/each}}
	</ol>
</li>
{{/each}}
{{/if}}
</script>