(function(){

	controllers.add('button', function() {}, {
	
		onStart: function() {
			
			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway).
		
			// This is an example controller that simply operates the "Launch articles" button.
			// After the user presses the "Launch articles" button, the URI is changed to /articles
			// and the articleController will take over. This is done through listeners.
			
			var that = this;
			
			document.title = 'Welcome to Maverick';
			
			// Start the button view
			this.demoView = views.start('button');
			
			// Listen to the "launch.articles" event:
			this.listen('launch.articles', function() {
				uri.goTo('/articles');
			});
			
			// Also listen to the "url.change" event:
			// (note: the "url.change" event is a global event that is triggered automatically upon
			// the URI changes.
			this.listen('uri.change', function() {
				that.stop();
			});
		},
		
		onStop: function() {
			this.demoView.stop();
		}
		
	});

}());