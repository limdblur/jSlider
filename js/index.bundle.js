/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _JSlider = __webpack_require__(1);

	var _JSlider2 = _interopRequireDefault(_JSlider);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//================================
	//=========Test Case Here=========
	//================================
	new _JSlider2.default({
	    element: document.getElementById('container'),
	    orientation: 'vertical',
	    inertiaFrame: 60,
	    inertiaFrameRatio: 1.01,
	    reboundCritical: 2,
	    autoCarousel: true,
	    // carouselReverse: true,
	    autoCarouselInterval: 3000,
	    loop: true
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var JSlider = function () {
	    function JSlider(option) {
	        _classCallCheck(this, JSlider);

	        //容器对象，代表轮播对象的父对象
	        this.element = null;
	        if (option.element && option.element instanceof Element) {
	            this.element = option.element;
	        }
	        if (!this.element) {
	            throw new Error('Must specify the slide container');
	        }

	        /**
	         * 0、默认状态
	         * 1、响应状态，即是手指或鼠标拖放状态
	         * 2、惯性状态，手指拖动结束之后惯性回弹
	         * 3、自动轮播状态，只有设置了自动轮播才会开启
	         */
	        this._state = 0;

	        //当前动画状态
	        this._animation = false;

	        //state=1 响应速度
	        this._responseVelocity = 0;

	        //轮播方向
	        this.orientation = 'vertical';
	        if (option.orientation && ['vertical', 'horizontal'].indexOf(option.orientation) != -1) {
	            this.orientation = option.orientation;
	        }

	        //一维坐标，当前所处的位置
	        this._position = 0;

	        //回弹速度临界值，超过这个速度，可能回弹
	        this.reboundCritical = 3;
	        if (option.reboundCritical && typeof option.reboundCritical == 'number') {
	            this.reboundCritical = option.reboundCritical;
	        }

	        //代表惯性运动需要耗费的时间，默认60帧
	        this.inertiaFrame = 30;
	        if (option.inertiaFrame && typeof option.inertiaFrame == 'number') {
	            this.inertiaFrame = option.inertiaFrame;
	        }
	        //这个值会影响运动的变化值，加速、匀速等
	        this.inertiaFrameRatio = 1;
	        if (option.inertiaFrameRatio && typeof option.inertiaFrameRatio == 'number') {
	            this.inertiaFrameRatio = option.inertiaFrameRatio;
	        }

	        //是否支持列表循环
	        this.loop = !!option.loop;
	        //是否自动轮播
	        this.autoCarousel = !!option.autoCarousel;
	        //自动轮播会激活loop属性为true
	        if (this.autoCarousel) {
	            this.loop = true;
	        }
	        //是否逆向轮播，默认正向
	        this.carouselReverse = !!option.carouselReverse;
	        //自动轮播时每播完一屏停留的时间
	        this.autoCarouselInterval = 3000; //ms
	        if (option.autoCarouselInterval && typeof option.autoCarouselInterval == 'number') {
	            this.autoCarouselInterval = option.autoCarouselInterval;
	        }
	        //轮播启动的计时器，清除将消灭轮播
	        this._carouselTimer = 0;

	        //初始化
	        this._init();
	    }

	    _createClass(JSlider, [{
	        key: '_init',
	        value: function _init() {
	            this._children = this.element.querySelectorAll('.page');
	            //如果子元素个数少于2，不需要执行滚动逻辑
	            if (this._children.length < 2) {
	                return;
	            }

	            //如果是一个循环列表，那么要重新生成DOM树
	            if (this.loop) {
	                var tmpFirstNode = this._children.item(0).cloneNode(true),
	                    tmpLastNode = this._children.item(this._children.length - 1).cloneNode(true);
	                this.element.insertBefore(tmpLastNode, this._children.item(0));
	                this.element.appendChild(tmpFirstNode);
	            }

	            // 初始化范围数组，如果有循环列表，则考虑重新生成位置
	            this._createRanges();
	            this.loop && this._render(this._range[1]);

	            //设置默认状态自动轮播逻辑
	            this._setState(3);
	            //响应系统
	            this._responder();
	        }

	        //刷新range

	    }, {
	        key: '_createRanges',
	        value: function _createRanges() {
	            var sum = 0;
	            this._range = [];
	            this._children = this.element.querySelectorAll('.page');
	            this._range.push(sum);
	            for (var i = 0; i < this._children.length; i++) {
	                var rect = this._children.item(i).getBoundingClientRect();
	                var size = rect.width;
	                if (this.orientation == 'vertical') {
	                    size = rect.height;
	                }
	                sum += size;
	                this._range.push(sum);
	            }
	        }
	    }, {
	        key: '_getRange',
	        value: function _getRange(position) {
	            for (var i = 0; i < this._range.length; i++) {
	                //刚好命中临界点，作用范围为一个点
	                if (position == this._range[i]) {
	                    return [this._range[i], this._range[i]];
	                }
	                //能走到这一步，说明i>0成立
	                if (position < this._range[i]) {
	                    return [this._range[i - 1], this._range[i]];
	                }
	            }
	        }

	        //管理状态切换

	    }, {
	        key: '_setState',
	        value: function _setState(state) {
	            this._state = state;
	            //任意状态切换都要停止动画
	            this._stopAnimation();
	            if (state == 1) {
	                this._stopAutoCarousel();
	            } else if (state == 2) {
	                this._startInertia();
	                this._stopAutoCarousel();
	            } else if (state == 3) {
	                this._startAutoCarousel();
	            }
	        }
	    }, {
	        key: '_requestFrame',
	        value: function _requestFrame() {
	            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (frame) {
	                return window.setTimeout(frame, 1000 / 60);
	            };
	        }
	    }, {
	        key: '_startAnimation',
	        value: function _startAnimation(frame) {
	            this._animation = true;
	            this._animate(frame);
	        }
	    }, {
	        key: '_stopAnimation',
	        value: function _stopAnimation() {
	            this._animation = false;
	        }
	    }, {
	        key: '_animate',
	        value: function _animate(frame) {
	            var _this = this;

	            //是否停止动画
	            if (!this._animation) {
	                return;
	            }

	            this._requestFrame()(function () {
	                frame();
	                _this._animate(frame);
	            });
	        }

	        //响应跟随系统

	    }, {
	        key: '_responder',
	        value: function _responder() {
	            var _this2 = this;

	            //检测当前页面所处的模式，鼠标还是触摸
	            var touchExist = 'ontouchstart' in window;

	            //获取当前手指（或鼠标指针）在屏幕位置
	            var getTouchPosition = function getTouchPosition(e) {
	                var eventObject = touchExist ? e.touches.item(0) : e;
	                if (_this2.orientation == 'vertical') {
	                    return eventObject.screenY;
	                }
	                return eventObject.screenX;
	            };

	            //初始位置
	            var movement = 0;

	            //以下为事件响应器
	            var start = function start(e) {
	                if (_this2._state != 1) {
	                    _this2._setState(1);
	                    movement = getTouchPosition(e);
	                }
	            };
	            var move = function move(e) {
	                if (_this2._state == 1) {
	                    e.preventDefault();
	                    var tmpMovement = getTouchPosition(e);
	                    _this2._responseVelocity = -(tmpMovement - movement);
	                    movement = tmpMovement;
	                    _this2._follow();
	                }
	            };
	            var end = function end(e) {
	                if (_this2._state == 1) {
	                    _this2._setState(2);
	                }
	            };
	            var cancel = function cancel(e) {
	                return end(e);
	            };

	            //增加监听
	            var startEvent = touchExist ? 'touchstart' : 'mousedown',
	                moveEvent = touchExist ? 'touchmove' : 'mousemove',
	                endEvent = touchExist ? 'touchend' : 'mouseup',
	                cancelEvent = touchExist ? 'touchcancel' : 'mouseup';
	            var doc = document.documentElement;
	            this.element.addEventListener(startEvent, start);
	            doc.addEventListener(moveEvent, move);
	            doc.addEventListener(endEvent, end);
	            if (touchExist) {
	                doc.addEventListener(cancelEvent, cancel);
	            }
	        }
	    }, {
	        key: '_render',
	        value: function _render(newPosition, callback) {
	            var _this3 = this;

	            //位置没变，不执行渲染
	            if (newPosition == this._position) {
	                return;
	            }

	            this._position = newPosition;
	            if (this.loop) {
	                if (this._position == this._range[0]) {
	                    this._position = this._range[this._range.length - 3];
	                }
	                if (this._position == this._range[this._range.length - 2]) {
	                    this._position = this._range[1];
	                }
	            }

	            var translate3d = function translate3d(position) {
	                var styleName = 'webkitTransform';
	                if ('transform' in _this3.element.style) {
	                    styleName = 'transform';
	                }

	                var style = 'translate3d(-' + position + 'px, 0, 0)';
	                if (_this3.orientation == 'vertical') {
	                    style = 'translate3d(0, -' + position + 'px, 0)';
	                }
	                _this3.element.style[styleName] = style;
	            };

	            //先执行移动
	            translate3d(this._position);
	            //如果有回调，则渲染完成之后执行回调
	            callback && typeof callback == 'function' && callback();
	        }

	        //跟随逻辑

	    }, {
	        key: '_follow',
	        value: function _follow() {
	            var movement = this._responseVelocity;
	            var range = [this._range[0], this._range[this._range.length - 2]];

	            var newPosition = this._position + movement;
	            if (newPosition <= range[0]) {
	                newPosition = range[0];
	            }
	            if (newPosition >= range[1]) {
	                newPosition = range[1];
	            }

	            //刷新
	            this._render(newPosition);
	        }

	        //开始惯性

	    }, {
	        key: '_startInertia',
	        value: function _startInertia() {
	            var _this4 = this;

	            var velocity = this._responseVelocity;
	            var range = this._getRange(this._position);
	            //如果刚好在临界点上，则不执行惯性，直接触发状态3
	            if (range[0] == range[1]) {
	                this._setState(3);
	                return;
	            }

	            var displayment = void 0;
	            //这里是默认状态，可能需要回弹
	            if (this._position - range[0] > range[1] - this._position) {
	                displayment = range[1] - this._position;
	            } else {
	                displayment = range[0] - this._position;
	            }
	            //这里是一冲到底，不需要回弹
	            if (Math.abs(velocity) > this.reboundCritical) {
	                if (velocity > 0) {
	                    displayment = range[1] - this._position;
	                } else {
	                    displayment = range[0] - this._position;
	                }
	            }

	            //计算位移需要运动的帧数
	            var frame = Math.abs(displayment * this.inertiaFrame / (range[1] - range[0]));
	            var acceleration = displayment / frame;

	            //开始动画
	            this._startAnimation(function () {
	                _this4._startInertiaAnimation(velocity, acceleration, range);
	            });
	        }
	    }, {
	        key: '_startInertiaAnimation',


	        //惯性动画帧的执行内容
	        value: function _startInertiaAnimation(velocity, acceleration, range) {
	            var _this5 = this;

	            acceleration *= this.inertiaFrameRatio;
	            velocity += acceleration;
	            var newPosition = this._position + velocity;

	            //渲染回调逻辑
	            var callback = null,
	                stateCallback = function stateCallback() {
	                return _this5._setState(3);
	            };

	            //下面两个临界状态触发，实际上要先渲染，渲染完成之后执行状态跳转
	            if (newPosition <= range[0]) {
	                newPosition = range[0];
	                callback = stateCallback;
	            }
	            if (newPosition >= range[1]) {
	                newPosition = range[1];
	                callback = stateCallback;
	            }

	            this._render(newPosition, callback);
	        }

	        //开始自动轮播

	    }, {
	        key: '_startAutoCarousel',
	        value: function _startAutoCarousel() {
	            var _this6 = this;

	            if (this.autoCarousel) {
	                this._carouselTimer = window.setTimeout(function () {
	                    var range = null;
	                    var index = _this6._range.indexOf(_this6._position);
	                    if (_this6.carouselReverse) {
	                        range = [_this6._range[index - 1], _this6._range[index]];
	                    } else {
	                        range = [_this6._range[index], _this6._range[index + 1]];
	                    }

	                    //计算自动轮播一屏需要的位移量
	                    var displayment = range[1] - range[0];
	                    if (_this6.carouselReverse) {
	                        displayment *= -1;
	                    }

	                    var velocity = 0;
	                    var acceleration = displayment / _this6.inertiaFrame;

	                    //开始执行惯性动画
	                    _this6._startAnimation(function () {
	                        _this6._startInertiaAnimation(velocity, acceleration, range);
	                    });
	                }, this.autoCarouselInterval);
	            }
	        }
	        //停止自动轮播

	    }, {
	        key: '_stopAutoCarousel',
	        value: function _stopAutoCarousel() {
	            window.clearTimeout(this._carouselTimer);
	        }
	    }]);

	    return JSlider;
	}();

	exports.default = JSlider;

/***/ }
/******/ ]);