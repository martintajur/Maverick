(function() {

	$views.add('home', function(options) {
		
		// This here is the constructor function for this view.
		// In here we can define some default locally scoped variables or do some other stuff.
		this.container = (options.container ? options.container : $('<div>').appendTo('body'));
		
	}, {
		
		onStart: function() {

			// Every view has an onStart() and an onEnd() function.
			// Everything that the view creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway but it is
			// a good idea to take care of removing any DOM elements generated by the view).
		
			var that = this;
			
			this.intro = $('<div><h1></h1><div class="intro"></div></div>')
				.find('.intro')
					.html('<p class="firstLine">You have successfully launched this demo application running on Maverick MVC framework.</p><p>This demo is pretty simple and helps you understand how to build a basic controller and a view. This demo consists of 4 $controllers and 4 $views - mainController, menuController, homeController and articlesController, mainView, menuView, homeView and articleView.</p><p>When you press the "Launch articles" button below, the application state (or URI) is switched to <code>/articles</code>, and the articlesController is launched and the homeController stops itself. The menuController and mainController will persist. The articlesController will then fetch some articles using the articleModel and display them by instantiating the articleView twice, then stop itself soon after, changing the URI back to <code>/</code> which is routed to the homeController, the current active controller.</p>')
					.end()
				.find('h1')
					.addClass('intro')
					.html('★ Demo application')
					.end()
				.appendTo(this.container);
				
			
			this.link = $('<div>')
				.addClass('launcher')
				.appendTo(this.container)
				.html('Launch articles')
				.click(function() {
					that.trigger('launch.articles');
				});
			
		},
		
		onStop: function() {
			this.container.empty();
		}
	
	});

}());
