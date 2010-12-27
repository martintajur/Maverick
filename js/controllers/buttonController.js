(function(){

	controllers.add('button', function() {}, {
	
		onStart: function() {
			
			// This is an example controller that simply operates the "Launch articles" button.
			// After the user presses the "Launch articles" button, the URI is changed to /articles
			// and the articleController will take over. This is done through listeners.
			
			var that = this;
			
			this.demoView = views.start('button');
			
			// This controller listens to the "launch.articles" event:
			this.listen('launch.articles', function() {
				uri.goTo('/articles');
			});
			
			// This controller also listens to the "url.change" event:
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