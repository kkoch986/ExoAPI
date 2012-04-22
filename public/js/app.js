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


		$('.roll-trigger').mouseenter(function() {
			$(this).find('div.back-anim').show();
			$(this).find('div.back-anim').delay(700).stop(true, true).animate({width:'360px'}, 400, 'easeOutQuad');
			$(this).find('h3').css({color: '#FFF'});
		});

		$('.roll-trigger').mouseleave(function() {
			$(this).find('div.back-anim').stop(true, true).animate({width:'0px'}, 600, 
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