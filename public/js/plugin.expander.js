(function( $ )
{
	$.fn.expander = function() {

/**************************************************************************
* ESTABLISH ROUTE SCOPE
*/

	obj = this;

/**************************************************************************
* DEFINE GLOBAL VARIABLES
*/

	panelOpen = new Array();

/**************************************************************************
* DEFINE MAIN FUNCTIONS
*/

	
	$(obj).find('div.roll-trigger').click(function(e) {
		e.preventDefault();

		var clickedIdx = $(this).closest('li.planet').index();
		var animHeight = $(this).closest('li.planet').find('div.expanded').height();
		
		if((panelOpen[clickedIdx] !== 'undefined') && (panelOpen[clickedIdx] !== true)) {

			
			$(this).closest('li.planet').animate({height: animHeight}, function() {
				$('li.planet').eq(clickedIdx).find('a.close-button').fadeTo(300, 1);
				$(this).find('.back-anim').animate({top: '-48px'}, function() {
					
				});
				panelOpen[clickedIdx] = true;

			});

		} else {

			$(this).closest('li.planet').animate({height: 45}, function() {
				$(this).find('.back-anim').animate({top: '0px'}, function() {
					
				});
				$('li.planet').eq(clickedIdx).find('a.close-button').fadeTo(300, 0, function() {
						$(this).hide();
				});
				panelOpen[clickedIdx] = false;
			});

		}
	});

/**************************************************************************
* BIND SELECTORS
*/



 

	
};
})( jQuery );// JavaScript Document