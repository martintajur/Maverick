(function(){

	controllers.add('demo', function() {}, {
	
		onStart: function() {
			
			var that = this;
			
			this.demoView = views.start('demo');
			
			this.listen('launchArticles', function() {
				uri.goTo('/articles');
			});
			
			this.listen('url', function() {
				that.stop();
				that.demoView.stop();
			});
		},
		
		onStop: function() {
			
		}
		
	});

}());