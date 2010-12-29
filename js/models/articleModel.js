(function() {

	models.add('article', function() {}, {
		
		getArticles: function(params, callback) {
			
			// This is a dummy model function that simply fetches articles stored in a .json file
			// on the server, and then returns the JSON object to the callback function.
			
			// Since this demo can be executed as a local file on your computer (the file: protocol),
			// we simply return a static array if that's the case. Otherwise, if we're running a web
			// server and using HTTP, we make an XHR request to a JSON file.
			
			if (document.location.protocol === 'file:') {
				
				callback({
				    "0": {
				        "title": "European Broadband-Internet Satellite Launched",
				        "content": "A new satellite that promises to bring broadband Internet to homes and businesses across Europe and the Mediterranean was successfully launched on Sunday from the Baikonur Cosmodrome in Kazakhstan.",
				        "author": "Steve McGriffin" 
				    },
				    "1": {
				        "title": "Study ties brain structure size to socializing",
				        "content": "NEW YORK (AP) - Do you spend time with a lot of friends? That might mean a particular part of your brain is larger than usual. It's the amygdala, which lies deep inside.",
				        "author": "Steve McGriffin" 
				    }
				});
				
			}
			else {
			
				$.getJSON('../demo/articles.json', callback);
			
			}
			
		}
		
	});
	
}());
