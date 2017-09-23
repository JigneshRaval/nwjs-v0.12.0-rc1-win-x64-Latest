$(function(){
	
	/* HandleBAr  NESETED FUNCTIONS HELPER START */
	
	var Utils = Handlebars.Utils;
	var registerHelper = Handlebars.registerHelper;
	
	Handlebars.Utils.isString = function(object) {
		return toString.call(object) == '[object String]';
	};
	
	Handlebars.registerHelper = function(name, fn, inverse) {
		var nestedFn = function() {
			var nestedArguments = [];
			
			for (var index = 0; index < arguments.length; index++) {
				var argument = arguments[index];
				
				if (argument && argument.hash) {
					for (key in argument.hash) argument.hash[key] = Handlebars.resolveNested.apply(this, [argument.hash[key]]);
					nestedArguments.push(argument);
					} else {
					nestedArguments.push(Handlebars.resolveNested.apply(this, [argument]));
				}
			}
			
			return fn.apply(this, nestedArguments);
		};
		
		registerHelper.apply(this, [name, nestedFn, inverse]);
	};
	
	Handlebars.resolveNested = function(value) {
		if (Utils.isString(value) && value.indexOf('{{') >= 0) value = Handlebars.compile(value)(this);
		return value;
	};
	
	
	
	/* HandleBAr  NESETED FUNCTIONS HELPER END */
	Date.prototype.format = function(format) //author: meizz
	{
		var o = {
			"M+" : this.getMonth()+1, //month
			"d+" : this.getDate(),    //day
			"h+" : this.getHours(),   //hour
			"m+" : this.getMinutes(), //minute
			"s+" : this.getSeconds(), //second
			"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
			"S" : this.getMilliseconds() //millisecond
		}
		
		if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
		(this.getFullYear()+"").substr(4 - RegExp.$1.length));
		for(var k in o)if(new RegExp("("+ k +")").test(format))
		format = format.replace(RegExp.$1,
		RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
		return format;
	}
	
	Date.prototype.formatAMPM = function (format) //author: meizz
	{
		var hours = this.getHours();
		var ttime = "AM";
		if(format.indexOf("t") > -1 && hours > 12)
		{
			hours = hours - 12;
			ttime = "PM";
		}
		
		var o = {
			"M+": this.getMonth() + 1, //month
			"d+": this.getDate(),    //day
			"h+": hours,   //hour
			"m+": this.getMinutes(), //minute
			"s+": this.getSeconds(), //second
			"q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
			"S": this.getMilliseconds(), //millisecond,
			"t+": ttime
		}
		
		if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o) if (new RegExp("(" + k + ")").test(format))
		format = format.replace(RegExp.$1,
		RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
		return format;
	}
	// Helper : Compare Condition
	Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
		
		var operators, result;
		
		if (arguments.length < 3) {
			throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
		}
		
		if (options === undefined) {
			options = rvalue;
			rvalue = operator;
			operator = "===";
		}
		
		operators = {
			'==': function (l, r) { return l == r; },
			'===': function (l, r) { return l === r; },
			'!=': function (l, r) { return l != r; },
			'!==': function (l, r) { return l !== r; },
			'<': function (l, r) { return l < r; },
			'>': function (l, r) { return l > r; },
			'<=': function (l, r) { return l <= r; },
			'>=': function (l, r) { return l >= r; },
			'typeof': function (l, r) { return typeof l == r; }
		};
		
		if (!operators[operator]) {
			throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
		}
		if(!isNaN(lvalue)) {
			lvalue = parseFloat(lvalue);
		} 
		if(!isNaN(rvalue)) {
			rvalue = parseFloat(rvalue);
		} 
		result = operators[operator](lvalue, rvalue);
		
		if (result) {
			return options.fn(this);
			} else {
			return options.inverse(this);
		}
		
	});
	
	// Helper : Each loop with Index
	/*---------------------------------------------------
		Ussage : 
		// {{#each_with_index records}}
		// <li class="legend_item{{index}}"><span></span>{{Name}}</li>
		// {{/each_with_index}}
	-----------------------------------------------------*/
	
	Handlebars.registerHelper("each_with_index", function(array, obj) {
		var buffer = "";
		for (var i = 0, j = array.length; i < j; i++) {
			var item = array[i];			
			// stick an index property onto the item, starting with 1, may make configurable later
			item.index = i+1;
			
			// show the inside of the block
			buffer += obj.fn(item);
		}
		
		// return the finished buffer
		return buffer;
		
	});
	
	// Helper : Format Date
	// This registers a new helper method on the Handlebars template
	/*--------------------------------------------------------
		Usage :
		<h1>{{title}} published at {{formatDate date}}</h1>
	----------------------------------------------------------*/
    Handlebars.registerHelper("formatDate", function(date){
		// This guard is needed to support Blog Posts without date
		// the takeway point is that custom helpers parameters must be present on the context used to render the templates
		// or JS error will be launched
		if (typeof(date) == "undefined") {
			return "Unknown";
		}
		var time = new Date(date);
		
		// These methods need to return a String
		return time.getDay() + "/" + time.getMonth() + "/" + time.getFullYear();
	});
	
	// Helper : Split Comma Separated Values
	// This registers a new helper method on the Handlebars template
	/*--------------------------------------------------------
		Usage :
		<ul>
		{{#splitCSV yourCSVValue}} // Pass your value
		<li>{{this}}</li>
		{{/splitCSV}}
		</ul>
	----------------------------------------------------------*/
	Handlebars.registerHelper('splitCSV', function(items, options) {
		var out = '';
		if(items) {
			var itemArray = items.split(G_KG_COMMON_SEPERATOR);
			for(var i=0; i<itemArray.length; i++) {
				out = out + options.fn(itemArray[i]);
			}
		}
		return out;		
	});
	
	// Uses same syntax as #if helper but initially returns false for falsey or empty string values.
	Handlebars.registerHelper('if_blank_null', function(item, block) {
		//console.log(item, block, block.fn(this));
		return (item && item.replace(/\s/g,"").length) ? block.fn(this) : block.inverse(this);
	});	
	
	Handlebars.registerHelper('ifIsLessThanTen', function(value, options) {
		if(value < 10) {
		    return options.fn(this);
		}
		return false;
	});
	
	Handlebars.registerHelper('ifIsMoreThanTen', function(value, options) {
		if(value > 10) {
		    return options.fn(this);
		}		  
	});
	
	Handlebars.registerHelper('splitByComma', function(items, options) {
		var out = '';
		if(items) {
			var itemArray = items.split(G_KG_COMMON_SEPERATOR_COMMA);
			for(var i=0; i<itemArray.length; i++) {
				out = out + options.fn(itemArray[i]);
			}
		}
		return out;		
	});
	
	Handlebars.registerHelper('splitByCommaWithIndex', function(items, options) {
		var out = '';
		if(items) {
			var itemArray = items.split(G_KG_COMMON_SEPERATOR_COMMA);
			for(var i=0; i<itemArray.length; i++) {
				var item = itemArray[i];
				// if item is already an object just add the index property
				if (typeof (item) == 'object') {
					item['index'] = i+1;
					} else { // make an object and add the index property
					item = {
						value: item, // TODO: make the name of the item configurable
						index: i+1
					};
				}
				out = out + options.fn(item);
			}
		}
		return out;		
	});
	
	Handlebars.registerHelper('splitCSVAndComma', function(items, options) {
		var out = '';
		if(items) {
			var itemArray = items.split(G_KG_COMMON_SEPERATOR_CSV_COMMA);
			for(var i=0; i<itemArray.length; i++) {
				out = out + options.fn(itemArray[i]);
			}
		}
		
		return out;		
	});
	
	Handlebars.registerHelper('link', function(text, options) {
		return new Handlebars.SafeString(text);
	});
	
	Handlebars.registerHelper('code', function(text) {
		text = Handlebars.Utils.escapeExpression(text);		
		var result = text;
		
		return new Handlebars.SafeString(result);
	});
	
	// Helper : Get N'th item in each loop
	/*--------------------------------------------------------
		Usage :
		<ol>
		{{#each model}}
		<li>
		{{#ifIsNthItem nth=3}}
		{{url}}
		{{/ifIsNthItem}}
		</li>
		{{/each}}
		</ol>
	----------------------------------------------------------*/
	Handlebars.registerHelper('ifIsNthItem', function(options) {
		var noOfItems = options.data.index+1;
		nth = options.hash.nth;
		
		if (noOfItems % nth === 0) {
			return options.fn(this);
		}		
	});
	
	Handlebars.registerHelper("momentwiseDate", function(timestamp) {
		return moment(new Date(timestamp)).fromNow();
	});
	
	Handlebars.registerHelper("prettifyDate", function(timestamp) {
		//console.log(time.format("yyyy-MM-dd h:mm:ss"));
		//return new Date(timestamp).formatAMPM("dd/MM/yyyy h:mm t");
		return moment(new Date(timestamp)).format('lll');
	});
	
	Handlebars.registerHelper("MaxValue", function(item1 , item2 , item3) {
		var maxValue = 0;
		maxValue = Math.max(item1 , item2 , item3 );
		//console.log(maxValue);
		return maxValue;
	});
	
	Handlebars.registerHelper("MinValue", function(item1 , item2 , item3 ) {
		var minValue = 0;
		minValue = Math.min(item1 , item2 , item3);
		//console.log(minValue);
		return minValue;
	});
	
	// Helper : Split String using Multiple Separators (RegExp)
	/*--------------------------------------------------------
		{{#splitString "This-is test" "[\s\-]+"}}
		<em>{{this}}</em><br/>
		{{/splitString}}
	----------------------------------------------------------*/
	Handlebars.registerHelper('splitString', function (items, separatorsList, options) {
		var out = '', 
		itemArray = [];
		
		var getRegExp = new RegExp(separatorsList, 'g');
		
		if(items) {
			itemArray = items.split(getRegExp);
			for(var j=0; j<itemArray.length; j++) {
				out = out + options.fn(itemArray[j]);
			}
		}
		return out;			
	});
	
	Handlebars.registerHelper('getPercentage', function (intValue, options) {
		var setValue = 0;
		
		if(intValue) {
			if(intValue <= 1000) {
				setValue = intValue / 10;
				} else if(intValue <= 10000 && intValue >= 1000) {
				setValue = intValue / 100;
				} else if(intValue <= 100000 && intValue >= 10000) {
				setValue = intValue / 1000;
				} else if(intValue <= 1000000 && intValue >= 100000) {
				setValue = intValue / 10000;
				} else if(intValue <= 10000000 && intValue >= 1000000) {
				setValue = intValue / 100000;
			}
		}
		return setValue;		
	});
	/*
		-------------------------
		{{#getAvrgPercentage 6 0 5 6}}
		{{this}} = 
		{{/getAvrgPercentage}}
		------------------------------------
		Handlebars.registerHelper('getAvrgPercentage', function (blockVal, min, max, minMaxBase, options) {
		var setValue = 0;
		var valueArray = [];
		var sum = 0, test = 0, avrg = 0;
		for(var i = 0; i < minMaxBase; i++) {
		if(min <= max) {
		sum = min + i
		console.log("sum", i, min, max, sum + (min + i));
		valueArray.push(sum);
		}
		}
		for(var i = 0; i < valueArray.length; i++) {
		test = test + valueArray[i];
		console.log(test);
		}
		
		avrg = test/valueArray.length;
		console.log("avrage :", avrg);
		avrg = 100/avrg;
		
		return avrg;		
		});
	*/
	Handlebars.registerHelper('covertNumberToIndianRupee', function(value, options) {
		value = value.toString();
		var lastThree = value.substring(value.length-3);
		var otherNumbers = value.substring(0,value.length-3);
		if(otherNumbers != '')
		lastThree = ',' + lastThree;
		var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
		return options.fn(res);
	});
	Handlebars.registerHelper("multiply", function(item1, item2) {
		var lvalue = parseFloat(item1);
		var rvalue = parseFloat(item2);
		
		var finalVlaue = lvalue * rvalue;
		return finalVlaue;
		
	});
	Handlebars.registerHelper("replaceCharcter", function(item1, removeChar ,addCharcter) {
		var finalString  = item1;
		addCharcter = addCharcter + " ";
		if(removeChar == "~~") {
			finalString = item1.replace(/~~/g, addCharcter);
		}  
		return finalString;
		
	});
	
	// format an ISO date using Moment.js
	// http://momentjs.com/
	// moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
	// usage: {{dateFormat creation_date format="MMMM YYYY"}}
	Handlebars.registerHelper('dateFormat', function(context, block) {
		//console.log("window ===", window, global.moment);
		//var globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this;
		//console.log(globalScope, globalScope.moment);
		var m = global.moment;
		
		var newDate = new Date(context);
		//console.log(context, newDate);
		if (m && newDate && m(newDate).isValid()) {
			var f = block.hash.format || "MMM Do, YYYY";
			
			return m(newDate).format(f);
		}
		else{
			//console.log("moment plugin not available. return data as is.");
			return context; // moment plugin not available. return data as is.
		};
	});
    
    /*=========================
		Usage Example :
		{{#stripes myArray "even" "odd"}}
		<div class="{{stripeClass}}">
		... code for the row ...
		</div>
		{{/stripes}}
	======================================*/
    Handlebars.registerHelper("stripes", function(array, even, odd, obj) {
		if (array && array.length > 0) {
			var buffer = "";
			for (var i = 0, j = array.length; i < j; i++) {
				var item = array[i];
				
				// we'll just put the appropriate stripe class name onto the item for now
				item.stripeClass = (i % 2 == 0 ? even : odd);
				
				// show the inside of the block
				buffer += obj.fn(item);
			}
			// return the finished buffer
			return buffer;
		}
	});
	
	/*=========================
		Usage Example :
		{{#everyNth myArray theNumberN}}
		{{/everyNth}}
		
		{{#everyNth myArray 3}}
		{{#if @isModZeroNotFirst}}
		</div>
		{{/if}}
		{{#if @isModZero}}
		<div class="row-fluid">
		{{/if}}
		<div class="span4">
		<div class="thumb">
		<a href="{{ linkUrl }}"><img src="{{ image }}" /></a>
		</div>
		</div>
		{{#if @isLast}}
		</div>
		{{/if}}
		{{/everyNth}}
	======================================*/
	Handlebars.registerHelper('everyNth', function(context, every, obj) {
		var fn = obj.fn, inverse = obj.inverse;
		var ret = ""; var data;
		
		
		if(context && context.length > 0) {
			for(var i=0, j=context.length; i<j; i++) {
				
				var modZero = i % every === 0;
				
				if (obj.data) {
					data = Handlebars.createFrame(obj.data || {});;
				}
				
				
				data.index = i;
				data.isModZero = modZero;
				data.isModZeroNotFirst = modZero && i > 0;
				data.isLast = ( i === context.length - 1);
				
				ret = ret + fn(context[i], {
					data : data
					//isModZero: modZero,
					//isModZeroNotFirst: modZero && i > 0,
					//isLast: i === context.length - 1
				});
				
				//console.log("ret ====" , ret, fn(context[i], {data : data}));
			}
		} 
		else {
			ret = inverse(this);
		}
		return ret;
	});
	
	/* a helper to execute an IF statement with any expression
		https://gist.github.com/akhoury/9118682
		
		USAGE:
		-- Yes you NEED to properly escape the string literals, or just alternate single and double quotes
		-- to access any global function or property you should use window.functionName() instead of just functionName()
		-- this example assumes you passed this context to your handlebars template( {name: 'Sam', age: '20' } ), notice age is a string, just for so I can demo parseInt later
		<p>
		{{#xif " this.name == 'Sam' && this.age === '12' " }}
		BOOM
		{{else}}
		BAMM
		{{/xif}}
		</p>
	*/
	
	Handlebars.registerHelper("xif", function (expression, options) {
		return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
	});
	
	Handlebars.registerHelper("x", function (expression, options) {
		var fn = function(){}, result;
		
		// in a try block in case the expression have invalid javascript
		try {
			// create a new function using Function.apply, notice the capital F in Function
			fn = Function.apply(
			this,
			[
			'window', // or add more '_this, window, a, b' you can add more params if you have references for them when you call fn(window, a, b, c);
			'return ' + expression + ';' // edit that if you know what you're doing
			]
			);
			} catch (e) {
			console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
		}
		
		// then let's execute this new function, and pass it window, like we promised
		// so you can actually use window in your expression
		// i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
		// or whatever
		try {
			// if you have created the function with more params
			// that would like fn(window, a, b, c)
			result = fn.bind(this)(window);
			} catch (e) {
			console.warn('[warning] {{x ' + expression + '}} runtime error', e);
		}
		// return the output of that result, or undefined if some error occured
		return result;
	});
	
	Handlebars.registerHelper('json', function(context) {
		console.log("JSON", context);
		return JSON.stringify(context);
	});
	
	
	
});	