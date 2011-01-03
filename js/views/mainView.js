(function() {

	views.add('main', function() {}, {
		
		onStart: function() {

			this.menuElement = $('<div>')
				.addClass('mainmenu')
				.appendTo('body');
			
			this.contentElement = $('<div>')
				.addClass('content')
				.appendTo('body');
				
		},
		
		onStop: function() {
			this.menuElement.remove();
			this.contentElement.remove();
		}
	
	});

}());
