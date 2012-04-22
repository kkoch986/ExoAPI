(function( $ )
{
	$.fn.navigate = function() {

/**************************************************************************
* ESTABLISH ROUTE SCOPE
*/

	obj = this;

/**************************************************************************
*  DEFINE GLOBAL VARIABLES
*/
	var pageIdx = 0;
	var numPages = $('ul.slides li.slide').size();
	var pageWidth = $('ul.slides li.slide').width();

	var isAnimating = false;


/**************************************************************************
*  DEFINE MAIN FUNCTIONS
*/	

	function resizeWrapper(target) {
		var setHeight = parseInt($('li.slide').eq(target).height());
		setHeight += 100;
		$('ul.slides').css({height:setHeight});

	}

	$.fn.navigate.resizeHandle = function(target) {
		resizeWrapper(target);
	}



	function slideToSlide(target) {
		if(isAnimating === false) {
			$('.arrows').fadeTo(100, 0);
			isAnimating === true;
			animDistance = pageWidth * target;

			resizeWrapper(target);
			 $('body').animate({scrollTop : 0},'slow');
			$('ul.slides').animate({left: - animDistance},function() {
				$('.arrows').fadeTo(200, 1);
				pageIdx = target;
				isAnimating = false;
			});
		}

	}

	function slideRight(target) {
		if(pageIdx < numPages) {
			slideToSlide(pageIdx + 1);
		}
	}

	function slideLeft(target) {
		if(pageIdx > 0) {
			slideToSlide(pageIdx - 1);
		}
	}


/**************************************************************************
*  BIND LISTENERS
*/	

	$('li.demo').click(function(e) {
		e.preventDefault();
		slideToSlide(0);
	});

	$('li.docs').click(function(e) {
		e.preventDefault();
		slideToSlide(1);
	});

	$('li.interact').click(function(e) {
		e.preventDefault();
		slideToSlide(2);
	});

	$('a.arrow-rt').click(function(e) {
		e.preventDefault();
		slideRight();
	});

	$('a.arrow-lt').click(function(e) {
		e.preventDefault();
		slideLeft();
	});

	

	resizeWrapper(0);

 

	
};
})( jQuery );// JavaScript Document