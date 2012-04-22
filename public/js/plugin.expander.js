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

		var myScope = $(this).parent('li.planet');
		var clickedIdx = $('li.planet').index(myScope);



		var animHeight = $(this).closest('li.planet').find('div.expanded').height();
		
		if((panelOpen[clickedIdx] !== 'undefined') && (panelOpen[clickedIdx] !== true)) {

			
			$(this).closest('li.planet').animate({height: animHeight}, function() {
				$('li.planet').eq(clickedIdx).find('a.expand-image').fadeTo(300, 1);
				$('li.planet').eq(clickedIdx).find('a.close-button').fadeTo(300, 1);
				$(this).find('.back-anim').animate({top: '-48px'}, function() {
					$.fn.navigate.resizeHandle(0);
					
				});
				panelOpen[clickedIdx] = true;

			});

		} else {

			$(this).closest('li.planet').animate({height: 45}, function() {

				var myScope = $(this);
				$(this).find('.back-anim').animate({top: '0px'}, function() {
					
				});
				myScope.find('a.close-button').fadeTo(300, 0, function() {
						$('li.planet').eq(clickedIdx).find('a.expand-image').hide();
						$.fn.navigate.resizeHandle(0);
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