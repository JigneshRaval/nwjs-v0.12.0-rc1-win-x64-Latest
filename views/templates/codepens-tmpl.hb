<script id="codepens-list-template" type="text/x-handlebars-template">
	{{#if pens}}
		
		{{#everyNth pens 6}}
		{{#if @isModZeroNotFirst}}
		</div>
		{{/if}}
		{{#if @isModZero}}
		<div class="slidee-child boxsize">
			<ul id="codepens-wrapper__list" class="codepens-wrapper__list nomargin nobullets borderB-anim clearfix horizontal image-top">
				{{/if}}
				<li class="item boxsize color white posRel" data-codepen-id="{{this._id}}">
					
					<!-- Favourite Flag Corner -->
					{{#compare this.isStarred "==" "true"}}
					<span class="favourite-corner arrow bigger arrow-cornerTR red twhite"><i class="ion-star"></i></span>
					{{/compare}}
					
					<div class="item-controls style1">
						<a href="javascript:;" onclick="codeEditorModule.getCodepenDetail('{{this.id}}', '{{this._id}}')" data-toggle="modal" data-target="#modalAddBookmarkForm" data-codepen-id="{{this.id}}"><i class="ion-edit" data-toggle="tooltip" data-placement="top" data-container="body" title="Edit"></i></a>
						
						<a href="javascript:;" onclick="codeEditorModule.deleteCodepen('{{this.id}}', '{{this._id}}')" data-codepen-id="{{this.id}}"><i class="glyphicon glyphicon-trash" data-toggle="tooltip" data-placement="top" data-container="body" title="Delete"></i></a>
						
						<div class="make-favourite posRel eleinlineblock nomargin">
							<input type="checkbox" id="chkStarred_{{this._id}}" name="chkStarred_{{this._id}}" data-codepen-id="{{this._id}}" {{#compare this.isStarred "==" "true"}}checked="{{this.isStarred}}" {{/compare}}/>
							
							<label for="chkStarred_{{this._id}}" class="chkStarred"><i class="ion-ios-star-outline" data-toggle="tooltip" data-placement="top" data-container="body" title="Mark as Favourite"></i></label>
						</div>
					</div>
					<!--<div class="color white posRel borderB-anim-child">-->
					<header class="posRel clearfix">
						
						
						<div class="codepen-image posRel">
							<iframe src="../database/code-pans/{{this.penName}}" sandbox="allow-scripts allow-pointer-lock allow-same-origin" class="listview-iframes" scrolling="no"></iframe>
							
							<div class="codepen-header padding10px posAbs bwide dark50">
								<span class="metadata date uppercasetext"><i class="fa fa-clock-o"></i>
									{{#dateFormat this.dateCreated format="DD MMM YYYY"}}
									{{this}}
									{{/dateFormat}}
								</span>
								
								{{#if this.category}}
								<span class="metadata category"><i class="ion-folder"></i> {{this.category}}</span>
								{{/if}}
							</div>
						</div>
						
					</header>
					
					<div class="codepen-content padding25px minh100px posAbs">
						<a class="codepen-title titillium w400" href="javascript:;" target="_blank" onclick="codeEditorModule.loadCodePen('{{this.penName}}');">{{#if this.title}}{{this.title}}{{else}}Untitled{{/if}}</a>
						
						{{#if this.description}}
						<div class="codepen-description posrelative" data-toggle="more-less-content" data-strip-method="byChar" data-strip-value="100">
							<div class="more-content">{{{this.description}}}</div>
						</div>
						{{/if}}
					</div>
					<!--</div>-->
				</li>
				{{#if @isLast}}
			</ul>
		</div>
		{{/if}}
		{{/everyNth}}
		
		{{else}}
		
		<!-- Info Message if no list items are available -->
		<div class="alert alert-block alert-info js-alert">
			<h4>Info!</h4>
			No bookmarks are available in the selected category.
		</div>
		
		{{/if}}
	</script>	