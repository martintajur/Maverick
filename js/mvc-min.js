/*!
Maverick - the Javascript-based Model-View-Controller web application framework
Copyright (c) 2010-2011 Martin Tajur, Round Ltd (martin@round.ee)

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

var $models={add:function(){},getMany:function(){}};var $views={add:function(){},remove:function(){},start:function(){},stop:function(){}};var $controllers={add:function(){},remove:function(){},start:function(){},stop:function(){},autoStart:function(){}};var $routes={add:function(){},remove:function(){},setContainer:function(){}};var $uri={goTo:function(){},getSegment:function(){},getSegments:function(){},asObj:function(){},fromObj:function(){},asString:function(){},getTotalSegments:function(){},asArray:function(){},setBase:function(){},getState:function(){}};(function(){if(typeof jQuery!=='function'){throw new Error('jQuery not loaded - you must include jQuery before including the Maverick mvc.js.')}var _m={};_m.debug=true;_m.stateContainer=(document.location.protocol==='file:'?'hash':(window.history&&history.pushState?'history':'hash'));_m.log=(window.console&&window.console.log?function(){console.log('Maverick',arguments)}:function(){});_m.events={listeners:{}};_m.viewListeners={};_m.controllerListeners={};_m.modelListeners={};_m.router={};_m.activeRoutes=[];_m.availableViews={};_m.availableControllers={};_m.availableModels={};_m.autoStartControllers=true;_m.uriHelper={};_m.welcomeControllerName='_maverickWelcome'+Math.floor(Math.random()*1000+1);_m.jQueryCDNPath='http://code.jquery.com/jquery-1.4.4.min.js';_m.lastUri='';_m.getUID=(function(){var id=1;return function(){return id++}})();if(!String.prototype.removeTrailingSlash){String.prototype.removeTrailingSlash=function(){var returnVal=this;if(this.substr(this.length-1,1)==='/'){returnVal=this.substr(0,this.length-1)}return returnVal}}if(!String.prototype.removeLeadingSlash){String.prototype.removeLeadingSlash=function(){var returnVal=this;if(this.substr(0,1)==='/'){returnVal=this.substr(1,this.length-1)}return returnVal}}if(!String.prototype.trim){String.prototype.trim=function(){var returnVal=this;var whitespace=" \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";for(i=0;i<this.length;i++){if(whitespace.indexOf(this.charAt(i))===-1){returnVal=this.substring(i);break}}for(i=this.length-1;i>=0;i--){if(whitespace.indexOf(this.charAt(i))===-1){returnVal=this.substring(0,i+1);break}}return returnVal}}if(!Array.prototype.last){Array.prototype.last=function(){return this[this.length-1]}}if(!Array.prototype.stripEmpty){Array.prototype.stripEmpty=function(){var returnVal=new Array();for(var i=0;i<this.length;i++){if(this.hasOwnProperty(i)&&this[i]!=''&&this[i]!=null&&this[i]!=false){returnVal.push(this[i])}}return returnVal}}_m.uriHelper.stateManager=function(){if(!_m.uriHelper._stateManagerRunInstance){if(_m.debug){_m.log('State Manager launched.')}_m.lastUri=_m.uriHelper.getCurrentUri();_m.uriHelper.stateChange(true);var uriChangedHandler=function(){if(_m.lastUri!=_m.uriHelper.getCurrentUri()){if(_m.debug){_m.log('State manager found out about the new URI ('+_m.lastUri+' -> '+_m.uriHelper.getCurrentUri()+')')}_m.uriHelper.stateChange(true);_m.lastUri=_m.uriHelper.getCurrentUri();if(_m.autoStartControllers){$controllers.start()}}};_m.uriHelper._stateManagerRunInstance=setInterval(uriChangedHandler,10)}};_m.uriHelper.getCurrentUri=function(){var currentUri='';if(_m.stateContainer==='hash'){currentUri=document.location.hash.toString().removeTrailingSlash().substr(1).removeLeadingSlash()}else if(_m.stateContainer==='history'){currentUri=document.location.href.toString().removeTrailingSlash().replace(_m.uriHelper.baseUri,'').replace(document.location.hash,'').replace('#','').removeLeadingSlash()}return currentUri.toString()};_m.uriHelper.stateChange=function(triggerEvent){var givenUri=_m.uriHelper.getCurrentUri();if(_m.debug){_m.log('stateChange called with givenUri '+givenUri)}_m.uriHelper.string=givenUri;_m.uriHelper.segments=('/'+_m.uriHelper.string).split('/').stripEmpty();_m.uriHelper.segments.unshift('');if(triggerEvent){_m.events.trigger('uri.changed',$uri);if(_m.debug){_m.log('uri.changed event fired!')}}};_m.events.listen=function(event,listener){var listenerId=_m.getUID();if(!_m.events.listeners[event]){_m.events.listeners[event]={}}_m.events.listeners[event][listenerId]=listener;if(typeof _m.events.onListened==='function'){_m.events.onListened(event,listener,listenerId)}return listenerId};_m.events.trigger=function(event,data){if(_m.events.listeners[event]){for(var key in _m.events.listeners[event]){_m.events.listeners[event][key](data)}}if(typeof _m.events.onTriggered==='function'){_m.events.onTriggered(event,data)}return true};_m.events.stopListener=function(listenerId){var returnVal=false;for(var eventKey in _m.events.listeners){if(_m.events.listeners.hasOwnProperty(eventKey)&&_m.events.listeners[eventKey].hasOwnProperty(listenerId)){delete _m.events.listeners[eventKey][listenerId];returnVal=true;if(typeof _m.events.onListeningStopped==='function'){var remainingSubscriptions=0;for(var key in _m.events.listeners[eventKey]){if(_m.events.listeners[eventKey].hasOwnProperty(key)){remainingSubscriptions++}}_m.events.onListeningStopped(eventKey,listenerId,remainingSubscriptions)}}}return returnVal};_m.router.findRoute=function(givenUri){var returnVal='',uriToMatch;givenUri=givenUri.removeTrailingSlash();if(_m.debug){_m.log('Finding route for '+givenUri)}for(var key in _m.activeRoutes){if(_m.activeRoutes.hasOwnProperty(key)){if(givenUri===''){if(_m.activeRoutes[key].source==='/'){returnVal=_m.activeRoutes[key].destination}}else{if(givenUri.toString().match(new RegExp('^'+_m.activeRoutes[key].source.toString().removeTrailingSlash().replace('/','\/')+'$'))){returnVal=_m.activeRoutes[key].destination;if(_m.debug){_m.log('Found route for '+givenUri+'. The route is '+_m.activeRoutes[key].destination)}}}}}return returnVal};_m.selfHasFunction=function(){var returnVal=true;var args=[].slice.call(arguments);var params=args.join(',');if(params){var paramArr=params.toString().split(',');var paramArrEvaled=false;for(var i=0;i<paramArr.length;i++){if(typeof eval('this.'+paramArr[i].trim())==='undefined'){throw new Error(this.getType()+' '+this.getName()+' cannot start - required attribute missing: '+paramArr[i].trim());returnVal=false;break}}}return returnVal};$models={add:function(modelName,construct,givenProto){if(_m.debug){_m.log('Adding model '+modelName)}if(_m.availableModels[modelName]){throw new Error('Model '+modelName+' is already present.')}_m.availableModels[modelName]=construct;_m.availableModels[modelName].prototype={getName:function(){return modelName},getType:function(){return'model'}};for(var key in givenProto){if(givenProto.hasOwnProperty(key)){_m.availableModels[modelName].prototype[key]=givenProto[key]}};var modelInstance=new _m.availableModels[modelName]();modelInstance.isStarted=function(){return true};$models[modelName]={};for(var key in _m.availableModels[modelName].prototype){(function(currentKey){$models[modelName][currentKey]=function(params,callback){modelInstance[currentKey](params,callback);return{methodName:currentKey,method:modelInstance[currentKey],params:params,callback:callback}}}(key))}},getMany:function(){var args=[].slice.call(arguments);var callsTotal=args.length-1;var finishedCalls=0;var finalCallbackArguments=[];var multipleModelCallHandler=function(){finishedCalls++;finalCallbackArguments.push(arguments[0]);if(finishedCalls===callsTotal){args.last().apply(null,finalCallbackArguments)}};for(var key in args){if(key!=(args.length-1)&&args.hasOwnProperty(key)){args[key].method(args[key].params,multipleModelCallHandler)}}}}$views={add:function(viewName,construct,givenProto){if(_m.debug){_m.log('Adding view '+viewName)}if(_m.availableViews[viewName]){throw new Error('View '+viewName+' is already present.')}_m.availableViews[viewName]=construct;_m.availableViews[viewName].prototype={getName:function(){return viewName},has:_m.selfHasFunction,onStart:function(){return},onStop:function(){return},getType:function(){return'view'},isStarted:function(){return false},beforeStop:function(){return},stop:function(){return $views.stop(this)},afterStop:function(){return},trigger:function(event,data){return _m.events.trigger(event,data)},listen:function(event,listener){var listenerId=_m.events.listen(event,listener);if(!_m.viewListeners[this.getUID()]){_m.viewListeners[this.getUID()]={}}if(!_m.viewListeners[this.getUID()][event]){_m.viewListeners[this.getUID()][event]={}}_m.viewListeners[this.getUID()][event][listenerId]=true;return listenerId},stopListener:function(listenerId){var returnVal=false;if(_m.viewListeners[this.getUID()]){for(var eventKey in _m.viewListeners[this.getUID()]){if(_m.viewListeners[this.getUID()].hasOwnProperty(eventKey)){if(_m.viewListeners[this.getUID()][eventKey].hasOwnProperty(listenerId)){returnVal=_m.events.stopListener(listenerId);delete _m.viewListeners[this.getUID()][eventKey][listenerId]}}}}return returnVal}};for(var key in givenProto){if(givenProto.hasOwnProperty(key)){_m.availableViews[viewName].prototype[key]=givenProto[key]}}_m.events.trigger('view.added',{name:viewName})},start:function(viewName,options){if(_m.debug){_m.log('Starting view '+viewName,options)}if(!_m.availableViews[viewName]){throw new Error('Unable to start view '+viewName+' - undefined.')}var viewInstance=new _m.availableViews[viewName](options);var viewUID=_m.getUID();viewInstance.getUID=function(){return viewUID};viewInstance.isStarted=function(){return true};for(var key in options){if(!viewInstance.hasOwnProperty(key)){viewInstance[key]=options[key]}}viewInstance.stop=function(){return $views.stop(viewInstance)};viewInstance.rootElement=viewInstance.onStart();_m.events.trigger('view.started',{name:viewName,instance:viewInstance});return viewInstance},stop:function(view){var returnVal=false,viewName='',viewId='';if(view.isStarted()!==true){throw new Error('Unable to stop a view '+view.getName()+' - the view was not started.');returnVal=false}else{viewName=view.getName();viewId=view.getUID();view.beforeStop();if(_m.debug){_m.log('Stopping view '+view.getName()+' '+view.getUID())}view.onStop();for(var event in _m.viewListeners[view.getUID()]){for(var listenerId in _m.viewListeners[view.getUID()][event]){if(_m.debug){_m.log('Stopping view '+view.getName()+' '+view.getUID()+' listener '+listenerId+' for '+event)}_m.events.stopListener(listenerId)}}delete _m.viewListeners[view.getUID()];view.afterStop();delete view;returnVal=true}_m.events.trigger('view.stopped',{name:viewName,id:viewId});return returnVal}}$controllers={add:function(controllerName,construct,givenProto){if(_m.debug){_m.log('Adding controller '+controllerName)}if(_m.availableControllers[controllerName]){throw new Error('Controller '+controllerName+' already present.')}_m.availableControllers[controllerName]=construct;_m.availableControllers[controllerName].prototype={getName:function(){return controllerName},has:_m.selfHasFunction,onStart:function(){return},onStop:function(){return},getType:function(){return'controller'},isStarted:function(){return false},beforeStop:function(){return},stop:function(){return $controllers.stop(this)},afterStop:function(){return},trigger:function(event,data){return _m.events.trigger(event,data)},listen:function(event,listener){var listenerId=_m.events.listen(event,listener);if(!_m.controllerListeners[this.getUID()]){_m.controllerListeners[this.getUID()]={}}if(!_m.controllerListeners[this.getUID()][event]){_m.controllerListeners[this.getUID()][event]={}}_m.controllerListeners[this.getUID()][event][listenerId]=true},stopListener:function(listenerId){var returnVal=false;if(_m.controllerListeners[this.getUID()]){for(var eventKey in _m.controllerListeners[this.getUID()]){if(_m.controllerListeners[this.getUID()].hasOwnProperty(eventKey)){if(_m.controllerListeners[this.getUID()][eventKey].hasOwnProperty(listenerId)){returnVal=_m.events.stopListener(listenerId);delete _m.controllerListeners[this.getUID()][eventKey][listenerId]}}}}return returnVal},startView:function(viewName,options){},stopView:function(viewInstance){}};for(var key in givenProto){if(givenProto.hasOwnProperty(key)){_m.availableControllers[controllerName].prototype[key]=givenProto[key]}}_m.events.trigger('controller.added',{name:controllerName})},start:function(controllerCall,options){_m.uriHelper.stateManager();if(_m.debug){_m.log('Trying to start controller: '+controllerCall,options)}if(!controllerCall||controllerCall==='/'||controllerCall==''){controllerCall=_m.router.findRoute($uri.asString())}if(!controllerCall||controllerCall===null){controllerCall=_m.welcomeControllerName}var controllerName=controllerCall.removeTrailingSlash().removeLeadingSlash().split('/')[0];var controllerInstance=false;if(typeof _m.availableControllers[controllerName]!=='undefined'){controllerInstance=new _m.availableControllers[controllerName](options)}if(controllerInstance!==false){var controllerUID=_m.getUID();controllerInstance.getUID=function(){return controllerUID};controllerInstance.isStarted=function(){return true};controllerInstance.stop=function(){return $controllers.stop(controllerInstance)};controllerInstance.onStart();_m.events.trigger('controller.started',{call:controllerCall,name:controllerName,options:options,instance:controllerInstance,id:controllerInstance.getUID()})}return controllerInstance},stop:function(controller){var returnVal=false,controllerName='',controllerUID='';if(controller.isStarted()!==true){throw new Error('Unable to stop a controller - the controller was never started.');returnVal=false}else{controllerName=controller.getName();controllerUID=controller.getUID();controller.beforeStop();if(_m.debug){_m.log('Stopping controller '+controller.getName()+' '+controller.getUID())}controller.onStop();for(var event in _m.controllerListeners[controller.getUID()]){for(var listenerId in _m.controllerListeners[controller.getUID()][event]){if(_m.debug){_m.log('Stopping controller '+controller.getName()+' '+controller.getUID()+' listener '+listenerId+' for '+event)}_m.events.stopListener(listenerId)}}delete _m.controllerListeners[controller.getUID()];controller.afterStop();delete controller;returnVal=true}_m.events.trigger('controller.stopped',{name:controllerName,id:controllerUID});return returnVal},autoStart:function(state){_m.autoStartControllers=state;return true}}$routes={add:function(options){for(var key in options){if(_m.debug){_m.log('Adding route for '+key+': '+options[key])}_m.activeRoutes.push({source:key,destination:options[key]});_m.events.trigger('route.added',{source:key,destination:options[key]})}return true},remove:function(source){var returnVal=false,tmpData;for(var key in _m.activeRoutes){if(_m.activeRoutes[key].source===source){tmpData=_m.activeRoutes[key];delete _m.activeRoutes[key];_m.events.trigger('route.removed',{source:tmpData.source,destination:tmpData.destination});returnVal=true}}if(returnVal===false){throw new Error('Unable to remove a route '+source+' - route does not exist.')}return returnVal},find:function(uriString){return _m.router.findRoute(uriString)}}$uri={goTo:function(newUri){if(!newUri){throw new Error('Cannot change URI - new URI not given.')}if(!newState){var newState={}}newUri=newUri.toString().removeTrailingSlash();if(_m.uriHelper.uriSwitcher){clearTimeout(_m.uriHelper.uriSwitcher)}var uriSwitchHandler=function(){if(_m.stateContainer==='hash'){document.location.hash=newUri;if(_m.debug){_m.log('URI changed to '+newUri)}}else if(_m.stateContainer==='history'){window.history.pushState(null,_m.uriHelper.baseUri+newUri,_m.uriHelper.baseUri+newUri);if(_m.autoStartControllers){$controllers.start()}if(_m.debug){_m.log('URI changed to '+newUri)}}_m.uriHelper.stateManager()};_m.uriHelper.uriSwitcher=setTimeout(uriSwitchHandler,1);uriSwitchHandler();return true},getSegment:function(i){var returnVal='';if(typeof _m.uriHelper.segments[i]!=='undefined'){returnVal=_m.uriHelper.segments[i]}return returnVal},getSegments:function(start,end){var returnVal=false;if(start<=end){start++;end++;returnVal=_m.uriHelper.segments;returnVal=returnVal.splice(start,end-start)}return returnVal},asObj:function(offset){var returnVal={};for(var i=0;i<_m.uriHelper.segments.length;i++){returnVal[_m.uriHelper.segments[i]]=_m.uriHelper.segments[i+1]i=i+2}return returnVal},toObj:function($uri){var returnVal={},$uriPts=$uri.split('/');for(var i=0;i<$uriPts.length;i++){returnVal[$uriPts[i]]=($uriPts[i+1]?$uriPts[i+1]:null);i=i+1}return returnVal},fromObj:function(object){var returnVal=[];for(var key in object){returnVal.push(key+'/'+object[key])}return returnVal.join('/')},asString:function(){return _m.uriHelper.segments.join('/')},getTotalSegments:function(){return _m.uriHelper.segments.length},asArray:function(){return _m.uriHelper.segments},setBase:function(baseUri){var tmpData=_m.uriHelper.baseUri;_m.uriHelper.baseUri=baseUri.removeTrailingSlash();_m.events.trigger('uri.base.changed',{'old':tmpData,'new':_m.uriHelper.baseUri});return true},setContainer:function(container){if(container==='history'||container==='hash'){if(container==='history'&&typeof window.history!=='undefined'&&typeof window.history.pushState!=='undefined'){_m.stateContainer=container}else{_m.stateContainer='hash'}return true}else{return false}}};$events={onListened:function(handler){var returnVal=false;if(typeof handler==='function'){_m.events.onListened=handler;returnVal=true}return returnVal},onTriggered:function(handler){var returnVal=false;if(typeof handler==='function'){_m.events.onTriggered=handler;returnVal=true}return returnVal},onListeningStopped:function(handler){var returnVal=false;if(typeof handler==='function'){_m.events.onListeningStopped=handler;returnVal=true}return returnVal}}$uri.setBase(document.location.href);$controllers.add(_m.welcomeControllerName,function(){},{onStart:function(){var that=this;this.welcomeView=$views.start(_m.welcomeControllerName);this.listen('uri.changed',function(){that.onStop()});this.trigger('error.404')},onStop:function(){this.welcomeView.stop()}});$views.add(_m.welcomeControllerName,function(){this.box=''},{onStart:function(){var that=this;var _build=function(){that.box=$('<div>').addClass(_m.welcomeControllerName+'Box').css({'border':'1px #999 solid','border-radius':'4px','padding':'10px 20px','background-color':'10px','color':'#000','line-height':'1.3'}).html($('<div><h1></h1><div class="intro"></div><div>').find('h1').html('Not found').css({'font-size':'20px','color':'#000','margin-bottom':'10px'}).end().find('.intro').html('<p>You are trying to reach a route that was not defined (<code>'+$uri.asString()+'</code>).</p><p>To define this route, you need the following code:</p><code>$routes.add({ \''+$uri.asString()+'\': \'<span style="color:#800;">[controllerName]</span>\' });</code>').find('code').css({'background-color':'#eee','padding':'3px','margin':'10px 0','display':'inline-block'}).end().end()).appendTo('body').hide().fadeIn(150)}if(typeof jQuery!=='function'){var attempts=0;var checker={};var doCheck=function(){attempts++;if(typeof jQuery==='function'){_build()}else if(attempts<50){checker=setTimeout(doCheck,100)}};document.write('<script src="'+_m.jQueryCDNPath+'"></script>');checker=setTimeout(doCheck,100)}else{_build()}},onStop:function(){this.box.remove()}})}());