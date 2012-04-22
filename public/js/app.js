var Exo = (function (obj) {
	
	_this = obj;

	_this.global = function() {
		//global function
	}

	_this.api_call_fields 	= new Array();
	_this.api_call_search 	= new Array();
	_this.api_call_sorts 	= [{field:"name"}];
	_this.api_call_start 	= 0;
	_this.api_call_limit 	= 0;

	function private() {
		//private function
	}

	function initRollovers() {

		// $('a.filler').each(function(){
		// 	//var this = $(this);
		// 	var dataTitle = $(this).html();
		// 	console.log(dataTitle);
		// 	var embed = '<span data-title="' + dataTitle + '">' + dataTitle + '</span>';
		// 	$(this).html(embed);
		// });


		$('.roll-trigger').mouseenter(function() {
			$(this).find('div.back-anim').show();
			$(this).find('div.back-anim').delay(700).stop(true, true).animate({width:'360px'}, 400, 'easeOutQuad');
			$(this).find('h3').css({color: '#FFF'});
		});

		$('.roll-trigger').mouseleave(function() {
			myScope = $(this);
			$(this).find('div.back-anim').stop(true, true).animate({width:'0px'}, 600, 
				function() {
					$(myScope).find("h3").css({color:'#787070'});
					$(this).hide();

			});
		});
	}

	function initTags(){
		$('#api-tags li').each(function(){
			var $this = $(this);
			var term = $this.find('span').html();
			var opt = "<option value=" + term + ">"+term+"</option>";
			$(".sort-select").append(opt);
		})

		$('#api-tags li').click(function() {
			var $this = $(this);
			var term = $(this).find('span').html();
			
			if($this.hasClass('selected')){
				$this.removeClass('selected');
				$this.addClass('deselected');

				// remove option from $('.sort-select');
				//var str = ".sort-select option[value=" + term + "]"				

				//$(str).remove();
			}else{
				$this.removeClass('deselected');
				$this.addClass('selected');

				// add option from $('.sort-select');
				var opt = "<option value=" + term + ">"+term+"</option>";
				$(".sort-select").append(opt);
			}

			_this.updateAPILink();
		});
	}

	function initApiForm(){

		$("body").on("click", ".add-button", function(){
			var $this = $(this);
			var $parent = $this.parent();
			

			if($this.val() == "add"){
				$this.val('remove');
				// add a new chunk
				var radioSelect = $parent.find($('input[type=radio]:checked'));
				var chunk = $parent.clone();
				
				$(chunk).appendTo($parent.parent());
				$(chunk).find('.add-button').val('add');
				var sortName = Math.floor(Math.random()*1000);
				var sortVal = 'sort' + sortName;

				$(chunk).find('input[type=radio]').attr('name', sortVal);
				$("input[type=text]", chunk).val("");
				$("input[type=radio]:first-child", chunk).attr("checked", "checked");

				radioSelect.attr('checked', 'checked');
			}else{
				$parent.remove();
			}

			_this.updateAPILink();
		});

	
		$("body").on("click", ".subtract", function(){
			var $this = $(this);
			var num = Number($this.siblings('.to-increment').val());
			if(num > 0)
				num--;
			$this.siblings('.to-increment').val(num);
			_this.updateAPILink();	
		});

		$("body").on("click", ".add", function(){
			var $this = $(this);
			var num = Number($this.siblings('.to-increment').val());
			num++;
			$this.siblings('.to-increment').val(num);
			_this.updateAPILink();	
		});

		$("body").on("change", ".sort-select, #search-opts .search-on select, .sort-select, #search-opts .search-on input[type=text]", function(){
			_this.updateAPILink();
		});

		$("body").on("change", "#sort-opts .sort-on input[type=radio]", function(){
			_this.updateAPILink();
		});

		$("body").on("change", "#limit_input, #start_input", function(){ _this.updateAPILink(); });

		// the control buttons
		$("body").on("click", "#refresh", function(){
			_this.updateAPILink();
			return false;
		});

		$("body").on("click", "#send", function(){
			_this.updateAPILink();

			// get the url string...
			var base_url = "http://174.122.110.37:12001/api/planets";
			var url = base_url + $("#url_spot").val();

			var response = "Requesting: " + url + "\n" + "------------------------------------------------------------------------------------------------\n"
			$("#api-response textarea").val(response);

			$.get(url, {}, function(data){$("#api-response textarea").val(response + data);});

			return false;
		});
	}

	function addSort(){

	}

	_this.updateAPILink = function() {

		// first update the stored fields
		// update the sort list.
		_this.api_call_sorts = new Array();
		$("#sort-opts .sort-on").each(function(i, item){
			var direction = $("input[type=radio]:checked", item).val();
			_this.api_call_sorts.push({field:$(".sort-select", item).val(), direction:direction + ""});
		});

		/** update the "fields" part of the api call. **/
		_this.api_call_fields = new Array();
		$("#api-tags li.selected").each(function(i, item){
			_this.api_call_fields.push($(item).text() + "");
		});

		// check the search fields
		_this.api_call_search = new Array();
		$("#search-opts li.search-on").each(function(i, item){

			// first make sure there is a value ( and it is numeric )
			var value = $("input[type=text]", item).val().trim();
			if(value == "") return ;

			_this.api_call_search.push({field: $(".sort-select", item).val(), "value":value, "direction":$("select[name=search_type]", item).val()});

		});

		var url = "";

		// check if we need the search API or if we can use /planets/all
		if(_this.api_call_search.length == 0)
			url += "/all";
		else
			url += "/search";

		// copy the fields in first
		url += "?fields=[" + _this.api_call_fields.join(',') + "]";

		// copy the search params in next
		$(_this.api_call_search).each(function(i, item){
			if(item.value == "" || item.value == undefined || item.value == null)
				return;

			url += "&" + item.field + item.direction + "=" + item.value;
		});		

		// copy the sorts in next
		url += "&sort=[" ;

		$(_this.api_call_sorts).each(function(i, item) {
			url += item.field + (item.direction == "undefined" ? "" : ":" + item.direction) + ","
		});

		url = url.substring(0, url.length - 1) + "";
		url += "]";

		// start and limit
		_this.api_call_limit = Number($("#limit_input").val());
		_this.api_call_start = Number($("#start_input").val());

		if(_this.api_call_limit != 0)
			url += "&limit=" + _this.api_call_limit;

		url += "&start=" + _this.api_call_start;

		// put the url into the box
		$("#url_spot").val("" + url);		
	}

	_this.initGlobalApp = function() {
		initRollovers();
		initTags();
		initApiForm();
	}

	function is_int(input){
	    return typeof(input)=='number'&&parseFloat(input)==input;
	  }
	
	return obj;

}(Exo || {}));