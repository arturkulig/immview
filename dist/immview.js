(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["immutable"], factory);
	else if(typeof exports === 'object')
		exports["immview"] = factory(require("immutable"));
	else
		root["immview"] = factory(root["immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Domain=exports.View=exports.Data=void 0;var _Domain=__webpack_require__(1),_Domain2=_interopRequireDefault(_Domain),_Data=__webpack_require__(4),_Data2=_interopRequireDefault(_Data),_View=__webpack_require__(5),_View2=_interopRequireDefault(_View);exports.Data=_Data2["default"],exports.View=_View2["default"],exports.Domain=_Domain2["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _Queue=__webpack_require__(2),_Queue2=_interopRequireDefault(_Queue),noop=function(){},Domain=function(){function e(t,i){_classCallCheck(this,e),this.view=null,this.data=null,this._actionNames=null,this._claimView(t),this._claimActions(i)}return _createClass(e,[{key:"_claimView",value:function(e){if(!e.isReactor)throw new Error("view is not inheriting Reactor type");this.view=e,e.isData&&(this.data=e)}},{key:"_claimActions",value:function(e){var t=this;this._actionNames=e?Object.keys(e):[],this._actionNames.forEach(function(i){if(t[i])throw new Error('"'+i+'" is reserved for Domain interface');t[i]=_Queue2["default"].createAction(e[i],t)})}},{key:"read",value:function(){return this.view.read()}},{key:"map",value:function(e){return this.view.map(e)}},{key:"subscribe",value:function(e){return this.view.subscribe(e)}},{key:"appendReactor",value:function(e){return this.view.appendReactor(e)}},{key:"destroy",value:function(){var e=this;this.view.destroy(),this.view=null,this.data=null,_Queue2["default"].rejectContext(this),this._actionNames.forEach(function(t){e[t]=noop}),this._actionNames=null}},{key:"structure",get:function(){return this.view&&this.view.structure}},{key:"isDomain",get:function(){return!0}}]),e}();exports["default"]=Domain;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var u in e)Object.prototype.hasOwnProperty.call(e,u)&&(n[u]=e[u]);return n["default"]=e,n}function createAction(e,n){return function(){for(var u=arguments.length,r=Array(u),t=0;u>t;t++)r[t]=arguments[t];appendAndRunQueue(e,n,r)}}function appendToQueue(e,n,u){queue=queue.add({action:e,context:n,args:u})}function appendAndRunQueue(e,n,u){appendToQueue(e,n,u),run()}function shiftFromQueue(){var e=queue.first();return queue=queue.rest(),e}function rejectContext(e){queue=queue.filter(function(n){return n.context!==e})}function run(){if(!isRunning){for(isRunning=!0;queue.count()>0;)try{runFirst()}catch(e){console.error("Immview.Queue run - Error occured while running running a function"),console.error(e.message)}isRunning=!1}}function runFirst(){var e=shiftFromQueue(),n=e.context,u=e.action,r=e.args;u.apply(n,r)}Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(3),I=_interopRequireWildcard(_immutable),isRunning=!1,queue=I.OrderedSet();exports["default"]={createAction:createAction,rejectContext:rejectContext,appendAndRunQueue:appendAndRunQueue};

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(3),I=_interopRequireWildcard(_immutable),_Queue=__webpack_require__(2),_Queue2=_interopRequireDefault(_Queue),_View=__webpack_require__(5),_View2=_interopRequireDefault(_View),_Reactor2=__webpack_require__(6),_Reactor3=_interopRequireDefault(_Reactor2),Data=function(e){function t(e){_classCallCheck(this,t);var r=_possibleConstructorReturn(this,Object.getPrototypeOf(t).call(this));return I.Iterable.isIterable(e)?r.digest(e):r.digest(I.fromJS(e)),r}return _inherits(t,e),_createClass(t,[{key:"write",value:function(e){"function"==typeof e?_Queue2["default"].appendAndRunQueue(function(){this.digest(e.apply(this,[this.read()]))},this,[e]):_Queue2["default"].appendAndRunQueue(this.digest,this,[e])}},{key:"map",value:function(e){return new _View2["default"](this,e)}},{key:"isData",get:function(){return!0}}]),t}(_Reactor3["default"]);exports["default"]=Data;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function _typeof(e){return e&&"undefined"!=typeof Symbol&&e.constructor===Symbol?"symbol":typeof e}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(3),I=_interopRequireWildcard(_immutable),_Reactor2=__webpack_require__(6),_Reactor3=_interopRequireDefault(_Reactor2),pass=function(e){return e},View=function(e){function t(e){var n=arguments.length<=1||void 0===arguments[1]?pass:arguments[1];_classCallCheck(this,t);var r=_possibleConstructorReturn(this,Object.getPrototypeOf(t).call(this));return e&&"object"===("undefined"==typeof e?"undefined":_typeof(e))&&(e.isReactor||e.isDomain?r.connectToView(e,n):r.connectToViews(e,n)),r}return _inherits(t,e),_createClass(t,[{key:"connectToView",value:function(e,t){var n=this;this.unsubs=[e.subscribe(function(e){return n.digest(t(e))})]}},{key:"connectToViews",value:function(e,t){var n=this,r=I.Map(),o=Object.keys(e);o.forEach(function(t){var n=e[t].read();n&&(r=r.set(t,n))});var u=function(){return n.digest(t(r))};this.unsubs=o.map(function(t){return e[t].appendReactor(function(e){r=r.set(t,e),u()})}),u()}},{key:"destroy",value:function(){_Reactor3["default"].prototype.destroy.call(this),this.unsubs&&this.unsubs.forEach(function(e){return e()}),this.unsubs=null}},{key:"map",value:function(e){return new t(this,e)}},{key:"isView",get:function(){return!0}}]),t}(_Reactor3["default"]);exports["default"]=View;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function hasValue(e){return void 0!==e&&null!==e}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var u=t[r];u.enumerable=u.enumerable||!1,u.configurable=!0,"value"in u&&(u.writable=!0),Object.defineProperty(e,u.key,u)}}return function(t,r,u){return r&&e(t.prototype,r),u&&e(t,u),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(3),emptySet=(0,_immutable.Set)(),Reactor=function(){function e(){_classCallCheck(this,e),this.reactors=emptySet,this.structure=void 0}return _createClass(e,[{key:"appendReactor",value:function(e){var t=this;return this.reactors=this.reactors.add(e),function(){t.reactors=t.reactors["delete"](e)}}},{key:"subscribe",value:function(e){return e(this.structure),this.appendReactor(e)}},{key:"digest",value:function(e){!hasValue(e)||hasValue(this.structure)&&(0,_immutable.is)(e,this.structure)!==!1||(this.structure=e,this.flush())}},{key:"flush",value:function(){var e=this;this.reactors.forEach(function(t){return t(e.structure)})}},{key:"destroyReactor",value:function(){this.structure=null,this.reactors=emptySet}},{key:"destroy",value:function(){this.destroyReactor()}},{key:"read",value:function(){return this.structure}},{key:"isReactor",get:function(){return!0}}]),e}();exports["default"]=Reactor;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=immview.js.map