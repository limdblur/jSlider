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

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Slider = function () {
	    function Slider(binder) {
	        _classCallCheck(this, Slider);

	        this.element = binder; //容器对象

	        this.autoSlide = false; //自动轮播
	        this.onSlideOver = null; //一页进行到底时触发事件
	        this.orientation = 'vertical'; // horizontal || verical
	        if (this.orientation != 'vertical' && this.orientation !== 'horizontal') {
	            throw new Error('must specify orientation of the slider');
	        }

	        this.loop = false; //是否允许循环滚动
	        this.isAnimating = false;

	        this.position = 0;
	        this.currentPage = 1; //序号从1开始
	        this.totalPage = this.element.querySelectorAll('.page').length;
	        this.parent = this.element.parentNode;
	        if (this.orientation === 'vertical') {
	            this.pageSize = this.parent.offsetHeight;
	        } else {
	            this.pageSize = this.parent.offsetWidth;
	        }

	        this.thresholdStayTime = 300; //手指最大停留时间，超过此时间，则认定脱离跟随状态
	        this.thresholdVelocity = 10; //最大速度，超过此速度，始终惯性翻屏


	        this._responder();
	    }

	    //初始化响应参数


	    _createClass(Slider, [{
	        key: '_responderInit',
	        value: function _responderInit() {
	            this.response = {
	                inResponse: false, //是否正在响应状态
	                position: null, //响应时的位置
	                responseTime: null, //上次响应时的事件，包括start、move
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
	                    _this.response.responseTime = Date.now();
	                    _this.response.velocity = offsetPosition;
	                    _this._follow(offsetPosition);
	                }
	            };
	            var end = function end(e) {
	                if (_this.response.inResponse) {
	                    var tmpEndPosition = getTouchPosition(e);
	                    //停留事件代表手指停留在屏幕静止不动的时间
	                    var stayTime = Date.now() - _this.response.responseTime;
	                    _this._responderInit();

	                    //核心运动逻辑在这里
	                    if (stayTime < _this.thresholdStayTime) {
	                        //小于停留时间阈值(thresholdStayTime)，则按照既定逻辑
	                        if (_this.response.velocity >= _this.thresholdVelocity) {
	                            //如果速度>=thresholdVelocity，直接触发翻屏操作
	                            _this._slideOver(_this.response.velocity);
	                        } else {
	                            //如果速度<=thresholdVelocity，有可能产生回弹
	                            _this._rebound();
	                        }
	                    } else {
	                        //大于停留时间阈值(thresholdStayTime)
	                        //则认为停留过长（即按着屏幕不动），直接按照惯性回弹处理
	                        _this._rebound();
	                    }
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

	        //动画逻辑

	    }, {
	        key: '_animate',
	        value: function _animate(frame) {
	            var _this2 = this;

	            if (!frame || typeof frame != 'function') {
	                return;
	            }

	            if (this.isAnimating === false) {
	                return;
	            }

	            var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (frame) {
	                return window.setTimeout(frame, 1000 / 60);
	            };

	            requestFrame(function () {
	                frame();
	                _this2._animate(frame);
	            });
	        }

	        //开始执行动画

	    }, {
	        key: '_startAnimation',
	        value: function _startAnimation(frame) {
	            this.isAnimating = true;
	            this._animate(frame);
	        }

	        //中断执行动画

	    }, {
	        key: '_stopAnimation',
	        value: function _stopAnimation() {
	            this.isAnimating = false;
	        }

	        //执行最终的位移渲染

	    }, {
	        key: '_render',
	        value: function _render(newPosition) {
	            if (newPosition == this.position) {
	                return;
	            }

	            //在这里更新位置
	            this.position = newPosition;

	            var style = 'translate3d(' + this.position + 'px, 0, 0)';
	            if (this.orientation == 'vertical') {
	                style = 'translate3d(0, ' + this.position + 'px, 0)';
	            }

	            var styleName = 'webkitTransform';
	            if ('transform' in this.element.style) {
	                styleName = 'transform';
	            }

	            this.element.style[styleName] = style;
	        }

	        //跟随(也就是手指或鼠标拖动)

	    }, {
	        key: '_follow',
	        value: function _follow(offsetPosition) {
	            //跟随不切换页，先求边界页
	            var boundary = null;
	            if (this.currentPage == 1) {
	                boundary = [1, this.totalPage >= 2 ? 2 : 1];
	            } else if (this.currentPage == this.totalPage) {
	                // boundary = [this.totalPage >= 2 ? this.totalPage - 1 : this.totalPage ,this.totalPage];
	                boundary = [this.totalPage - 1, this.totalPage];
	            } else {
	                boundary = [this.currentPage - 1, this.currentPage + 1];
	            }

	            //然后计算边界临界值
	            var rangePosition = {
	                start: (boundary[0] - 1) * this.pageSize,
	                end: -(boundary[1] - 1) * this.pageSize
	            };

	            var newPosition = this.position + offsetPosition;
	            if (newPosition >= rangePosition.start) {
	                newPosition = rangePosition.start;
	            }
	            if (newPosition <= rangePosition.end) {
	                newPosition = rangePosition.end;
	            }

	            this._render(newPosition);
	        }

	        //根据位移公式计算加速度
	        //v : 初始速度
	        //s : 总位移
	        //t : 消耗的总时间，这里是帧数，约定30帧(大约半秒)执行完

	    }, {
	        key: '_getAcceleration',
	        value: function _getAcceleration(v, s) {
	            var t = arguments.length <= 2 || arguments[2] === undefined ? 30 : arguments[2];

	            //公式: v*t + a*t*t/2 = s
	            return (s - v * t) * 2 / (t * t);
	        }

	        //特定速度下回弹

	    }, {
	        key: '_rebound',
	        value: function _rebound() {
	            var _this3 = this;

	            var withVelocity = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	            var willReboundPage = this._willReboundPage();
	            var offset = this.position / this.pageSize;

	            //计算位移
	            var displayment = (Math.round(offset) - offset) * this.pageSize;
	            //位移为0，说明无需回弹
	            if (displayment == 0) {
	                return 0;
	            }
	            //计算回弹加速度，加速度方向决定了回弹方向
	            var velocity = 0,
	                durationFrames = 15;
	            var acceleration = this._getAcceleration(velocity, displayment, durationFrames);

	            //回弹范围
	            var range = [Math.floor(offset) * this.pageSize, Math.ceil(offset) * this.pageSize];

	            //执行回弹动画
	            this._startAnimation(function () {
	                velocity += acceleration;
	                var newPosition = _this3.position + velocity;
	                if (newPosition <= range[0] || newPosition >= range[1]) {
	                    if (newPosition <= range[0]) {
	                        newPosition = range[0];
	                    }
	                    if (newPosition >= range[1]) {
	                        newPosition = range[1];
	                    }
	                    _this3._stopAnimation();
	                    _this3.currentPage = parseInt(Math.abs(newPosition / _this3.pageSize)) + 1;
	                    _this3._setOnSlideOver(_this3.currentPage);
	                }
	                _this3._render(newPosition);
	            });
	        }

	        //带初始速度滑到底

	    }, {
	        key: '_slideOver',
	        value: function _slideOver(velocity) {}

	        //计算将要回弹进入的页面

	    }, {
	        key: '_willReboundPage',
	        value: function _willReboundPage() {
	            return Math.round(Math.abs(this.position) / this.pageHeight);
	        }
	        //一屏滚动完成触发

	    }, {
	        key: '_setOnSlideOver',
	        value: function _setOnSlideOver(pageIndex) {
	            this.onSlideOver && typeof this.onSlideOver == 'function' && this.onSlideOver(pageIndex);
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

	new Slider(document.getElementById('container'));

/***/ }
/******/ ]);