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
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Slider = function () {
	    function Slider(option) {
	        _classCallCheck(this, Slider);

	        if ((typeof option === 'undefined' ? 'undefined' : _typeof(option)) != 'object' || !option.binder || !(option.binder instanceof Element)) {
	            throw new Error('Parameter error.');
	        }
	        this.element = option.binder; //容器对象

	        this.autoSlide = option.autoSlide || false; //自动轮播 todo
	        this.loop = option.loop || false; //是否允许循环滚动

	        //一页进行到底时触发事件
	        //此参数主要是方便处理一些页面载入载出相关的逻辑
	        this.onSlideOver = null;
	        if (option.onSlideOver && typeof option.onSlideOver == 'function') {
	            this.onSlideOver = option.onSlideOver;
	        }

	        //方向， 支持垂直和水平
	        this.orientation = option.orientation || 'vertical'; // horizontal || verical
	        if (this.orientation != 'vertical' && this.orientation !== 'horizontal') {
	            throw new Error('Must specify corret orientation of the slider');
	        }

	        this._position = 0; //当前位置
	        this._currentPage = 1; //序号从1开始
	        this._children = this.element.querySelectorAll('.page');
	        this._totalPage = this._children.length;
	        if (this.orientation === 'vertical') {
	            this._pageSize = this._children.item(0).offsetHeight;
	        } else {
	            this._pageSize = this._children.item(0).offsetWidth;
	        }

	        //是否正在动画
	        this._isAnimating = false;
	        //最大回弹速度，低于次速度，则认为跟随停止（即按住不动）
	        this._thresholdVelocity = 3;
	        //此处的数值代表帧数，也就是说预计在多少帧完成动画
	        this.animationDuration = 40;
	        if (option.animationDuration && typeof option.animationDuration == 'number') {
	            this.animationDuration = option.animationDuration;
	        }
	        //此处的数值代表速度缓动系数，最好在0.99-1.10之间变化
	        this.animateVelocityRatio = 1.05;
	        if (option.animateVelocityRatio && typeof option.animateVelocityRatio == 'number') {
	            this.animateVelocityRatio = option.animateVelocityRatio;
	        }

	        //控件初始化
	        this._sliderInit();
	        //响应系统逻辑
	        this._responder();
	    }

	    //根据传入的参数做一次初始化


	    _createClass(Slider, [{
	        key: '_sliderInit',
	        value: function _sliderInit() {
	            if (true == this.loop) {
	                var tmpFirstNode = this._children.item(0).cloneNode(true),
	                    tmpLastNode = this._children.item(this._children.length - 1).cloneNode(true);
	                this._totalPage += 2;
	                this.element.insertBefore(tmpLastNode, this._children.item(0));
	                this.element.appendChild(tmpFirstNode);
	                this._render(-this._pageSize);
	            }
	        }

	        //初始化响应参数

	    }, {
	        key: '_responderInit',
	        value: function _responderInit() {
	            this.response = {
	                inResponse: false, //是否正在响应状态
	                position: null, //响应时的位置
	                velocity: 0 //移动速度
	            };
	        }

	        //响应跟随系统

	    }, {
	        key: '_responder',
	        value: function _responder() {
	            var _this = this;

	            this._responderInit();

	            //检测当前页面所处的模式，鼠标还是触摸
	            var touchExist = 'ontouchstart' in window;

	            //获取当前手指（或鼠标指针）在屏幕位置
	            var getTouchPosition = function getTouchPosition(e) {
	                var eventObject = touchExist ? e.touches.item(0) : e;
	                if (_this.orientation == 'vertical') {
	                    return eventObject.screenY;
	                }
	                return eventObject.screenX;
	            };
	            //以下为事件响应器
	            var start = function start(e) {
	                if (!_this.response.inResponse) {
	                    //一旦开始响应，将要移除上一次的动画执行时
	                    _this._stopAnimation();

	                    _this.response.inResponse = true;
	                    _this.response.position = getTouchPosition(e);
	                    _this.response.responseTime = Date.now();
	                }
	            };
	            var move = function move(e) {
	                e.preventDefault();
	                if (_this.response.inResponse) {
	                    var tmpMovePosition = getTouchPosition(e);
	                    var offsetPosition = tmpMovePosition - _this.response.position;
	                    _this.response.position = tmpMovePosition;
	                    _this.response.velocity = offsetPosition;

	                    _this._follow(offsetPosition);
	                }
	            };
	            var end = function end(e) {
	                if (_this.response.inResponse) {
	                    var lastVelocity = _this.response.velocity;
	                    _this._responderInit();
	                    _this._rebound(lastVelocity);
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
	            doc.addEventListener(cancelEvent, cancel);
	        }
	    }, {
	        key: '_requestFrame',
	        value: function _requestFrame() {
	            var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (frame) {
	                return window.setTimeout(frame, 1000 / 60);
	            };
	            return requestFrame;
	        }

	        //动画逻辑

	    }, {
	        key: '_animate',
	        value: function _animate(frame) {
	            var _this2 = this;

	            if (!frame || typeof frame != 'function') {
	                return;
	            }

	            if (this._isAnimating === false) {
	                return;
	            }

	            this._requestFrame()(function () {
	                frame();
	                _this2._animate(frame);
	            });
	        }

	        //开始执行动画

	    }, {
	        key: '_startAnimation',
	        value: function _startAnimation(frame) {
	            this._isAnimating = true;
	            this._animate(frame);
	        }

	        //中断执行动画

	    }, {
	        key: '_stopAnimation',
	        value: function _stopAnimation() {
	            this._isAnimating = false;
	        }

	        //执行最终的位移渲染

	    }, {
	        key: '_render',
	        value: function _render(newPosition) {
	            var _this3 = this;

	            if (newPosition == this._position) {
	                return;
	            }

	            //在这里更新位置和当前页码
	            this._position = newPosition;
	            this._currentPage = parseInt(Math.abs(newPosition / this._pageSize)) + 1;

	            var translate3d = function translate3d(position) {
	                var styleName = 'webkitTransform';
	                if ('transform' in _this3.element.style) {
	                    styleName = 'transform';
	                }

	                var style = 'translate3d(' + position + 'px, 0, 0)';
	                if (_this3.orientation == 'vertical') {
	                    style = 'translate3d(0, ' + position + 'px, 0)';
	                }
	                _this3.element.style[styleName] = style;
	            };
	            //先执行移动
	            translate3d(this._position);

	            //判断是否触发了循环滚动
	            if (this.loop == true) {
	                if (this._position <= (1 - this._totalPage) * this._pageSize) {
	                    newPosition = -this._pageSize;
	                }
	                if (this._position >= 0) {
	                    newPosition = (2 - this._totalPage) * this._pageSize;
	                }
	                if (newPosition != this._position) {
	                    console.log(newPosition);
	                    this._requestFrame()(function () {
	                        return _this3._render(newPosition);
	                    });
	                }
	            }
	        }

	        //跟随(也就是手指或鼠标拖动)

	    }, {
	        key: '_follow',
	        value: function _follow(offsetPosition) {
	            //临界值处理
	            var range = [(1 - this._totalPage) * this._pageSize, 0];
	            var newPosition = this._position + offsetPosition;
	            if (newPosition <= range[0]) {
	                newPosition = range[0];
	            } else if (newPosition >= range[1]) {
	                newPosition = range[1];
	            }
	            this._render(newPosition);
	        }

	        //根据位移公式计算加速度
	        //v : 初始速度
	        //s : 总位移
	        //t : 消耗的总时间，这里是帧数，约定30帧(大约半秒)执行完
	        // _getAcceleration(v, s, t = 30){
	        //     //公式: v*t + a*t*t/2 = s
	        //     return ( s - v * t ) * 2 / ( t * t );
	        // }

	        //特定速度下回弹

	    }, {
	        key: '_rebound',
	        value: function _rebound() {
	            var _this4 = this;

	            var velocity = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];


	            var pageRatio = this._position / this._pageSize;
	            var range = [Math.floor(pageRatio) * this._pageSize, Math.ceil(pageRatio) * this._pageSize];
	            var displayment = 0;
	            if (Math.abs(velocity) >= this._thresholdVelocity) {
	                if (velocity > 0) {
	                    displayment = range[1] - this._position;
	                } else {
	                    displayment = range[0] - this._position;
	                }
	            } else {
	                //这部分逻辑可选，移除将消灭回弹效果，但会移除一些触发不灵敏的bug
	                displayment = Math.round(pageRatio) * this._pageSize - this._position;
	            }

	            var step = displayment / this.animationDuration;

	            //开始执行动画
	            this._startAnimation(function () {
	                step *= _this4.animateVelocityRatio;
	                var newPosition = _this4._position + step;

	                if (newPosition <= range[0] || newPosition >= range[1]) {
	                    if (newPosition <= range[0]) {
	                        newPosition = range[0];
	                    }
	                    if (newPosition >= range[1]) {
	                        newPosition = range[1];
	                    }

	                    _this4._setOnSlideOver({
	                        previousPage: _this4._currentPage,
	                        newPage: Math.abs(newPosition / _this4._pageSize) + 1
	                    });

	                    //缓动到了临界值，应该要结束动画了
	                    _this4._stopAnimation();
	                }
	                _this4._render(newPosition);
	            });
	        }

	        //一屏滚动完成触发

	    }, {
	        key: '_setOnSlideOver',
	        value: function _setOnSlideOver(pageInfo) {
	            this.onSlideOver && typeof this.onSlideOver == 'function' && this.onSlideOver(pageInfo);
	        }
	        //停止自动滚动

	    }, {
	        key: 'stopAutoSlide',
	        value: function stopAutoSlide() {}
	        //开始自动滚动

	    }, {
	        key: 'startAutoSlide',
	        value: function startAutoSlide() {}
	    }]);

	    return Slider;
	}();

	new Slider({
	    binder: document.getElementById('container'),
	    orientation: 'vertical',
	    autoSlide: false,
	    loop: true,
	    // onSlideOver: ()=>{console.log(`test`)},
	    animationDuration: 30,
	    animateVelocityRatio: 1.05
	});

/***/ }
/******/ ]);