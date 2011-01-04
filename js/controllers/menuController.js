(function(){

	controllers.add('menu', function(options) {
		this.container = (options.container ? options.container : $('<div>').appendTo('body'));
	}, {
	
		onStart: function() {
		
			var that = this;
			
			this.menuView = views.start('menu', { container: this.container });
			
			this.menuView.menuElem.find('li:first a').addClass('active');
			
			this.menuView.menuElem.find('li a').each(function() {
				$(this).click(function(e) {
					$(this).addClass('active').parents('li').siblings('li').find('a').removeClass('active');
					uri.goTo($(this).attr('href'));
					e.preventDefault();
				});
			});
			
			var uriChangeFunction = function(uriObj) {
				var activeMenuItem = that.menuView.menuElem.find('a[href="/' + uriObj.getSegment(0) + '"]');
				if (activeMenuItem.length) {
					activeMenuItem.addClass('active').parents('li').siblings('li').find('a').removeClass('active');
				}
			};
			
			uriChangeFunction(uri);
			
			this.listen('uri.changed', uriChangeFunction);
			
		},
		
		onStop: function() {
			
		}
		
	});

}());