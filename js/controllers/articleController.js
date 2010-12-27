(function(){

	controllers.add('article', function() {
		
		this.author = 'Steve McGriffin';
		this.articleOne;
		this.articleTwo;
		this.timeouts = [];
		
	}, {
	
		onStart: function() {
			
			// This is an example controller that publishes two articles and then removes them.
			// the first article is published through event handler, the second one is published
			// directly.
			
			var that = this;
			
			var launchArticleOne = function(data) {
				that.articleOne = views.start('article', data);
			};

			this.listen('publishArticleOne', launchArticleOne);
			
			this.timeouts[0] = setTimeout(function() {
				that.trigger('publishArticleOne', {
					title: 'European Broadband-Internet Satellite Launched',
					content: "A new satellite that promises to bring broadband Internet to homes and businesses across Europe and the Mediterranean was successfully launched on Sunday from the Baikonur Cosmodrome in Kazakhstan.",
					author: that.author
				});
			}, 1000);
			
			this.timeouts[1] = setTimeout(function() {
				that.articleTwo = views.start('article', {
					title: 'Study ties brain structure size to socializing ',
					content: "NEW YORK (AP) - Do you spend time with a lot of friends? That might mean a particular part of your brain is larger than usual. It's the amygdala, which lies deep inside.",
					author: that.author
				});
			}, 2000);
			
			this.timeouts[2] = setTimeout(function() {
				that.articleTwo.stop();
			}, 5000);

			this.timeouts[3] = setTimeout(function() {
				that.articleOne.stop();
			}, 6000);

			this.timeouts[4] = setTimeout(function() {
				that.stop();
			}, 7000);
			
			this.timeouts[5] = setTimeout(function() {
				uri.goTo('/');
			}, 8000);

			this.listen('url', function() {
				if (that.articleOne) that.articleOne.stop();
				if (that.articleTwo) that.articleTwo.stop();
				for (var key in that.timeouts) {
					clearTimeout(that.timeouts[key]);
				}
				delete that.timeouts;
				that.stop();
			});
		},
		
		onStop: function() {
			
		}
		
	});

}());