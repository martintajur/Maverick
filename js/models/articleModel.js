(function() {

	models.add('article', function() {}, {
		
		getArticles: function() {
			return {
				0: {
					title: 'European Broadband-Internet Satellite Launched',
					content: "A new satellite that promises to bring broadband Internet to homes and businesses across Europe and the Mediterranean was successfully launched on Sunday from the Baikonur Cosmodrome in Kazakhstan.",
					author: 'Steve McGriffin'
				},
				1: {
					title: 'Study ties brain structure size to socializing ',
					content: "NEW YORK (AP) - Do you spend time with a lot of friends? That might mean a particular part of your brain is larger than usual. It's the amygdala, which lies deep inside.",
					author: 'Steve McGriffin'
				}
			}
		}
		
	});
	
}());
