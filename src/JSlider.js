export default class JSlider {
    constructor(option){
        //容器对象，代表轮播对象的父对象
        this.element = null;
        if(option.element && option.element instanceof Element) {
            this.element = option.element;
        }
        if(!this.element) {
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
        if(option.orientation && ['vertical', 'horizontal'].indexOf(option.orientation) != -1) {
            this.orientation = option.orientation;
        }

        //一维坐标，当前所处的位置
        this._position = 0;

        //回弹速度临界值，超过这个速度，可能回弹
        this.reboundCritical = 3;
        if(option.reboundCritical && typeof option.reboundCritical == 'number') {
            this.reboundCritical = option.reboundCritical;
        }

        //代表惯性运动需要耗费的时间，默认60帧
        this.inertiaFrame = 30;
        if(option.inertiaFrame && typeof option.inertiaFrame == 'number') {
            this.inertiaFrame = option.inertiaFrame;
        }
        //这个值会影响运动的变化值，加速、匀速等
        this.inertiaFrameRatio = 1;
        if(option.inertiaFrameRatio && typeof option.inertiaFrameRatio == 'number') {
            this.inertiaFrameRatio = option.inertiaFrameRatio;
        }

        //是否支持列表循环
        this.loop = !!option.loop;
        //是否自动轮播
        this.autoCarousel = !!option.autoCarousel;
        //自动轮播会激活loop属性为true
        if(this.autoCarousel) {
            this.loop = true;
        }
        //是否逆向轮播，默认正向
        this.carouselReverse = !!option.carouselReverse;
        //自动轮播时每播完一屏停留的时间
        this.autoCarouselInterval = 3000; //ms
        if(option.autoCarouselInterval && typeof option.autoCarouselInterval == 'number') {
            this.autoCarouselInterval = option.autoCarouselInterval;
        }
        //轮播启动的计时器，清除将消灭轮播
        this._carouselTimer = 0;

        //初始化
        this._init();
    }

    _init(){
        this._children = this.element.querySelectorAll('.page');
        //如果子元素个数少于2，不需要执行滚动逻辑
        if(this._children.length < 2) {
            return ;
        }

        //如果是一个循环列表，那么要重新生成DOM树
        if(this.loop) {
            let tmpFirstNode = this._children.item(0).cloneNode(true),
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
    _createRanges(){
        let sum = 0;
        this._range = [];
        this._children = this.element.querySelectorAll('.page');
        this._range.push(sum);
        for(let i = 0; i < this._children.length; i++) {
            let rect = this._children.item(i).getBoundingClientRect();
            let size = rect.width;
            if(this.orientation == 'vertical') {
                size = rect.height;
            }
            sum += size;
            this._range.push(sum);
        }
    }

    _getRange(position){
        for(let i = 0; i < this._range.length; i++) {
            //刚好命中临界点，作用范围为一个点
            if(position == this._range[i]) {
                return [this._range[i], this._range[i]];
            }
            //能走到这一步，说明i>0成立
            if(position < this._range[i]) {
                return [this._range[i - 1], this._range[i]];
            }
        }
    }

    //管理状态切换
    _setState(state) {
        this._state = state;
        //任意状态切换都要停止动画
        this._stopAnimation();
        if(state == 1){
            this._stopAutoCarousel();
        } else if(state == 2) {
            this._startInertia();
            this._stopAutoCarousel();
        } else if(state == 3) {
            this._startAutoCarousel();
        }
    }

    _requestFrame(){
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(frame){
                    return window.setTimeout(frame, 1000/60);
                };
    }

    _startAnimation(frame){
        this._animation = true;
        this._animate(frame);
    }

    _stopAnimation(){
        this._animation = false;
    }

    _animate(frame){
        //是否停止动画
        if(!this._animation){
            return ;
        }

        this._requestFrame()(()=>{
            frame();
            this._animate(frame);
        });
    }

    //响应跟随系统
    _responder(){
        //检测当前页面所处的模式，鼠标还是触摸
        let touchExist = 'ontouchstart' in window;

        //获取当前手指（或鼠标指针）在屏幕位置
        let getTouchPosition = (e)=>{
            let eventObject = touchExist ? e.touches.item(0) : e;
            if(this.orientation == 'vertical') {
                return eventObject.screenY;
            }
            return eventObject.screenX;
        };

        //初始位置
        let movement = 0;

        //以下为事件响应器
        let start = (e)=>{
            if(this._state != 1){
                this._setState(1);
                movement = getTouchPosition(e);
            }
        };
        let move = (e)=>{
            if(this._state == 1){
                e.preventDefault();
                let tmpMovement = getTouchPosition(e);
                this._responseVelocity = -(tmpMovement - movement);
                movement = tmpMovement;
                this._follow();
            }
        };
        let end = (e) => {
            if(this._state == 1){
                this._setState(2);
            }
        };
        let cancel = (e) => end(e);

        //增加监听
        let startEvent = touchExist ? 'touchstart' : 'mousedown',
            moveEvent = touchExist ? 'touchmove' : 'mousemove',
            endEvent = touchExist ? 'touchend' : 'mouseup',
            cancelEvent = touchExist ? 'touchcancel' : 'mouseup';
        let doc = document.documentElement;
        this.element.addEventListener(startEvent, start);
        doc.addEventListener(moveEvent, move);
        doc.addEventListener(endEvent, end);
        if(touchExist) {
            doc.addEventListener(cancelEvent, cancel);
        }

    }

    _render(newPosition, callback) {
        //位置没变，不执行渲染
        if(newPosition == this._position) {
            return ;
        }

        this._position = newPosition;
        if(this.loop) {
            if(this._position == this._range[0]) {
                this._position = this._range[this._range.length - 3];
            }
            if(this._position == this._range[this._range.length - 2]) {
                this._position = this._range[1];
            }
        }

        let translate3d = (position)=>{
            let styleName = 'webkitTransform';
            if('transform' in this.element.style) {
                styleName = 'transform'
            }

            let style = `translate3d(-${position}px, 0, 0)`;
            if(this.orientation == 'vertical') {
                style = `translate3d(0, -${position}px, 0)`;
            }
            this.element.style[styleName] = style;
        }

        //先执行移动
        translate3d(this._position);
        //如果有回调，则渲染完成之后执行回调
        callback && typeof callback == 'function' && callback();
    }

    //跟随逻辑
    _follow(){
        let movement = this._responseVelocity;
        let range = [this._range[0], this._range[this._range.length - 2]];

        let newPosition = this._position + movement;
        if(newPosition <= range[0]) {
            newPosition = range[0];
        }
        if(newPosition >= range[1]) {
            newPosition = range[1];
        }

        //刷新
        this._render(newPosition);
    }


    //开始惯性
    _startInertia(){
        let velocity = this._responseVelocity;
        let range = this._getRange(this._position);
        //如果刚好在临界点上，则不执行惯性，直接触发状态3
        if(range[0] == range[1]) {
            this._setState(3);
            return ;
        }

        let displayment;
        //这里是默认状态，可能需要回弹
        if(this._position - range[0] > range[1] - this._position) {
            displayment = range[1] - this._position;
        } else {
            displayment = range[0] - this._position;
        }
        //这里是一冲到底，不需要回弹
        if(Math.abs(velocity) > this.reboundCritical) {
            if(velocity > 0) {
                displayment = range[1] - this._position;
            } else {
                displayment = range[0] - this._position;
            }
        }

        //计算位移需要运动的帧数
        let frame = Math.abs(displayment * this.inertiaFrame / (range[1] - range[0]));
        let acceleration = displayment / frame;

        //开始动画
        this._startAnimation(()=>{
            this._startInertiaAnimation(velocity, acceleration, range);
        });
    };

    //惯性动画帧的执行内容
    _startInertiaAnimation(velocity, acceleration, range){
        acceleration *= this.inertiaFrameRatio;
        velocity += acceleration;
        let newPosition = this._position + velocity;

        //渲染回调逻辑
        let callback = null,
            stateCallback = ()=>this._setState(3);

        //下面两个临界状态触发，实际上要先渲染，渲染完成之后执行状态跳转
        if(newPosition <= range[0]) {
            newPosition = range[0];
            callback = stateCallback;
        }
        if(newPosition >= range[1]) {
            newPosition = range[1];
            callback = stateCallback;
        }

        this._render(newPosition, callback);
    }

    //开始自动轮播
    _startAutoCarousel(){
        if(this.autoCarousel){
            this._carouselTimer = window.setTimeout(()=>{
                let range = null;
                let index = this._range.indexOf(this._position);
                if(this.carouselReverse) {
                    range = [this._range[index - 1], this._range[index]];
                } else {
                    range = [this._range[index], this._range[index + 1]];
                }

                //计算自动轮播一屏需要的位移量
                let displayment = range[1] - range[0];
                if(this.carouselReverse) {
                    displayment *= -1;
                }

                let velocity = 0;
                let acceleration = displayment/this.inertiaFrame;

                //开始执行惯性动画
                this._startAnimation(()=>{
                    this._startInertiaAnimation(velocity, acceleration, range);
                });

            }, this.autoCarouselInterval);
        }
    }
    //停止自动轮播
    _stopAutoCarousel(){
        window.clearTimeout(this._carouselTimer);
    }

}