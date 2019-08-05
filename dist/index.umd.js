(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.CallApp = factory());
}(this, function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.9' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && _has(exports, key)) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? _ctx(out, _global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var _library = true;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: _library ? 'pure' : 'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var f$1 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$1
	};

	var f$2 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$2
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 19.1.2.1 Object.assign(target, source, ...)






	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	var _objectAssign = !$assign || _fails(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = _toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = _objectGops.f;
	  var isEnum = _objectPie.f;
	  while (aLen > index) {
	    var S = _iobject(arguments[index++]);
	    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;

	// 19.1.3.1 Object.assign(target, source)


	_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

	var assign = _core.Object.assign;

	var assign$1 = createCommonjsModule(function (module) {
	module.exports = { "default": assign, __esModule: true };
	});

	var _Object$assign = unwrapExports(assign$1);

	var classCallCheck = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	});

	var _classCallCheck = unwrapExports(classCallCheck);

	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

	var $Object = _core.Object;
	var defineProperty = function defineProperty(it, key, desc) {
	  return $Object.defineProperty(it, key, desc);
	};

	var defineProperty$1 = createCommonjsModule(function (module) {
	module.exports = { "default": defineProperty, __esModule: true };
	});

	unwrapExports(defineProperty$1);

	var createClass = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _defineProperty2 = _interopRequireDefault(defineProperty$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();
	});

	var _createClass = unwrapExports(createClass);

	/**
	 * 获取 ios 大版本号
	 */
	function getIOSVersion() {
	  var version = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
	  return parseInt(version[1], 10);
	}

	/**
	 * 获取 微信 版本号
	 */
	function getWeChatVersion() {
	  var version = navigator.appVersion.match(/micromessenger\/(\d+\.\d+\.\d+)/i);
	  return version[1];
	}

	/**
	 * 获取 browser 信息
	 */
	function getBrowser() {
	  var ua = window.navigator.userAgent || '';
	  var isAndroid = /android/i.test(ua);
	  var isIos = /iphone|ipad|ipod/i.test(ua);
	  var isWechat = /micromessenger\/([\d.]+)/i.test(ua);
	  var isWeibo = /(weibo).*weibo__([\d.]+)/i.test(ua);
	  var isQQ = /qq\/([\d.]+)/i.test(ua);
	  var isQQBrowser = /(qqbrowser)\/([\d.]+)/i.test(ua);
	  var isQzone = /qzone\/.*_qz_([\d.]+)/i.test(ua);
	  // 安卓 chrome 浏览器，很多 app 都是在 chrome 的 ua 上进行扩展的
	  var isOriginalChrome = /chrome\/[\d.]+ Mobile Safari\/[\d.]+/i.test(ua) && isAndroid;
	  // chrome for ios 和 safari 的区别仅仅是将 Version/<VersionNum> 替换成了 CriOS/<ChromeRevision>
	  // ios 上很多 app 都包含 safari 标识，但它们都是以自己的 app 标识开头，而不是 Mozilla
	  var isSafari = /safari\/([\d.]+)$/i.test(ua) && isIos && ua.indexOf('Crios') < 0 && ua.indexOf('Mozilla') === 0;

	  return {
	    isAndroid: isAndroid,
	    isIos: isIos,
	    isWechat: isWechat,
	    isWeibo: isWeibo,
	    isQQ: isQQ,
	    isQQBrowser: isQQBrowser,
	    isQzone: isQzone,
	    isOriginalChrome: isOriginalChrome,
	    isSafari: isSafari
	  };
	}

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	var keys = _core.Object.keys;

	var keys$1 = createCommonjsModule(function (module) {
	module.exports = { "default": keys, __esModule: true };
	});

	var _Object$keys = unwrapExports(keys$1);

	/**
	 * 搭建基本的 url scheme
	 * @param {object} config - 参数项
	 * @param {object} options - callapp-lib 基础配置
	 * @returns {string} url scheme
	 * @memberof CallApp
	 */
	function buildScheme(config, options) {
	  var path = config.path,
	      param = config.param;
	  var customBuildScheme = options.buildScheme;


	  if (typeof customBuildScheme !== 'undefined') {
	    return customBuildScheme(config, options);
	  }

	  // callapp-lib 2.0.0 版本移除 protocol 属性，添加 scheme 属性，详细用法见 README.md
	  var _options$scheme = options.scheme,
	      host = _options$scheme.host,
	      port = _options$scheme.port,
	      protocol = _options$scheme.protocol;

	  var portPart = port ? ':' + port : '';
	  var hostPort = host ? '' + host + portPart + '/' : '';
	  var query = typeof param !== 'undefined' ? _Object$keys(param).map(function (key) {
	    return key + '=' + param[key];
	  }).join('&') : '';
	  var urlQuery = query ? '?' + query : '';

	  return protocol + '://' + hostPort + path + urlQuery;
	}

	/**
	 * 生成业务需要的 url scheme（区分是否是外链）
	 * @param {object} config - 参数项
	 * @param {object} options - callapp-lib 基础配置
	 * @returns {string} url scheme
	 * @memberof CallApp
	 */
	function generateScheme(config, options) {
	  var outChain = options.outChain;

	  var uri = buildScheme(config, options);

	  if (typeof outChain !== 'undefined' && outChain) {
	    var protocol = outChain.protocol,
	        path = outChain.path,
	        key = outChain.key;

	    uri = protocol + '://' + path + '?' + key + '=' + encodeURIComponent(uri);
	  }

	  return uri;
	}

	/**
	 * 生成 android intent
	 * @param {object} config - 唤端参数项
	 * @param {object} options - callapp-lib 基础配置
	 * @returns {string} intent
	 * @memberof CallApp
	 */
	function generateIntent(config, options) {
	  var outChain = options.outChain;
	  var intent = options.intent,
	      fallback = options.fallback;

	  var intentParam = _Object$keys(intent).map(function (key) {
	    return key + '=' + intent[key] + ';';
	  }).join('');
	  var intentTail = '#Intent;' + intentParam + 'S.browser_fallback_url=' + encodeURIComponent(fallback) + ';end;';
	  var urlPath = buildScheme(config, options);

	  if (typeof outChain !== 'undefined' && outChain) {
	    var _options$outChain = options.outChain,
	        path = _options$outChain.path,
	        key = _options$outChain.key;

	    return 'intent://' + path + '?' + key + '=' + encodeURIComponent(urlPath) + intentTail;
	  }

	  urlPath = urlPath.slice(urlPath.indexOf('//') + 2);

	  return 'intent://' + urlPath + intentTail;
	}

	/**
	 * 生成 universalLink
	 * @param {object} config - 唤端参数项
	 * @param {object} options - callapp-lib 基础配置
	 * @returns {string} universalLink
	 * @memberof CallApp
	 */
	function generateUniversalLink(config, options) {
	  var universal = options.universal;

	  if (!universal) return '';

	  var host = universal.host,
	      pathKey = universal.pathKey;
	  var path = config.path,
	      param = config.param;

	  var query = typeof param !== 'undefined' ? _Object$keys(param).map(function (key) {
	    return key + '=' + param[key];
	  }).join('&') : '';
	  var urlQuery = query ? '&' + query : '';

	  return 'https://' + host + '?' + pathKey + '=' + path + urlQuery;
	}

	/**
	 * 生成 应用宝链接
	 * @param {object} config - 唤端参数项
	 * @param {object} options - callapp-lib 基础配置
	 * @returns {string} 应用宝链接
	 * @memberof CallApp
	 */
	function generateYingYongBao(config, options) {
	  var url = generateScheme(config, options);
	  // 支持 AppLink
	  return options.yingyongbao + '&android_schema=' + encodeURIComponent(url);
	}

	var iframe = null;

	/**
	 * 获取页面隐藏属性的前缀
	 * 如果页面支持 hidden 属性，返回 '' 就行
	 * 如果不支持，各个浏览器对 hidden 属性，有自己的实现，不同浏览器不同前缀，遍历看支持哪个
	 */
	function getPagePropertyPrefix() {
	  var prefixes = ['webkit', 'moz', 'ms', 'o'];
	  var correctPrefix = void 0;

	  if ('hidden' in document) return '';

	  prefixes.forEach(function (prefix) {
	    if (prefix + 'Hidden' in document) {
	      correctPrefix = prefix;
	    }
	  });

	  return correctPrefix || false;
	}

	/**
	 * 判断页面是否隐藏（进入后台）
	 */
	function isPageHidden() {
	  var prefix = getPagePropertyPrefix();
	  if (prefix === false) return false;

	  var hiddenProperty = prefix ? prefix + 'Hidden' : 'hidden';
	  return document[hiddenProperty];
	}

	/**
	 * 获取判断页面 显示|隐藏 状态改变的属性
	 */
	function getVisibilityChangeProperty() {
	  var prefix = getPagePropertyPrefix();
	  if (prefix === false) return false;

	  return prefix + 'visibilitychange';
	}

	/**
	 * 通过 top.location.href 跳转
	 * 使用 top 是因为在 qq 中打开的页面不属于顶级页面(iframe级别)
	 * 自身 url 变更无法触动唤端操作
	 * @param {string}} [uri] - 需要打开的地址
	 */
	function evokeByLocation(uri) {
	  window.top.location.href = uri;
	}

	/**
	 * 通过 iframe 唤起
	 * @param {string}} [uri] - 需要打开的地址
	 */
	function evokeByIFrame(uri) {
	  if (!iframe) {
	    iframe = document.createElement('iframe');
	    iframe.frameborder = '0';
	    iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
	    document.body.appendChild(iframe);
	  }

	  iframe.src = uri;
	}

	/**
	 * 通过 A 标签唤起
	 * @param {string}} [uri] - 需要打开的地址
	 */
	function evokeByTagA(uri) {
	  var tagA = document.createElement('a');

	  tagA.setAttribute('href', uri);
	  tagA.style.display = 'none';
	  document.body.appendChild(tagA);

	  tagA.click();
	}

	/**
	 * 检测是否唤端成功
	 * @param {function} cb - 唤端失败回调函数
	 */
	function checkOpen(cb, timeout) {
	  var visibilityChangeProperty = getVisibilityChangeProperty();
	  var timer = setTimeout(function () {
	    var hidden = isPageHidden();
	    if (!hidden) {
	      cb();
	    }
	  }, timeout);

	  if (visibilityChangeProperty) {
	    document.addEventListener(visibilityChangeProperty, function () {
	      clearTimeout(timer);
	    });

	    return;
	  }

	  window.addEventListener('pagehide', function () {
	    clearTimeout(timer);
	  });
	}

	var CallApp = function () {
	  /**
	   *Creates an instance of CallApp.
	   * @param {object=} options - 配置项
	   * @memberof CallApp
	   */
	  function CallApp(options) {
	    _classCallCheck(this, CallApp);

	    var defaultOptions = { timeout: 2000 };
	    this.options = _Object$assign(defaultOptions, options);
	  }

	  /**
	   * 注册为方法
	   * generateScheme | generateIntent | generateUniversalLink | generateYingYongBao | checkOpen
	   */


	  _createClass(CallApp, [{
	    key: 'generateScheme',
	    value: function generateScheme$$1(config) {
	      return generateScheme(config, this.options);
	    }
	  }, {
	    key: 'generateIntent',
	    value: function generateIntent$$1(config) {
	      return generateIntent(config, this.options);
	    }
	  }, {
	    key: 'generateUniversalLink',
	    value: function generateUniversalLink$$1(config) {
	      return generateUniversalLink(config, this.options);
	    }
	  }, {
	    key: 'generateYingYongBao',
	    value: function generateYingYongBao$$1(config) {
	      return generateYingYongBao(config, this.options);
	    }
	  }, {
	    key: 'checkOpen',
	    value: function checkOpen$$1(cb) {
	      return checkOpen(cb, this.options.timeout);
	    }

	    /**
	     * 唤端失败跳转 app store
	     * @memberof CallApp
	     */

	  }, {
	    key: 'fallToAppStore',
	    value: function fallToAppStore() {
	      var _this = this;

	      this.checkOpen(function () {
	        evokeByLocation(_this.options.appstore);
	      });
	    }

	    /**
	     * 唤端失败跳转通用(下载)页
	     * @memberof CallApp
	     */

	  }, {
	    key: 'fallToFbUrl',
	    value: function fallToFbUrl() {
	      var _this2 = this;

	      this.checkOpen(function () {
	        evokeByLocation(_this2.options.fallback);
	      });
	    }

	    /**
	     * 唤端失败调用自定义回调函数
	     * @memberof CallApp
	     */

	  }, {
	    key: 'fallToCustomCb',
	    value: function fallToCustomCb(callback) {
	      this.checkOpen(function () {
	        callback();
	      });
	    }

	    /**
	     * 唤起客户端
	     * 根据不同 browser 执行不同唤端策略
	     * @param {object} config - 唤端参数项
	     * @memberof CallApp
	     */

	  }, {
	    key: 'open',
	    value: function open(config) {
	      var browser = getBrowser();

	      var _options = this.options,
	          universal = _options.universal,
	          appstore = _options.appstore,
	          logFunc = _options.logFunc,
	          intent = _options.intent;
	      var callback = config.callback;

	      var supportUniversal = typeof universal !== 'undefined';
	      var schemeURL = this.generateScheme(config);
	      var checkOpenFall = null;

	      if (typeof logFunc !== 'undefined') {
	        logFunc();
	      }

	      if (browser.isIos) {
	        // 近期ios版本qq禁止了scheme和universalLink唤起app，安卓不受影响 - 18年12月23日
	        // ios qq浏览器禁止了scheme和universalLink - 2019年5月1日
	        // ios 微信自 7.0.5 版本放开了 Universal Link 的限制
	        if (browser.isWechat && getWeChatVersion() < '7.0.5' || browser.isQQ || browser.isQQBrowser) {
	          evokeByLocation(appstore);
	        } else if (getIOSVersion() < 9) {
	          evokeByIFrame(schemeURL);
	          checkOpenFall = this.fallToAppStore;
	        } else if (!supportUniversal) {
	          evokeByLocation(schemeURL);
	          checkOpenFall = this.fallToAppStore;
	        } else {
	          evokeByLocation(this.generateUniversalLink(config));
	        }
	        // Android
	      } else if (browser.isWechat) {
	        evokeByLocation(this.generateYingYongBao(config));
	      } else if (browser.isOriginalChrome) {
	        if (typeof intent !== 'undefined') {
	          evokeByLocation(this.generateIntent(config));
	        } else {
	          // scheme 在 andriod chrome 25+ 版本上必须手势触发
	          evokeByTagA(schemeURL);
	          checkOpenFall = this.fallToFbUrl;
	        }
	      } else {
	        evokeByIFrame(schemeURL);
	        checkOpenFall = this.fallToFbUrl;
	      }

	      if (typeof callback !== 'undefined') {
	        this.fallToCustomCb(callback);
	        return;
	      }

	      if (!checkOpenFall) return;

	      checkOpenFall.call(this);
	    }
	  }]);

	  return CallApp;
	}();

	return CallApp;

}));
