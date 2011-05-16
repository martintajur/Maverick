(function(){

	$controllers.add('articles', function(options) {
		
		// This here is the constructor function for this controller.
		// In here we just define some default locally scoped variables that we will use later on.
		
		this.articleOne = false;
		this.articleTwo = false;
		this.timeouts = new Object();
		this.container = (options.container ? options.container : $('<div>').appendTo('body'));
		
	}, {
	
		onStart: function() {
			console.log('ARTICLE VIEW INSTANCE', this);
			// Every controller has an onStart() and an onEnd() function.
			// Everything that the controller creates in onStart() *should* be removed in onEnd()
			// (the view instance is released from the memory upon stopping anyway).
		
			// This is an example controller that publishes two articles and then removes them from the DOM.
			// The first article is published through event handler, the second one is published
			// directly with a timeout. The timeouts are stored internally within this.timeouts object for
			// clearing upon "$uri.change" event.
			
			var that = this;
			
			document.title = 'Articles';
			
			var launchArticleOne = function(data) {
				that.articleOne = $views.start('article', data);
			};

			this.listen('publish.articleOne', launchArticleOne);
			
			$models.article.getArticles({}, function(articles) {
				console.log(that);
				
				that.timeouts[0] = setTimeout(function() {
					that.trigger('publish.articleOne', {
						container: that.container,
						article: articles[0]
					});
				}, 1000);
				
				that.timeouts[1] = setTimeout(function() {
					that.articleTwo = $views.start('article', {
						container: that.container,
						article: articles[1]
					});
				}, 2000);
				
				that.timeouts[2] = setTimeout(function() {
					that.articleTwo.stop();
				}, 5000);
	
				that.timeouts[3] = setTimeout(function() {
					that.articleOne.stop();
				}, 6000);
	
				that.timeouts[4] = setTimeout(function() {
					$uri.goTo('/');
					that.stop();
				}, 7000);
			});

			this.listen('uri.changed', function() {
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