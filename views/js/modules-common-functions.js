function showImagePreview(input) {
	$('.uploadPreview').find('img').remove();
	if (input.files ) {
		for(var i = 0; i < input.files.length;  i++) {
			(function (j, self) {
				var filerdr = new FileReader();
				filerdr.onload = function(e) {
					
					$('.uploadPreview').append('<span><img src="'+e.target.result+'" width="80px" /> <em>' + self.files[j].name + '</em></span>');
					//$('#imgprvw').attr('src', e.target.result);
				}
				
				filerdr.readAsDataURL(self.files[j]);
				
			})(i, input);
		}
	}
}

function saveSettings() {
	var saveSettingsDataObj = {
		syntaxTheme : $('#modalSettings input[type=radio]:checked').val()
	};
	commonAjaxCall('saveSettings', saveSettingsDataObj, "json", "POST", processSaveSettings);
}

function applySettings() {
	var applySettingsDataObj = {
		
	};
	commonAjaxCall('applySettings', applySettingsDataObj, "json", "GET", processApplySettings);
}


function processSaveSettings(resultObj) {
	
}
function processApplySettings(resultObj) {
	var cssFileName = 'css/highlighter/'+resultObj.settingsData.settings.syntaxTheme+'.css';
	$('#styleSyntaxHighlighter').attr('href', cssFileName);
}

$('body').on('click', '#btnSaveSettings', function() {
	saveSettings();
});

$('body').on('click', '.expand-cat-tags-panel', function(){
	if(!$(this).hasClass('opened')){
		$(this).addClass('opened');
		$('.main-wrapper').addClass('opened');
		
	}
	else {
		$(this).removeClass('opened');
		$('.main-wrapper').removeClass('opened');
	}	
});

$('body').on('click', '.expand-icon-panel', function(){
	if(!$('body').hasClass('opened')){
		$('body').addClass('opened');		
	}
	else {
		$('body').removeClass('opened');
		
	}
	
});

function bindPopovers() {
	$('body .popover-extcontent').popover({
		html: true,
		content: function() {
			return $(this).siblings('.pop-content').html();
		},
	});
}

$('body').on('click', '.lnkAddAddNewCategory', function() {
	$('#frmAddNewCategory').slideToggle();
});

$('body').on('click', '.lnkAddAddNewTag', function() {
	$('#frmAddNewTag').slideToggle();
});

$('body').on('click', '.panel-left ol > li > a', function() {
	if(!$(this).parent('li').hasClass('active')) {
		$('.panel-left ol > li').removeClass('active');
		$('.panel-left ol > li .js-accordion-section').slideUp()
		$(this).parent('li').addClass('active');
		$(this).next('.js-accordion-section').slideDown();
	}
	else {
		$(this).next('.js-accordion-section').slideUp();
	}
});

// Show hide Footer Panel Stripe
$('.lnkShowFooterPanel').on('click', function() {
	$('.footer-wrapper').addClass('active');
});
$('.lnkHideFooterPanel').on('click', function() {
	$('.footer-wrapper').removeClass('active');
});


$('body').on('click', '.panel-left h3 .ion-chevron-down', function() {
	if(!$(this).parent('h3').hasClass('active')) {
		$(this).parent('h3').addClass('active').next('.js-accordion-section').slideDown();
	}
	else {
		$(this).parent('h3').removeClass('active').next('.js-accordion-section').slideUp();
	}
});


$('body').on('click', '.panel-left h3 .ion-plus', function() {
	if(!$(this).hasClass('active')) {
		$(this).addClass('active').parent('h3').next('.js-accordion-section').find('form').slideDown();
	}
	else {
		$(this).removeClass('active').parent('h3').next('.js-accordion-section').find('form').slideUp();
	}
});

$('body').on('click', '.lnkShowSearchPanel', function() {
	if(!$(this).hasClass('active')) {
		$(this).addClass('active');
		$('.search-wrapper').addClass('active').slideDown(200);
	}
	else {
		$(this).removeClass('active');
		$('.search-wrapper').addClass('active').slideUp(200);
	}
});

// Search Functions
$('body').on('keyup change keydown', '#txtSearch', function(){
	if($(this).val().length > 0) {
		$(this).closest('form').find('.lnkClearSearch').show();
	}
	else {
		$(this).closest('form').find('.lnkClearSearch').hide();
	}
});

$('body').on('click', '.lnkOpenModal_Settings', function() {
	$('#modalSettings').modal('show');
	
	// Bind Tags Template
	GTemplateModule.init({templateId : "#syntax-highlighters-template", templateContainer : '#modalSettings', bindArea :'.synHighlighters-list-container', dataObj : syntaxHiglightersJSON, partials : [] });
	
	hljs.configure({
		languages : ["html","css"]
	});
	
	$('pre code').each(function(i, block) {
		//console.log("Highlighting...", i, block);
		//hljs.highlightAuto(block, languageSubset);
		hljs.highlightBlock(block);
	});
});

$('body').on('click', '#modalSettings input[type="radio"]', function() {
	var cssFileName = 'css/highlighter/'+$(this).val() + '.css';
	$('#styleSyntaxHighlighter').attr('href', cssFileName);
});

/*--------------------------------------------
	jQuery :: Custom Event Example
----------------------------------------------*/
// Load any External link in Iframe with Overlay
$('.iframeURLBrowser').on('show_external_url', function(e, url) {
	var $this = $(this);
	$this.find('.iframe-loader').show();
	if(!$this.hasClass('active')) {
		$this.addClass('active');
		setTimeout(function() {
			// Show Iframe Content
			$this.find('#iframeExternalURL').attr('src', url).on('load', function() {
				$this.find('.iframe-loader').hide();
				$(this).addClass('loaded');				
			});
		}, 500);
	}
	else {
		$this.removeClass('active');
		$this.find('#iframeExternalURL').removeClass('loaded').attr('src', "");
	}	
});

// Close iFrame Overlay
$('body').on('click', '.iframeURLBrowser a', function() {
	$('.iframeURLBrowser').trigger('show_external_url', [""]);
});

/*----------------------------------------------
	Function Search and Highlight words in content
	like Google Chrom Ctrl + F
------------------------------------------------*/
$('body').on('keypress keyup', '#txtHighlightText', function() {
	var textToHighlight = $(this).val();
	console.log("textToHighlight :", textToHighlight, textToHighlight.length);
	if(textToHighlight.length > 0) {
		$(".snippets-wrapper__detail").unhighlight();
		$(".snippets-wrapper__detail").highlight(textToHighlight);
		$(".highlight").css({ backgroundColor: "#FFFF88" });
	}
	else {
		$(".snippets-wrapper__detail").unhighlight();
	}	
});

var numb = 0;

$('.lnkNextHighlight').on('click', function() {
	var matchedLength = $('.snippets-wrapper__detail .highlight').length;
	console.log("matchedLength", matchedLength);
	
	$('.snippets-wrapper__detail .highlight').each( function(i) {
		$(this).attr('data-scroll-to', '.highlight:eq('+i+')');
	});
	
	console.log("Next numb =", numb);
	if(numb >  matchedLength - 1) {
		
	}
	else {
		
		$('.highlight').removeClass('selected');
		$('.highlight:eq('+numb+')').addClass('selected');
		$('.js-scrollbar').mCustomScrollbar("scrollTo",'.highlight:eq('+numb+')',"+=100", {
			scrollInertia: 8000
		});
		numb = numb + 1;
	}
	
});

$('.lnkPrevHighlight').on('click', function() {
	var matchedLength = $('.snippets-wrapper__detail .highlight').length;
	
	console.log("matchedLength :", matchedLength);
	
	$('.snippets-wrapper__detail .highlight').each( function(i) {
		$(this).attr('data-scroll-to', '.highlight:eq('+i+')');
	});
	numb = numb - 1;
	console.log("Prev numb =", numb);
	if(numb < 0) {
		numb = 0;
	}
	else {
		
		$('.highlight').removeClass('selected');
		$('.highlight:eq('+numb+')').addClass('selected');
		$('.js-scrollbar').mCustomScrollbar("scrollTo",'.highlight:eq('+numb+')',"-=30", {
			scrollInertia:3000
		});
	}
	
});

// Dynamically load Asset Panel ( Left Panel ) Controls
function bindAssetPanelControlls(obj_assetPanel) {
	GTemplateModule.init({templateId : "#assets-panel-template", templateContainer : '.assets-panel', bindArea :'.asset-controls', dataObj : obj_assetPanel, partials : [] });
	
	$('body .popover-extcontent').popover({
		html: true,
		content: function() {
			console.log("Find where :=", $(this).attr('data-findwhere'));
			if($(this).attr('data-findwhere') == "next") {
				return $(this).next('.pop-content').html();
			}
			else {
				return $(this).parent().find('.pop-content').html();
			}
			
		},
	});
}

$(function() {
	//applySettings();
});