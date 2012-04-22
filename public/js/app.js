var Exo = (function (obj) {
	
	_this = obj;

	_this.global = function() {
		//global function
	}

	function private() {
		//private function
	}

	function initRollovers() {

		$('a.filler').each(function(){
			var $this = $(this);
			var dataTitle = $this.innerHTML();
			console.log(dataTitle);
			var embed = '<span data-title="' + dataTitle + '">' + dataTitle + '</span>';
			$this.innerHTML(embed);

		});




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

	_this.initGlobalApp = function() {
		initRollovers();
	}


	
	return obj;

}(Exo || {}));