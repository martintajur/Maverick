/*!
Maverick - the Javascript-based Model-View-Controller web application framework
Copyright (c) 2010 Martin Tajur (martin.tajur@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


// the only globally scoped variables are:
var models = {};
var views = {};
var controllers = {};
var routes = {};
var uri = {};

(function() {
	if (typeof jQuery !== 'function') {
		throw new Error('jQuery not loaded - cannot start Maverick');
	}

	// enable/disable internal debugging
	this.debug = true;
	
	// application state container ('hash' or 'history', default 'history')
	this.stateContainer = (document.location.protocol === 'file:' ? 'hash' : 'history');
	
	// internal logger
	this.log = (window.console.log ? function() { window.console.log('Maverick', arguments); } : function() { });
	
	// internal events handler
	this.events = { listeners: {} };
	
	// these listener container objects (for views, controllers and models) are used for internally storing of active listeners
	this.viewListeners = {};
	this.controllerListeners = {};
	this.modelListeners = {};
	
	// router is used to determine which controller to start based on URI
	this.router = {};
	
	// routes object will contain all active routes
	this.activeRoutes = {};
	
	// all views, controllers, models are stored within these objects
	this.availableViews = {};
	this.availableControllers = {};
	this.availableModels = {};
	
	// application state container
	this.appState = {};
	
	// uri helper that contains internal data about uri segments, etc
	this.uriHelper = {};
	
	// name of the "default" controller, so called welcomeController
	this.welcomeControllerName = '_maverickWelcome';
	
	// jQuery CDN path (used by welcomeController, only in case the welcomeController is started)
	this.jQueryCDNPath = 'http://code.jquery.com/jquery-1.4.4.min.js';
	
	// function that will always return a unique ID
	// params:
	// returns: int
	this.getUID = (
		function() {
			var id = 1;
			return function() {
				return id++;
			};
		}
	)();
	
	this.uriHelper._stateManagerRunning = false;

	// internal reference within the main function to itself
	var _m = this;
	
	// self-executing anonymous function that initiates the URI object
	this.uriHelper.stateManager = function() {
		if (_m.uriHelper._stateManagerRunning === false) {
			if (_m.debug) { _m.log('State Manager launched.'); }
			
			_m.uriHelper.stateChange();
					
			if (_m.uriHelper.listener) clearInterval(_m.uriHelper.listener);
			
			if (_m.stateContainer === 'hash') {
				// hash parameter listener function
				_m.uriHelper.listener = setInterval(function() {
					if (_m.uriHelper.string !== document.location.hash.toString().substr(1)) {
						if (_m.debug) { _m.log('Hash listener found out about the new URI.'); }
		
						_m.uriHelper.stateChange();
						controllers.start();
					}
				}, 50);
			}
			else if (_m.stateContainer === 'history') {
				// hash parameter listener function
				_m.uriHelper.listener = setInterval(function() {
					if (_m.uriHelper.string !== document.location.href.toString().replace(_m.uriHelper.baseUri, '')) {
						if (_m.debug) { _m.log('History listener found out about the new URI.'); }
		
						_m.uriHelper.stateChange();
						controllers.start();
					}
				}, 50);
			}
		}
		_m.uriHelper._stateManagerRunning = true;
	};

	this.uriHelper.stateChange = function() {
		if (_m.stateContainer === 'hash') {
			if (_m.debug) { _m.log('Application state changed.'); }
			_m.uriHelper.string = document.location.hash.toString().substr(1);
			_m.uriHelper.segments = _m.uriHelper.string.split('/');
		}
		else if (_m.stateContainer === 'history') {
			if (_m.debug) { _m.log('Application state changed.'); }
			_m.uriHelper.string = document.location.href.toString().replace(_m.uriHelper.baseUri, '');
			_m.uriHelper.segments = _m.uriHelper.string.split('/');
		}
		_m.events.trigger('uri.change', {});
	}
	
	// stores a new listener
	// params: string event, function listener
	// returns: int
	this.events.listen = function(event, listener) {
		var listenerId = _m.getUID('events.listen');
		if (!_m.events.listeners[event]) {
			_m.events.listeners[event] = {};
		}
		_m.events.listeners[event][listenerId] = listener;
		return listenerId;
	};
	
	// triggers an event and launches all active listeners of that event
	// params: string event, mixed data
	// returns: bool
	this.events.trigger = function(event, data) {
		if (_m.events.listeners[event]) {
			for (var key in _m.events.listeners[event]) {
				_m.events.listeners[event][key](data);
			}
		}
		return true;
	};
	
	// stops a listener
	// params: string event, string listenerId
	this.events.stopListener = function(event, listenerId) {
		delete _m.events.listeners[event][listenerId];
	};
	
	// finds a route based on given URI
	// params: string uri
	// return: string (relevant controller name)
	this.router.findRoute = function(givenUri) {
		var returnVal = false;
		if (_m.debug) { _m.log('Finding route for ' + givenUri); }
		for (var key in _m.activeRoutes) {
			if (givenUri === '') {
				if (key === '/') {
					returnVal = _m.activeRoutes[key];
				}
			}
			else {
				if (givenUri.toString().match(new RegExp('^' + key.replace('/','\/') + '$'))) {
					returnVal = _m.activeRoutes[key];
					if (_m.debug) { _m.log('Found route for ' + givenUri + '. The route is ' + _m.activeRoutes[key]); }
				}
			}
		}
		return returnVal;
	};
	
	models = {
	
		// adds a new model
		// params: string modelName , function construct, object givenProto
		add: function(modelName, construct, givenProto) {
			if (_m.debug) { _m.log('Adding model ' + modelName); }
			if (_m.availableModels[modelName]) {
				throw new Error('Model ' + modelName + ' is already present.');
				return;
			}
			_m.availableModels[modelName] = construct;
			
			var modelProto = {
				getName: function() {
					return modelName;
				},
				getType: function() {
					return 'model';
				}
			};
			$.extend(modelProto, givenProto);
			_m.availableModels[modelName].prototype = modelProto;
		}
	};
	
	views = {
	
		// adds a new view
		// params: string viewName, function construct, object givenProto
		add: function(viewName, construct, givenProto) {
			if (_m.debug) { _m.log('Adding view ' + viewName); }
			if (_m.availableViews[viewName]) {
				throw new Error('View ' + viewName + ' is already present.');
				return;
			}
			_m.availableViews[viewName] = construct;
	
			var viewProto = {
				getName: function() {
					return viewName;
				},
				onStart: function() {
					return;
				},
				onStop: function() {
					return;
				},
				getType: function() {
					return 'view';
				},
				isStarted: function() {
					return false;
				},
				beforeStop: function() {
					return;
				},
				stop: function() {
					return;
				},
				afterStop: function() {
					return;
				},
				trigger: function(event, data) {
					return _m.events.trigger(event, data);
				},
				listen: function(event, listener) {
					var listenerId = _m.events.listen(event, listener);
					if (!_m.viewListeners[viewName]) {
						_m.viewListeners[viewName] = {};
					}
					if (!_m.viewListeners[viewName][event]) {
						_m.viewListeners[viewName][event] = {};
					}
					_m.viewListeners[viewName][event][listenerId] = true;
				}
			};
			$.extend(viewProto, givenProto);
			_m.availableViews[viewName].prototype = viewProto;
		},
		
		// starts a view
		// params: string viewName, object options
		// returns: viewInstance
		start: function(viewName, options) {
			if (_m.debug) { _m.log('Starting view ' + viewName, options); }
			if (!_m.availableViews[viewName]) {
				throw new Error('Unable to start view ' + viewName + ' - undefined.');
			}
			var _view = new _m.availableViews[viewName](options);
			_view.isStarted = function() { return true; };
			
			for (var key in options) {
				if (!_view.hasOwnProperty(key)) {
					_view[key] = options[key];
				}
			}
			
			_view.stop = function() {
				return views.stop(_view);
			};
			
			_view.onStart();
			return _view;
		},
		
		// stops a view
		// params: viewInstance view
		// returns: bool
		stop: function(view) {
			var returnVal = false;
			if (view.isStarted() !== true) {
				throw new Error('Unable to stop a view ' + view.getName() + ' - the view was not started.');
				returnVal = false;
			}
			else {
				view.beforeStop();
				if (_m.debug) { _m.log('Stopping view ' + view.getName()); }
				view.onStop();
				for (var event in _m.viewListeners[view.getName()]) {
					for (var listenerId in _m.viewListeners[view.getName()][event]) {
						_m.events.stopListener(event, listenerId);
					}
				}
				delete _m.viewListeners[view.getName()];
				view.afterStop();
				delete view;
				returnVal = true;
			}
			return returnVal;
		}
	};
	
	controllers = {
	
		// adds a new controller
		// params: string controllerName, function construct, object givenProto
		add: function(controllerName, construct, givenProto) {
			if (_m.debug) { _m.log('Adding controller ' + controllerName); }
			if (_m.availableControllers[controllerName]) {
				throw new Error('Controller ' + controllerName + ' already present.');
				return;
			}
			_m.availableControllers[controllerName] = construct;
			
			var controllerProto = {
				getName: function() {
					return controllerName;
				},
				onStart: function() {
					return;
				},
				onStop: function() {
					return;
				},
				getType: function() {
					return 'controller';
				},
				isStarted: function() {
					return false;
				},
				beforeStop: function() {
					return;
				},
				stop: function() {
					return;
				},
				afterStop: function() {
					return;
				},
				trigger: function(event, data) {
					return _m.events.trigger(event, data);
				},
				listen: function(event, listener) {
					var listenerId = _m.events.listen(event, listener);
					if (!_m.controllerListeners[controllerName]) {
						_m.controllerListeners[controllerName] = {};
					}
					if (!_m.controllerListeners[controllerName][event]) {
						_m.controllerListeners[controllerName][event] = {};
					}
					_m.controllerListeners[controllerName][event][listenerId] = true;
				}
			};
			$.extend(controllerProto, givenProto);
			_m.availableControllers[controllerName].prototype = controllerProto;
		},
		
		// starts a controller
		// params: string controllerName, mixed options
		// returns: controllerInstance
		start: function(controllerName, options) {

			_m.uriHelper.stateManager();
			
			if (!controllerName) {
				controllerName = _m.router.findRoute(uri.asString());
			}
			
			if (!controllerName || controllerName === null) {
				controllerName = _m.welcomeControllerName;
			}
			
			if (_m.debug) { _m.log('Starting controller ' + controllerName); }
			if (!_m.availableControllers[controllerName]) {
				throw new Error('Unable to start controller ' + controllerName + ' - undefined.');
				return false;
			}
			var _controller = new _m.availableControllers[controllerName](options);
			_controller.isStarted = function() { return true; };

			_controller.stop = function() {
				return controllers.stop(_controller);
			};
			
			_controller.onStart();
			return _controller;
		},
		
		// stops a controller
		// params: controllerInstance controller
		// returns: bool
		stop: function(controller) {
			var returnVal = false;
			if (controller.isStarted() !== true) {
				throw new Error('Unable to stop a controller (the controller was not started).');
				returnVal = false;
			}
			else {
				controller.beforeStop();
				if (_m.debug) { _m.log('Stopping controller ' + controller.getName()); }
				controller.onStop();
				for (var event in _m.controllerListeners[controller.getName()]) {
					for (var listenerId in _m.controllerListeners[controller.getName()][event]) {
						_m.events.stopListener(event, listenerId);
					}
				}
				delete _m.controllerListeners[controller.getName()];
				controller.afterStop();
				delete controller;
				returnVal = true;
			}
			return returnVal;
		}
	};
	
	routes = {
	
		// adds a new route, overriding any of the previous routes with the same source
		// params: object options ({source: destination, source: destination ... })
		// returns bool
		add: function(options) {
			for (var key in options) {
				if (_m.debug) { _m.log('Adding route for ' + key + ': ' + options[key]); }
				_m.activeRoutes[key] = options[key];
			}
			return true;
		},
		
		// removes a route
		// params: string source
		remove: function(source) {
			if (!_m.activeRoutes[source]) {
				throw new Error('Unable to remove a route ' + source + ' - route does not exist.');
				return false;
			}
			else {
				delete _m.activeRoutes[source];
				return true;
			}
		}
	};
	
	uri = {
		
		// update the active URI
		// params: string uri
		// returns: bool
		goTo: function(newUri, newState) {
			if (!newState) {
				var newState = {};
			}
			$.extend(_m.appState, newState);
			if (_m.stateContainer === 'hash') {
				document.location.hash = newUri;
				if (_m.debug) { _m.log('URI changed to ' + newUri); }
				return true;
			}
			else if (_m.stateContainer === 'history') {
				if (history.pushState) {
					history.pushState(_m.appState, _m.uriHelper.baseUri + newUri, _m.uriHelper.baseUri + newUri);
					if (_m.debug) { _m.log('URI changed to ' + newUri); }
					_m.uriHelper.stateChange();
					controllers.start();
					return true;
				}
				else {
					return false;
				}
			}
		},
		
		// returns one URI segment
		// params: int i
		// returns: string
		getSegment: function(i) {
			return _m.uriHelper.segments[i+1];
		},

		// returns multiple URI segments, joined with /
		// params: int start, int end
		// returns: string
		getSegments: function(start, end) {
			var returnVal = false;
			if (start <= end) {
				start++;
				end++;
				returnVal = _m.uriHelper.segments;
				returnVal = returnVal.splice(start, end - start);
			}
			return returnVal;
		},

		// returns URI as object
		// params: int offset
		// returns: object
		asObj: function(offset) {
			var returnVal = {};
			for (var i = 0; i < _m.uriHelper.segments.length; i++) {
				returnVal[_m.uriHelper.segments[i]] = _m.uriHelper.segments[i+1]
				i = i + 2;
			}
			return returnVal;
		},

		// generates URI string from an object
		// params: object object
		// returns: string
		fromObj: function(object) {
			var returnVal = [];
			for (var key in object) {
				returnVal.push(key + '/' + object[key]);
			}
			return returnVal.join('/');
		},

		// returns full URI as string
		// params: 
		// returns: string
		asString: function() {
			return _m.uriHelper.segments.join('/');
		},

		// returns the number of URI segments in total
		// params: 
		// returns: int
		getTotalSegments: function() {
			return _m.uriHelper.segments.length;
		},

		// returns the segments as array
		// params: 
		// returns: array
		asArray: function() {
			return _m.uriHelper.segments;
		},
		
		// set the base URI that is used for all further URI generations
		// params: string baseUri
		// returns: bool
		setBase: function(baseUri) {
			_m.uriHelper.baseUri = (baseUri.substr(baseUri.length-1,1)==='/' ? baseUri.substr(0, baseUri.length-1) : baseUri);
			return true;
		},
		
		// returns the application State object
		// params: 
		// returns: mixed
		getState: function() {
			return _m.appState;
		}
		
	};
	
	/*!
	 * jQuery Rest - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed) 
	 */
	(function($){
		$.rest = $.json = { version : '1.1.0' }
		$.json.post = $.create = function(uri, data, callback) {
			return $.post(uri, data, callback, 'json')
		}
		$.json.get = $.read = function(uri, data, callback) {
			return $.getJSON(uri, data, callback)
		}
		$.json.put = $.update = function(uri, data, callback) {
			if ($.isFunction(data)) callback = data, data = {}
			return $.post(uri, $.extend(data, { _method: 'put' }), callback, 'json')
		}
		$.json.del = $.del = $.destroy = function(uri, data, callback) {
			if ($.isFunction(data)) callback = data, data = {}
			return $.post(uri, $.extend(data, { _method: 'delete' }), callback, 'json')
		}
	})(jQuery);
	
	// the welcomeController (only executed when there are no routes defined)
	controllers.add(_m.welcomeControllerName, function() {}, {
		onStart: function() {
			this.welcomeView = views.start(_m.welcomeControllerName);
		},
		onStop: function() {
			this.welcomeView.stop();
		}
	});
	
	// the welcomeController's view (only executed when there are no routes defined)
	views.add(_m.welcomeControllerName, function() {
		this.box = '';
	}, {
		onStart: function() {
			var that = this;
			var _build = function() {
				that.box = $('<div>')
					.addClass(_m.welcomeControllerName + 'Box')
					.css({
						'border': '1px #999 solid',
						'border-radius': '4px',
						'padding': '10px 20px',
						'background-color': '10px',
						'color': '#000',
						'line-height': '1.3'
					})
					.html(
						$('<div><h1></h1><div class="intro"></div><div>')
							.find('h1')
								.html('★ Hurray, Maverick is running!')
								.css({
									'font-size': '20px',
									'color': '#000',
									'margin-bottom': '10px'
								})
								.end()
							.find('.intro')
								.html('<p>It seems you have already started the application using <code>controllers.start();</code> but you see this screen because you seem to have no routes defined.</p><p>To define your first route, you need to do the following:</p><code>routes.add({ \'/\': \'<span style="color:#800;">[controllerName]</span>\' });</code>')
								.find('code')
									.css({
										'background-color': '#eee',
										'padding': '3px',
										'margin': '10px 0',
										'display': 'inline-block'
									})
								.end()
							.end()
					)
					.appendTo('body')
					.hide()
					.fadeIn(150);
			}

			if (typeof jQuery !== 'function') {
				var attempts = 0;
				var checker = {};
				var doCheck = function() {
					attempts++;
					if (typeof jQuery === 'function') {
						_build();
					}
					else if (attempts < 50) {
						checker = setTimeout(doCheck, 100);
					}
				};
				document.write('<script src="' + _m.jQueryCDNPath + '"></script>');
				
				checker = setTimeout(doCheck, 100);
			}
			else {
				_build();
			}
		},
		onStop: function() {
			this.box.remove();
		}
	});
	
}());

