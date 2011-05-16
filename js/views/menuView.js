(function() {

	$views.add('menu', function() {
		
		// This here is the constructor function for this view.
		// In here we can define some default locally scoped variables or do some other stuff.
		
	}, {
		
		onStart: function() {

			this.menuElem = $('<ul>')
				.html('<li><a href="/">Home</a></li><li><a href="/articles">Articles</a></li>')
				.appendTo(this.container);
			
		},
		
		onStop: function() {
			this.container.remove();
		}
	
	});

}());
