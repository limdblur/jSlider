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
	        this.onPageStop = null; //一页进行到底时触发事件
	        this.orientation = 'vertical'; // horizontal || verical
	        if (this.orientation != 'vertical' && this.orientation !== 'horizontal') {
	            throw new Error('must specify orientation of the slider');
	        }

	        this.loop = false; //是否允许循环滚动

	        this.position = 0;
	        this.currentPage = 1; //序号从1开始
	        this.totalPage = this.element.querySelectorAll('.page').length;
	        this.parent = this.element.parentNode;
	        if (this.orientation === 'vertical') {
	            this.pageSize = this.parent.offsetHeight;
	        } else {
	            this.pageSize = this.parent.offsetWidth;
	        }

	        this.thresholdTime = 300; //手指最大停留时间，超过此时间，则认定脱离跟随状态
	        this.thresholdVelocity = 10; //最大速度，超过此速度，始终惯性翻屏


	        this.responder();
	    }

	    //初始化响应参数


	    _createClass(Slider, [{
	        key: 'responderInit',
	        value: function responderInit() {
	            this.response = {
	                inResponse: false, //是否正在响应状态
	                position: null, //响应时的位置
	                responseTime: null };
	        }

	        //响应跟随系统

	    }, {
	        key: 'responder',
	        value: function responder() {
	            var _this = this;

	            this.responderInit();

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
	                    _this.follow(offsetPosition);
	                }
	            };
	            var end = function end(e) {
	                if (_this.response.inResponse) {
	                    var tmpEndPosition = getTouchPosition(e);
	                    var velocity = tmpEndPosition - _this.response.position;
	                    //停留事件代表手指停留在屏幕静止不动的时间
	                    var stayTime = Date.now() - _this.response.responseTime;
	                    _this.responderInit();

	                    if (stayTime < _this.thresholdTime) {
	                        //小于300毫秒，则按照既定逻辑

	                        if (velocity >= _this.thresholdVelocity) {
	                            //如果速度>=10，直接触发翻屏操作
	                        } else {
	                                //如果速度<=10，则严格按照物理学规律
	                            }
	                    } else {
	                            //大于300毫秒，认定为停留过长，直接按照惯性回弹处理
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

	        //执行最终的位移渲染

	    }, {
	        key: 'render',
	        value: function render(newPosition) {
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

	        //跟随

	    }, {
	        key: 'follow',
	        value: function follow(offsetPosition) {
	            //跟随不切换页，先求边界页
	            var boundary = null;
	            if (this.currentPage == 1) {
	                boundary = [1, this.totalPage >= 2 ? 2 : 1];
	            } else if (this.currentPage == totalPage) {
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

	            this.render(newPosition);
	        }

	        //回弹

	    }, {
	        key: 'rebound',
	        value: function rebound() {}
	        //计算将要回弹进入的页面

	    }, {
	        key: '_willReboundPage',
	        value: function _willReboundPage() {
	            return Math.round(Math.abs(this.position) / this.pageHeight);
	        }
	        //一屏滚动完成触发

	    }, {
	        key: 'setOnPageStop',
	        value: function setOnPageStop(page) {
	            this.onPageStop && typeof this.onPageStop == 'function' && this.onPageStop(page);
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