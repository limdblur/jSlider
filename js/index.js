'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Slider = function () {
    function Slider(binder) {
        _classCallCheck(this, Slider);

        this.element = binder; //容器对象

        this.autoSlide = false; //自动轮播 todo
        this.loop = false; //是否允许循环滚动

        //一页进行到底时触发事件
        //此参数主要是方便处理一些页面载入载出相关的逻辑
        this.onSlideOver = null;

        //滚动方向
        this.orientation = 'vertical'; // horizontal || verical
        if (this.orientation != 'vertical' && this.orientation !== 'horizontal') {
            throw new Error('must specify orientation of the slider');
        }

        this.isAnimating = false; //是否正在动画

        this.position = 0;
        this.currentPage = 1; //序号从1开始
        this.totalPage = this.element.querySelectorAll('.page').length;
        this.parent = this.element.parentNode;
        if (this.orientation === 'vertical') {
            this.pageSize = this.parent.offsetHeight;
        } else {
            this.pageSize = this.parent.offsetWidth;
        }

        this._thresholdVelocity = 3; //最大回弹速度，低于次速度，则认为跟随停止（即按住不动）
        this._animationDuration = 40; //此处的数值代表帧数，也就是说预计在多少帧完成动画
        this._animateVelocityRatio = 1.05; //此处的数值代表速度缓动系数，最好在0.99-1.10之间变化


        this._responder();
    }

    //初始化响应参数


    _createClass(Slider, [{
        key: '_responderInit',
        value: function _responderInit() {
            this.response = {
                inResponse: false, //是否正在响应状态
                position: null, //响应时的位置
                // responseTime: null, //上次响应时的事件，包括start、move
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
            this.currentPage = parseInt(Math.abs(newPosition / this.pageSize)) + 1;

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
            //临界值处理
            var range = [(1 - this.totalPage) * this.pageSize, 0];
            var newPosition = this.position + offsetPosition;
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

            var velocity = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];


            var pageRatio = this.position / this.pageSize;
            var range = [Math.floor(pageRatio) * this.pageSize, Math.ceil(pageRatio) * this.pageSize];
            var displayment = 0;
            if (Math.abs(velocity) >= this._thresholdVelocity) {
                if (velocity > 0) {
                    displayment = range[1] - this.position;
                } else {
                    displayment = range[0] - this.position;
                }
            } else {
                //这部分逻辑可选，移除将消灭回弹效果，但会移除一些触发不灵敏的bug
                displayment = Math.round(pageRatio) * this.pageSize - this.position;
            }

            var step = displayment / this._animationDuration;

            //开始执行动画
            this._startAnimation(function () {
                step *= _this3._animateVelocityRatio;
                var newPosition = _this3.position + step;

                if (newPosition <= range[0] || newPosition >= range[1]) {
                    if (newPosition <= range[0]) {
                        newPosition = range[0];
                    }
                    if (newPosition >= range[1]) {
                        newPosition = range[1];
                    }

                    _this3._setOnSlideOver({
                        previousPage: _this3.currentPage,
                        newPage: Math.abs(newPosition / _this3.pageSize) + 1
                    });

                    //缓动到了临界值，应该要结束动画了
                    _this3._stopAnimation();
                }
                _this3._render(newPosition);
            });
        }

        //一屏滚动完成触发

    }, {
        key: '_setOnSlideOver',
        value: function _setOnSlideOver(pageInfo) {
            this.onSlideOver && typeof this.onSlideOver == 'function' && this.onSlideOver(pageInfo);
            console.log(pageInfo);
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