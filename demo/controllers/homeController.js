(function(){

	$controllers.add('home', function(options) {
		this.container = (options.container ? options.container : $('<div>').appendTo('body'));
	}, {
	
		onStart: function() {
			
			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway).
		
			// This is an example controller that simply operates the "Launch articles" button.
			// After the user presses the "Launch articles" button, the URI is changed to /articles
			// and the articleController will take over. This is done through listeners.
			
			var that = this;
			
			document.title = 'Demo application';
			
			// Start the button view
			this.demoView = $views.start('home', { container: this.container });
			
			// Listen to the "launch.articles" event:
			this.listen('launch.articles', function() {
				$uri.goTo('/articles');
			});
			
			// Also listen to the "url.change" event:
			// (note: the "url.change" event is a global event that is triggered automatically upon
			// the URI changes.
			this.listen('uri.changed', function() {
				that.stop();
			});
		},
		
		onStop: function() {
			this.demoView.stop();
		}
		
	});

}());