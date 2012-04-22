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

	var pageNames = new Array();
	pageNames[0] = "Demo ///";
	pageNames[1] = "Docs ///";
	pageNames[2] = "Interact ///";


/**************************************************************************
*  DEFINE MAIN FUNCTIONS
*/	

	function setPageName(target) {
		$('#page-holder').html(pageNames[target]);
	}

	function setArrows(target) {
		if(target <= 0) {
			$('a.arrow-lt').hide();
			$('a.arrow-rt').show();
		} else if (target >= (numPages -1)) {
			$('a.arrow-lt').show();
			$('a.arrow-rt').hide();
		} else {
			$('a.arrow-lt').show();
			$('a.arrow-rt').show();
		}
	}

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
				setPageName(target);
				$('.arrows').fadeTo(200, 1);
				setArrows(target)
				pageIdx = target;
				isAnimating = false;
			});
		}

	}

	function slideRight(target) {
		if(pageIdx < (numPages -1)) {
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

	$('li.demo-link').click(function(e) {
		e.preventDefault();
		slideToSlide(0);
	});

	$('li.docs-link').click(function(e) {
		e.preventDefault();
		slideToSlide(1);
	});

	$('li.interact-link').click(function(e) {
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