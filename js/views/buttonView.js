(function() {

	views.add('button', function() {
		
		// This here is the constructor function for this view.
		// In here we can define some default locally scoped variables or do some other stuff.
		// In this view right now, we don't need to use the constructor at all.
	
	}, {
		
		onStart: function() {

			// Every view has onStart() and onEnd() functions.
			// Everything that the view creates in onStart() should be removed in onEnd().
		
			var that = this;

			this.link = $('<div>')
				.addClass('launcher')
				.appendTo('body')
				.html('Launch articles')
				.click(function() {
					that.trigger('launch.articles');
				});
			
		},
		
		onStop: function() {
			this.link.remove();
		}
	
	});

}());
