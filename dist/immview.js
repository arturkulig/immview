(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["Immutable"], factory);
	else if(typeof exports === 'object')
		exports["immview"] = factory(require("Immutable"));
	else
		root["immview"] = factory(root["Immutable"]);
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

	'use strict';
	
	var Data = __webpack_require__(1);
	var View = __webpack_require__(4);
	
	module.exports = {
	    Data: Data,
	    View: View
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var I = __webpack_require__(2);
	var Reactor = __webpack_require__(3);
	var View = __webpack_require__(4);
	
	var _require = __webpack_require__(5);
	
	var immutableWriteWrapper = _require.immutableWriteWrapper;
	var immutableReadWrapper = _require.immutableReadWrapper;
	
	var Data = (function (_Reactor) {
	    _inherits(Data, _Reactor);
	
	    function Data(initialData) {
	        _classCallCheck(this, Data);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Data).call(this));
	
	        _this.digest(I.fromJS(initialData));
	        immutableReadWrapper(_this);
	        immutableWriteWrapper(_this);
	        return _this;
	    }
	
	    _createClass(Data, [{
	        key: 'process',
	        value: function process(data) {
	            return data;
	        }
	    }, {
	        key: 'isData',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return Data;
	})(Reactor);
	
	module.exports = Data;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var I = __webpack_require__(2);
	
	var Reactor = (function () {
	    function Reactor() {
	        _classCallCheck(this, Reactor);
	
	        this.reactors = I.Set();
	        this.structure = undefined; //yet declared
	    }
	
	    _createClass(Reactor, [{
	        key: 'subscribe',
	        value: function subscribe(reaction) {
	            var _this = this;
	
	            this.reactors = this.reactors.add(reaction);
	            return function () {
	                return _this.unsubscribe(reaction);
	            };
	        }
	    }, {
	        key: 'unsubscribe',
	        value: function unsubscribe(reaction) {
	            this.reactors = this.reactors.delete(reaction);
	        }
	    }, {
	        key: 'process',
	        value: function process() {
	            throw new Error('abstract');
	        }
	    }, {
	        key: 'digest',
	        value: function digest(data) {
	            var newValue = this.process(data);
	            if (newValue !== this.structure) {
	                this.flush(this.structure = newValue);
	            }
	        }
	    }, {
	        key: 'flush',
	        value: function flush(data) {
	            this.reactors.map(function (reactor) {
	                return reactor(data);
	            });
	        }
	    }, {
	        key: 'isReactor',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return Reactor;
	})();
	
	module.exports = Reactor;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var I = __webpack_require__(2);
	var Reactor = __webpack_require__(3);
	
	var _require = __webpack_require__(5);
	
	var immutableReadWrapper = _require.immutableReadWrapper;
	
	var View = (function (_Reactor) {
	    _inherits(View, _Reactor);
	
	    function View(masterView, process) {
	        _classCallCheck(this, View);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(View).call(this));
	
	        if (process) {
	            _this.process = process;
	        }
	
	        immutableReadWrapper(_this);
	
	        masterView.subscribe(_this.digest.bind(_this));
	
	        _this.digest(masterView.getIn([]));
	        return _this;
	    }
	
	    _createClass(View, [{
	        key: 'process',
	        value: function process(data) {
	            return data;
	        }
	    }, {
	        key: 'isView',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return View;
	})(Reactor);
	
	module.exports = View;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * adds read methods to `that`
	 * that enable reading from its structure
	 *
	 * @param  {Reactor} decorator subject
	 * @return {void}
	 */
	function immutableReadWrapper(that) {
	    ['get', 'has', 'getIn', 'hasIn', 'includes', 'first', 'last'].forEach(function (prop) {
	        that[prop] = that[prop] || function () {
	            return that.structure[prop].apply(that.structure, arguments);
	        };
	    });
	}
	
	/**
	 * adds write methods of Iterable interface to Reactor
	 * so they can trigger Reactor digesting of new value
	 *
	 * @param  {Reactor} decorator subject
	 * @return {void}
	 */
	function immutableWriteWrapper(that) {
	    ['set', 'delete', 'update', 'merge', 'mergeDeep', 'setIn', 'deleteIn', 'updateIn', 'mergeIn', 'mergeDeepIn'].forEach(function (prop) {
	        that[prop] = that[prop] || (function () {
	            return that.digest(that.structure[prop].apply(that.structure, arguments));
	        }).bind(that);
	    });
	}
	
	module.exports = {
	    immutableWriteWrapper: immutableWriteWrapper,
	    immutableReadWrapper: immutableReadWrapper
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=immview.js.map