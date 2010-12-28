(function(){

	controllers.add('article', function() {
		
		// This here is the constructor function for this controller.
		// In here we just define some default locally scoped variables that we will use later on.
		
		this.articleOne;
		this.articleTwo;
		this.timeouts = {};
		
	}, {
	
		onStart: function() {

			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway).
		
			// This is an example controller that publishes two articles and then removes them from the DOM.
			// The first article is published through event handler, the second one is published
			// directly with a timeout. The timeouts are stored internally within this.timeouts object for
			// clearing upon "uri.change" event.
			
			var that = this;
			
			document.title = 'Articles';
			
			var launchArticleOne = function(data) {
				that.articleOne = views.start('article', data);
			};

			this.listen('publish.articleOne', launchArticleOne);
			
			this.articles = models.article.getArticles();
			// To do: think about ways to make API calls from the model asynchronous, so the line above
			// might change based on what solution I will land on. The problem is that most API calls
			// are handled with an XHR request that takes time to get an answer to, so there must be a
			// way to delay returning of the data from the model to the controller...
			
			this.timeouts[0] = setTimeout(function() {
				that.trigger('publish.articleOne', that.articles[0]);
			}, 1000);
			
			this.timeouts[1] = setTimeout(function() {
				that.articleTwo = views.start('article', that.articles[1]);
			}, 2000);
			
			this.timeouts[2] = setTimeout(function() {
				that.articleTwo.stop();
			}, 5000);

			this.timeouts[3] = setTimeout(function() {
				that.articleOne.stop();
			}, 6000);

			this.timeouts[4] = setTimeout(function() {
				uri.goTo('/');
				that.stop();
			}, 7000);

			this.listen('uri.change', function() {
				that.stop();
			});
		},
		
		removeElements: function() {
			if (this.articleOne) { this.articleOne.stop(); }
			if (this.articleTwo) { this.articleTwo.stop(); }
			for (var key in this.timeouts) {
				clearTimeout(this.timeouts[key]);
			}
			delete this.timeouts;
		},
		
		onStop: function() {
			this.removeElements();
		}
		
	});

}());