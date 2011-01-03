(function(){

	controllers.add('main', function() {}, {
	
		onStart: function() {
			
			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway).
		
			// This is an example controller that simply operates the "Launch articles" button.
			// After the user presses the "Launch articles" button, the URI is changed to /articles
			// and the articleController will take over. This is done through listeners.
			
			var that = this;
			
			document.title = 'Maverick';
			
			this.mainView = views.start('main');
			
		},
		
		onStop: function() {
			this.demoView.stop();
		}
		
	});

}());