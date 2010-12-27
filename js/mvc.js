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
	
	// enable/disable internal debugging
	this.debug = true; 
	
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
	
	// uri helper that contains internal data about uri segments, etc
	this.uriHelper = {};
	
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
	
	// internal reference within the main function to itself
	var _m = this;
	
	// prototype global objects
	if (!String.prototype.escapeRegexp) {
		String.prototype.escapeRegexp = function() {
			var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
			return this.replace(specials, "\\$&");
		};
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
				onStart: function() {
					return;
				},
				onStop: function() {
					return;
				},
				getType: function() {
					return 'model';
				}
			};
			_m.extend(modelProto, givenProto);
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
				stop: function() {
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
			_m.extend(viewProto, givenProto);
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
				if (_m.debug) { _m.log('Stopping view ' + view.getName()); }
				view.onStop();
				delete view;
				for (var event in _m.viewListeners[view.getName()]) {
					for (var listenerId in _m.viewListeners[view.getName()][event]) {
						_m.events.stopListener(event, listenerId);
					}
				}
				delete _m.viewListeners[view.getName()];
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
				stop: function() {
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
			_m.extend(controllerProto, givenProto);
			_m.availableControllers[controllerName].prototype = controllerProto;
		},
		
		// starts a controller
		// params: string controllerName, mixed options
		// returns: controllerInstance
		start: function(controllerName, options) {
			
			if (!controllerName) {
				controllerName = _m.router.findRoute(uri.asString());
			}
			
			if (!controllerName || controllerName === null) {
				return;
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
				if (_m.debug) { _m.log('Stopping controller ' + controller.getName()); }
				controller.onStop();
				for (var event in _m.controllerListeners[controller.getName()]) {
					for (var listenerId in _m.controllerListeners[controller.getName()][event]) {
						_m.events.stopListener(event, listenerId);
					}
				}
				delete _m.controllerListeners[controller.getName()];
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
		goTo: function(newUri) {
			document.location.hash = newUri;
			if (_m.debug) { _m.log('URI changed to ' + newUri); }
			return true;
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
		
	};
	
	// self-executing anonymous function that initiates the URI object
	(function() {
		
		// self-executing named function that updates the URI data
		var updateURI = (
			function() {
				return function() {
					_m.uriHelper.string = document.location.hash.toString().substr(1);
					_m.uriHelper.segments = _m.uriHelper.string.split('/');
				};
			}
		)();
		
		updateURI();
		
		// hash parameter listener function
		_m.uriHelper.listener = setInterval(function() {
			if (_m.uriHelper.string !== document.location.hash.toString().substr(1)) {
				if (_m.debug) { _m.log('Hash listener found out about the new URI.'); }

				updateURI();
				_m.events.trigger('uri.change', {});
				controllers.start();
			}
		}, 50);
		
	})();
	
	
	/*!
	 * The extend function below is from
	 * jQuery JavaScript Library v1.4.4
	 * Copyright 2010, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license	
	 */
	this.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}
	
		// extend jQuery itself if only one argument is passed
		if ( length === i ) {
			target = this;
			--i;
		}
	
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray(src) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};


}());

