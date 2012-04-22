var Exo = (function (obj) {
	
	_this = obj;

	_this.global = function() {
		//global function
	}

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


		$('li.roll-trigger').mouseenter(function() {
			$(this).find('div.back-anim').show();
			$(this).find('div.back-anim').stop(true, true).animate({height:'45px'}, 100);
			$(this).find('h3').css({color: '#FFF'});
		});

		$('li.roll-trigger').mouseleave(function() {
			$(this).find('div.back-anim').stop(true, true).animate({height:'0px'}, 100, 
				function() {
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
			var term = $this.find('span').html();
			
			if($this.hasClass('selected')){
				$this.removeClass('selected');
				$this.addClass('deselected');

				// remove option from $('.sort-select');
				var str = ".sort-select option[value=" + term + "]"
				$(str).remove();
			}else{
				$this.removeClass('deselected');
				$this.addClass('selected');

				// add option from $('.sort-select');
				var opt = "<option value=" + term + ">"+term+"</option>";
				$(".sort-select").append(opt);
			}
		});
	}

	function initApiForm(){

		$("body").on("click", ".add-button", function(){
			var $this = $(this);
			var $parent = $this.parent();
			

			if($this.val() == "add"){
				$this.val('remove');
				// add a new chunk
				var chunk = $parent.clone();

				$(chunk).appendTo($parent.parent());
				$(chunk).find('.add-button').val('add');
				var sortName = Math.floor(Math.random()*1000);
				var sortVal = 'sort' + sortName;
				$(chunk).find('input[type=radio]').attr('name', sortVal);
			}else{
				$parent.remove();
			}

		});

	
		$("body").on("click", ".subtract", function(){
			var $this = $(this);
			var num = Number($this.siblings('.to-increment').html());
			if( num > 0){
				num--;
				$this.siblings('.to-increment').html(num);
			}


		});	

		$("body").on("click", ".add", function(){
			var $this = $(this);
			var num = Number($this.siblings('.to-increment').val());
			num++;
			$this.siblings('.to-increment').val(num);

		});

		
	}

	function addSort(){

	}

	_this.initGlobalApp = function() {
		initRollovers();
		initTags();
		initApiForm();
	}


	
	return obj;

}(Exo || {}));