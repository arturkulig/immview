(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["immutable"], factory);
	else if(typeof exports === 'object')
		exports["immview"] = factory(require("immutable"));
	else
		root["immview"] = factory(root["immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Domain=exports.View=exports.Data=void 0;var _Domain=__webpack_require__(1),_Domain2=_interopRequireDefault(_Domain),_Data=__webpack_require__(4),_Data2=_interopRequireDefault(_Data),_View=__webpack_require__(7),_View2=_interopRequireDefault(_View);exports.Data=_Data2["default"],exports.View=_View2["default"],exports.Domain=_Domain2["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t["default"]=e,t}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(2),I=_interopRequireWildcard(_immutable),_Queue=__webpack_require__(3),_Queue2=_interopRequireDefault(_Queue),noop=function(){},Domain=function(){function e(t,i){_classCallCheck(this,e),this.view=null,this.data=null,this._actionNames=null,this._claimView(t),this._claimActions(i)}return _createClass(e,[{key:"_claimView",value:function(e){if(!e.isReactor)throw new Error("view is not inheriting Reactor type");this.view=e,e.isData&&(this.data=e)}},{key:"_claimActions",value:function(e){var t=this;this._actionNames=e?Object.keys(e):[],this._actionNames.forEach(function(i){if(t[i])throw new Error('"'+i+'" is reserved for Domain interface');t[i]=_Queue2["default"].createAction(e[i],t)})}},{key:"subscribe",value:function(e){return this.view.subscribe(e)}},{key:"destroy",value:function(){var e=this;this.view.destroy(),this.view=null,this.data=null,_Queue2["default"].rejectContext(this),this._actionNames.forEach(function(t){e[t]=noop}),this._actionNames=null}},{key:"structure",get:function(){return this.view&&this.view.structure}},{key:"isDomain",get:function(){return!0}}]),e}();exports["default"]=Domain;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(r[n]=e[n]);return r["default"]=e,r}function createAction(e,r){return function(){for(var n=arguments.length,u=Array(n),t=0;n>t;t++)u[t]=arguments[t];appendToQueue(e,r,u),run()}}function appendToQueue(e,r,n){queue=queue.add({action:e,context:r,args:n})}function shiftFromQueue(){var e=queue.first();return queue=queue.rest(),e}function rejectContext(e){queue=queue.filter(function(r){return r.context!==e})}function run(){if(!isRunning){for(isRunning=!0;queue.count()>0;)try{runFirst()}catch(e){console.error("Immview.Queue run - Error occured while running running a function"),console.error(e.message)}isRunning=!1}}function runFirst(){var e=shiftFromQueue(),r=e.context,n=e.action,u=e.args;n.apply(r,u)}Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(2),I=_interopRequireWildcard(_immutable),isRunning=!1,queue=I.OrderedSet();exports["default"]={createAction:createAction,rejectContext:rejectContext};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t]);return r["default"]=e,r}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,r){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!r||"object"!=typeof r&&"function"!=typeof r?e:r}function _inherits(e,r){if("function"!=typeof r&&null!==r)throw new TypeError("Super expression must either be null or a function, not "+typeof r);e.prototype=Object.create(r&&r.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),r&&(Object.setPrototypeOf?Object.setPrototypeOf(e,r):e.__proto__=r)}var _createClass=function(){function e(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(r,t,n){return t&&e(r.prototype,t),n&&e(r,n),r}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(2),I=_interopRequireWildcard(_immutable),_Reactor2=__webpack_require__(5),_Reactor3=_interopRequireDefault(_Reactor2),_require=__webpack_require__(6),immutableWriteWrapper=_require.immutableWriteWrapper,immutableReadWrapper=_require.immutableReadWrapper,Data=function(e){function r(e){_classCallCheck(this,r);var t=_possibleConstructorReturn(this,Object.getPrototypeOf(r).call(this));return immutableReadWrapper(t),immutableWriteWrapper(t),t.digest(I.fromJS(e)),t}return _inherits(r,e),_createClass(r,[{key:"process",value:function(e){return e}},{key:"destroy",value:function(){this.structure=null,this.reactors=null}},{key:"isData",get:function(){return!0}}]),r}(_Reactor3["default"]);exports["default"]=Data;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t]);return r["default"]=e,r}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(r,t,a){return t&&e(r.prototype,t),a&&e(r,a),r}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(2),I=_interopRequireWildcard(_immutable),Reactor=function(){function e(){_classCallCheck(this,e),this.reactors=I.Set(),this.structure=void 0}return _createClass(e,[{key:"subscribe",value:function(e){var r=this;return this.reactors=this.reactors.add(e),e(this.structure),function(){r.reactors=r.reactors["delete"](e)}}},{key:"process",value:function(){throw new Error("abstract")}},{key:"digest",value:function(e){var r=this.process(e);r!==this.structure&&(this.structure=r,this.flush())}},{key:"flush",value:function(){var e=this;this.reactors.forEach(function(r){return r(e.structure)})}},{key:"destroy",value:function(){throw new Error("abstract")}},{key:"isReactor",get:function(){return!0}}]),e}();exports["default"]=Reactor;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function immutableReadWrapper(e){["equals","hashCode","get","has","includes","first","last","getIn","hasIn","toJS","toObject","toArray","toMap","toOrderedMap","toSet","toOrderedSet","toList","toStack","toSeq","toKeyedSeq","toIndexedSeq","toSetSeq","keys","values","entries","keySeq","valueSeq","entrySeq","map","filter","filterNot","reverse","sort","sortBy","groupBy","forEach","slice","rest","butLast","skip","skipLast","skipWhile","skipUntil","take","takeLast","takeWhile","takeUntil","concat","flatten","flatMap","reduce","reduceRight","every","some","join","isEmpty","count","countBy","find","findLast","findEntry","findLastEntry","max","maxBy","min","minBy","isSubset","isSuperset"].forEach(function(t){e[t]=function(){for(var r=arguments.length,a=Array(r),u=0;r>u;u++)a[u]=arguments[u];return e.structure[t].apply(e.structure,a)}})}function immutableWriteWrapper(e){["set","delete","update","merge","mergeDeep","setIn","deleteIn","updateIn","mergeIn","mergeDeepIn","add","clear","union","intersect","substract"].forEach(function(t){e[t]=_Queue2["default"].createAction(function(){for(var r=arguments.length,a=Array(r),u=0;r>u;u++)a[u]=arguments[u];e.digest(e.structure[t].apply(e.structure,a))})})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.immutableReadWrapper=exports.immutableWriteWrapper=void 0;var _Queue=__webpack_require__(3),_Queue2=_interopRequireDefault(_Queue);exports.immutableWriteWrapper=immutableWriteWrapper,exports.immutableReadWrapper=immutableReadWrapper;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function _typeof(e){return e&&"undefined"!=typeof Symbol&&e.constructor===Symbol?"symbol":typeof e}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();Object.defineProperty(exports,"__esModule",{value:!0});var _immutable=__webpack_require__(2),I=_interopRequireWildcard(_immutable),_Reactor2=__webpack_require__(5),_Reactor3=_interopRequireDefault(_Reactor2),_ImmutableWrapper=__webpack_require__(6),View=function(e){function t(e,r){_classCallCheck(this,t);var n=_possibleConstructorReturn(this,Object.getPrototypeOf(t).call(this));return r&&(n.process=r),(0,_ImmutableWrapper.immutableReadWrapper)(n),e&&"object"===("undefined"==typeof e?"undefined":_typeof(e))&&(e.isReactor||e.isDomain?n.connectToView(e):n.connectToViews(e)),n}return _inherits(t,e),_createClass(t,[{key:"connectToView",value:function(e){this.unsubs=[e.subscribe(this.digest.bind(this))]}},{key:"connectToViews",value:function(e){var t=this;this.prestructure=I.Map(),this.unsubs=Object.keys(e).map(function(r){var n=function(e){t.digest(t.prestructure=t.prestructure.set(r,e))};return e[r].subscribe(n)})}},{key:"process",value:function(e){return e}},{key:"destroy",value:function(){this.unsubs.forEach(function(e){return e()}),this.unsubs=null,this.structure=null,this.prestructure=null,this.reactors=null}},{key:"isView",get:function(){return!0}}]),t}(_Reactor3["default"]);exports["default"]=View;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=immview.js.map