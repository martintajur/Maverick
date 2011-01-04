(function(){

	controllers.add('main', function() {}, {
	
		onStart: function() {
			
			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
		
			// This is an example controller that creates the menu and the content containers,
			// then binds a function (uriChangeFunction) that executes whenever an application URI
			// changes).
			
			var that = this;
			
			document.title = 'Maverick';
			
			this.mainView = views.start('main');
			
			controllers.start('menu', { container: this.mainView.menuContainer });
			
			// This is a function that is executed each time the URI changes. It is also executed
			// upon starting this controller. The standard uri is supposed to be passed to this
			// function.
			var uriChangeFunction = function(uriObj) {
				
				// This line basically starts whatever controller is asked for through the URI and
				// tells it to render itself into a specific container:
				controllers.start(uriObj.asString(), { container: that.mainView.contentContainer });
				
			};
			
			// First we start the uriChangeFunction and supply the current uri object.
			uriChangeFunction(uri);
			
			this.listen('uri.changed', uriChangeFunction);
		},
		
		onStop: function() {
			this.mainView.stop();
		}
		
	});
	
}());