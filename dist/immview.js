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

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Domain = exports.View = exports.Data = undefined;
	
	var _Domain = __webpack_require__(1);
	
	var _Domain2 = _interopRequireDefault(_Domain);
	
	var _Data = __webpack_require__(4);
	
	var _Data2 = _interopRequireDefault(_Data);
	
	var _View = __webpack_require__(7);
	
	var _View2 = _interopRequireDefault(_View);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.Data = _Data2.default;
	exports.View = _View2.default;
	exports.Domain = _Domain2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _immutable = __webpack_require__(2);
	
	var I = _interopRequireWildcard(_immutable);
	
	var _Queue = __webpack_require__(3);
	
	var _Queue2 = _interopRequireDefault(_Queue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var noop = function noop() {};
	
	var Domain = (function () {
	    /**
	     * Create a domain holding a view
	     * @param {Reactor} view
	     */
	
	    function Domain(view, actions) {
	        _classCallCheck(this, Domain);
	
	        /** @type {View} */
	        this.view = null;
	        /** @type {Data} */
	        this.data = null;
	        /** @type {String[]} */
	        this._actionNames = null;
	
	        this._claimView(view);
	        this._claimActions(actions);
	    }
	
	    _createClass(Domain, [{
	        key: '_claimView',
	        value: function _claimView(view) {
	            if (view.isReactor) {
	                this.view = view;
	
	                if (view.isData) {
	                    this.data = view;
	                }
	            } else {
	                throw new Error('view is not inheriting Reactor type');
	            }
	        }
	    }, {
	        key: '_claimActions',
	        value: function _claimActions(actions) {
	            var _this = this;
	
	            this._actionNames = actions ? Object.keys(actions) : [];
	
	            this._actionNames.forEach(function (actionName) {
	                if (_this[actionName]) {
	                    throw new Error('"' + actionName + '" is reserved for Domain interface');
	                }
	
	                _this[actionName] = _Queue2.default.createAction(actions[actionName], _this);
	            });
	        }
	    }, {
	        key: 'subscribe',
	        value: function subscribe(reaction) {
	            return this.view.subscribe(reaction);
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            var _this2 = this;
	
	            // destroy and unmount a structure
	            this.view.destroy();
	            this.view = null;
	            this.data = null;
	
	            // remove all queued actions
	            _Queue2.default.rejectContext(this);
	
	            // unmount all domain methods
	            this._actionNames.forEach(function (actionName) {
	                _this2[actionName] = noop;
	            });
	            this._actionNames = null;
	        }
	    }, {
	        key: 'structure',
	        get: function get() {
	            return this.view && this.view.structure;
	        }
	    }, {
	        key: 'isDomain',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return Domain;
	})();
	
	exports.default = Domain;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _immutable = __webpack_require__(2);
	
	var I = _interopRequireWildcard(_immutable);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var isRunning = false;
	var queue = I.OrderedSet();
	
	/**
	 * Returns a function that is queueable version of provided one.
	 * @param {Function} action
	 * @param {*} [context]
	 * @returns {Function}
	 */
	function createAction(action, context) {
	    return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        appendToQueue(action, context, args);
	        run();
	    };
	}
	
	/**
	 * Append new action onto end of the queue
	 * @param {Function} action
	 * @param {*} context
	 * @param {Array.<*>} args
	 */
	function appendToQueue(action, context, args) {
	    queue = queue.add({
	        action: action,
	        context: context,
	        args: args
	    });
	}
	
	/**
	 * Removes and returns first action from the queue and
	 * @returns {{action:Function,context,args:Array.<*>}}
	 */
	function shiftFromQueue() {
	    var toRun = queue.first();
	    queue = queue.rest();
	    return toRun;
	}
	
	/**
	 * Removes all queued actions tied with a context
	 * @param context
	 */
	function rejectContext(context) {
	    queue = queue.filter(function (item) {
	        return item.context !== context;
	    });
	}
	
	/**
	 * Starts executing the queue
	 */
	function run() {
	    if (isRunning) {
	        return;
	    }
	
	    isRunning = true;
	
	    while (queue.count() > 0) {
	        try {
	            runFirst();
	        } catch (e) {
	            console.error('Immview.Queue run - Error occured while running running a function');
	            console.error(e.message);
	        }
	    }
	
	    isRunning = false;
	}
	
	/**
	 * Execute first action of current queue
	 */
	function runFirst() {
	    var toRun = shiftFromQueue();
	    var context = toRun.context;
	    var action = toRun.action;
	    var args = toRun.args;
	
	    action.apply(context, args);
	}
	
	exports.default = {
	    createAction: createAction,
	    rejectContext: rejectContext
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _immutable = __webpack_require__(2);
	
	var I = _interopRequireWildcard(_immutable);
	
	var _Reactor2 = __webpack_require__(5);
	
	var _Reactor3 = _interopRequireDefault(_Reactor2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _require = __webpack_require__(6);
	
	var immutableWriteWrapper = _require.immutableWriteWrapper;
	var immutableReadWrapper = _require.immutableReadWrapper;
	
	var Data = (function (_Reactor) {
	    _inherits(Data, _Reactor);
	
	    function Data(initialData) {
	        _classCallCheck(this, Data);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Data).call(this));
	
	        immutableReadWrapper(_this);
	        immutableWriteWrapper(_this);
	
	        _this.digest(I.fromJS(initialData));
	        return _this;
	    }
	
	    _createClass(Data, [{
	        key: 'process',
	        value: function process(data) {
	            return data;
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.structure = null;
	            this.reactors = null;
	        }
	    }, {
	        key: 'isData',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return Data;
	})(_Reactor3.default);
	
	exports.default = Data;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _immutable = __webpack_require__(2);
	
	var I = _interopRequireWildcard(_immutable);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	            reaction(this.structure);
	            return function () {
	                _this.reactors = _this.reactors.delete(reaction);
	            };
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
	                this.structure = newValue;
	                this.flush();
	            }
	        }
	    }, {
	        key: 'flush',
	        value: function flush() {
	            var _this2 = this;
	
	            this.reactors.forEach(function (reactor) {
	                return reactor(_this2.structure);
	            });
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            throw new Error('abstract');
	        }
	    }, {
	        key: 'isReactor',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return Reactor;
	})();
	
	exports.default = Reactor;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.immutableReadWrapper = exports.immutableWriteWrapper = undefined;
	
	var _Queue = __webpack_require__(3);
	
	var _Queue2 = _interopRequireDefault(_Queue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * adds read methods to `that`
	 * that enable reading from its structure
	 *
	 * @param  {Reactor} decorator subject
	 * @return {void}
	 */
	function immutableReadWrapper(that) {
	    ['equals', 'hashCode', 'get', 'has', 'includes', 'first', 'last', 'getIn', 'hasIn', 'toJS', 'toObject', 'toArray', 'toMap', 'toOrderedMap', 'toSet', 'toOrderedSet', 'toList', 'toStack', 'toSeq', 'toKeyedSeq', 'toIndexedSeq', 'toSetSeq', 'keys', 'values', 'entries', 'keySeq', 'valueSeq', 'entrySeq', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'sortBy', 'groupBy', 'forEach', 'slice', 'rest', 'butLast', 'skip', 'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile', 'takeUntil', 'concat', 'flatten', 'flatMap', 'reduce', 'reduceRight', 'every', 'some', 'join', 'isEmpty', 'count', 'countBy', 'find', 'findLast', 'findEntry', 'findLastEntry', 'max', 'maxBy', 'min', 'minBy', 'isSubset', 'isSuperset'].forEach(function (prop) {
	        that[prop] = function () {
	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                args[_key] = arguments[_key];
	            }
	
	            return that.structure[prop].apply(that.structure, args);
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
	        that[prop] = _Queue2.default.createAction(function () {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                args[_key2] = arguments[_key2];
	            }
	
	            that.digest(that.structure[prop].apply(that.structure, args));
	        });
	    });
	}
	
	exports.immutableWriteWrapper = immutableWriteWrapper;
	exports.immutableReadWrapper = immutableReadWrapper;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _immutable = __webpack_require__(2);
	
	var I = _interopRequireWildcard(_immutable);
	
	var _Reactor2 = __webpack_require__(5);
	
	var _Reactor3 = _interopRequireDefault(_Reactor2);
	
	var _ImmutableWrapper = __webpack_require__(6);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var View = (function (_Reactor) {
	    _inherits(View, _Reactor);
	
	    function View(source, process) {
	        _classCallCheck(this, View);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(View).call(this));
	
	        if (process) {
	            _this.process = process;
	        }
	
	        (0, _ImmutableWrapper.immutableReadWrapper)(_this);
	
	        if (source && (typeof source === 'undefined' ? 'undefined' : _typeof(source)) === 'object') {
	            if (source.isReactor || source.isDomain) {
	                _this.connectToView(source);
	            } else {
	                _this.connectToViews(source);
	            }
	        }
	        return _this;
	    }
	
	    /**
	     * @private
	     * @param {Reactor} masterView
	     */
	
	    _createClass(View, [{
	        key: 'connectToView',
	        value: function connectToView(masterView) {
	            this.unsubs = [masterView.subscribe(this.digest.bind(this))];
	        }
	
	        /**
	         * @private
	         * @param {Object.<Reactor>} views
	         */
	
	    }, {
	        key: 'connectToViews',
	        value: function connectToViews(views) {
	            var _this2 = this;
	
	            this.prestructure = I.Map();
	            this.unsubs = Object.keys(views).map(function (viewName) {
	                var sub = function sub(data) {
	                    _this2.digest(_this2.prestructure = _this2.prestructure.set(viewName, data));
	                };
	
	                return views[viewName].subscribe(sub);
	            });
	        }
	    }, {
	        key: 'process',
	
	        /**
	         * @private
	         * @param {*} data
	         * @returns {*}
	         */
	        value: function process(data) {
	            return data;
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.unsubs.forEach(function (func) {
	                return func();
	            });
	            this.unsubs = null;
	            this.structure = null;
	            this.prestructure = null;
	            this.reactors = null;
	        }
	    }, {
	        key: 'isView',
	        get: function get() {
	            return true;
	        }
	    }]);
	
	    return View;
	})(_Reactor3.default);
	
	exports.default = View;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=immview.js.map