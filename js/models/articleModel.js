(function() {

	models.add('article', function() {}, {
		
		getArticles: function(callback) {
			
			// This is a dummy model function that simply fetches articles stored in a .json file
			// on the server, and then returns the JSON object to the callback function.
			
			$.getJSON('../demo/articles.json', callback);
		}
		
	});
	
}());
