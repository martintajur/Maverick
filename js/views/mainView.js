(function() {

	$views.add('main', function() {}, {
		
		onStart: function() {

			this.menuContainer = $('<div>')
				.addClass('mainmenuContainer')
				.prependTo('body');
			
			this.contentContainer = $('<div>')
				.addClass('contentContainer')
				.appendTo('body');
				
		},
		
		onStop: function() {
			this.menuContainer.remove();
			this.contentContainer.remove();
		}
	
	});

}());
