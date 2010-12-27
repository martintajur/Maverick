(function(){
	
	views.add('article', function() {}, {
		
		onStart: function() {
		
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