(function() {

	views.add('demo', function() {}, {
		
		onStart: function() {
			var that = this;

			this.link = $('<div>')
				.addClass('launcher')
				.appendTo('body')
				.html('Launch articles')
				.click(function() {
					that.trigger('launchArticles');
				});
		},
		
		onStop: function() {
			this.link.remove();
		}
	
	});

}());
