(function(){
	
	views.add('article', function() {
		
		// This here is the constructor function for this view.
		// In here we can define some default locally scoped variables or do some other stuff.
		// In this view right now, we don't need to use the constructor at all.
	
	}, {
		
		onStart: function() {
		
			// Every view has onStart() and onEnd() functions.
			// Everything that the view creates in onStart() should be removed in onEnd().
		
			this.box = $('<article>');
			
			this.titleElem = $('<h1>')
				.html(this.title)
				.appendTo(this.box);
			
			this.authorElem = $('<small>')
				.html('By ' + this.author)
				.addClass('author')
				.appendTo(this.box);
			
			this.contentElem = $('<div>')
				.addClass('content')
				.html(this.content)
				.appendTo(this.box);
			
			this.box.hide().appendTo('body').fadeIn(100);
			
		},
		
		onStop: function() {
			this.box.fadeOut(100, function() { $(this).remove(); });
		}

	});
	
}());