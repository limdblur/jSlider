class Slider {
    constructor(binder){
        this.element = binder; //容器对象

        this.autoSlide = false; //自动轮播 todo
        this.loop = false; //是否允许循环滚动

        //一页进行到底时触发事件
        //此参数主要是方便处理一些页面载入载出相关的逻辑
        this.onSlideOver = null;

        //滚动方向
        this.orientation = 'vertical'; // horizontal || verical
        if(this.orientation != 'vertical' && this.orientation !== 'horizontal') {
            throw new Error('must specify orientation of the slider');
        }

        this.isAnimating = false; //是否正在动画

        this.position = 0;
        this.currentPage = 1; //序号从1开始
        this.totalPage = this.element.querySelectorAll('.page').length;
        this.parent = this.element.parentNode;
        if(this.orientation === 'vertical'){
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
    _responderInit(){
        this.response = {
            inResponse: false,  //是否正在响应状态
            position: null, //响应时的位置
            // responseTime: null, //上次响应时的事件，包括start、move
            velocity: 0 //移动速度
        };
    }

    //响应跟随系统
    _responder(){
        this._responderInit();

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
        //以下为事件响应器
        let start = (e)=>{
            if(!this.response.inResponse){
                //一旦开始响应，将要移除上一次的动画执行时
                this._stopAnimation();

                this.response.inResponse = true;
                this.response.position = getTouchPosition(e);
                this.response.responseTime = Date.now();
            }
        };
        let move = (e)=>{
            e.preventDefault();
            if(this.response.inResponse){
                let tmpMovePosition = getTouchPosition(e);
                let offsetPosition = tmpMovePosition - this.response.position;
                this.response.position = tmpMovePosition;
                this.response.velocity = offsetPosition;

                this._follow(offsetPosition);
            }
        };
        let end = (e) => {
            if(this.response.inResponse){
                let lastVelocity = this.response.velocity;
                this._responderInit();
                this._rebound(lastVelocity);
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
        doc.addEventListener(cancelEvent, cancel);
    }

    //动画逻辑
    _animate(frame){
        if(!frame || typeof frame != 'function'){
            return ;
        }

        if(this.isAnimating === false){
            return ;
        }

        let requestFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(frame){
                return window.setTimeout(frame, 1000/60);
            };

        requestFrame(()=>{
            frame();
            this._animate(frame);
        });
    }

    //开始执行动画
    _startAnimation(frame){
        this.isAnimating = true;
        this._animate(frame);
    }

    //中断执行动画
    _stopAnimation(){
        this.isAnimating = false;
    }

    //执行最终的位移渲染
    _render(newPosition){
        if(newPosition == this.position){
            return ;
        }

        //在这里更新位置
        this.position = newPosition;
        this.currentPage = parseInt(Math.abs(newPosition/this.pageSize)) + 1;

        let style = `translate3d(${this.position}px, 0, 0)`;
        if(this.orientation == 'vertical') {
            style = `translate3d(0, ${this.position}px, 0)`;
        }

        let styleName = 'webkitTransform';
        if('transform' in this.element.style) {
            styleName = 'transform'
        }

        this.element.style[styleName] = style;
    }

    //跟随(也就是手指或鼠标拖动)
    _follow(offsetPosition){
        //临界值处理
        let range = [(1 - this.totalPage) * this.pageSize, 0];
        let newPosition = this.position + offsetPosition;
        if(newPosition <= range[0]){
            newPosition = range[0];
        } else if(newPosition >= range[1]) {
            newPosition = range[1];
        }
        this._render(newPosition);
    }

    //根据位移公式计算加速度
    //v : 初始速度
    //s : 总位移
    //t : 消耗的总时间，这里是帧数，约定30帧(大约半秒)执行完
    _getAcceleration(v, s, t = 30){
        //公式: v*t + a*t*t/2 = s
        return ( s - v * t ) * 2 / ( t * t );
    }

    //特定速度下回弹
    _rebound(velocity = 0){

        let pageRatio = this.position / this.pageSize;
        let range = [
            Math.floor(pageRatio) * this.pageSize,
            Math.ceil(pageRatio) * this.pageSize
        ];
        let displayment = 0;
        if(Math.abs(velocity) >= this._thresholdVelocity) {
            if(velocity > 0) {
                displayment = range[1] - this.position;
            } else {
                displayment = range[0] - this.position;
            }
        } else {
            //这部分逻辑可选，移除将消灭回弹效果，但会移除一些触发不灵敏的bug
            displayment = Math.round(pageRatio) * this.pageSize - this.position;
        }

        let step = displayment / this._animationDuration;

        //开始执行动画
        this._startAnimation(()=>{
            step *= this._animateVelocityRatio;
            let newPosition = this.position + step;

            if(newPosition <= range[0] || newPosition >= range[1]){
                if(newPosition <= range[0]) {
                    newPosition = range[0];
                }
                if(newPosition >= range[1]){
                    newPosition = range[1];
                }

                this._setOnSlideOver({
                    previousPage: this.currentPage,
                    newPage: Math.abs(newPosition/this.pageSize) + 1
                });

                //缓动到了临界值，应该要结束动画了
                this._stopAnimation();
            }
            this._render(newPosition);

        });

    }

    //一屏滚动完成触发
    _setOnSlideOver(pageInfo){
        this.onSlideOver &&
        typeof this.onSlideOver == 'function' &&
        this.onSlideOver(pageInfo);
        console.log(pageInfo);
    }
    //停止自动滚动
    stopAutoSlide(){}
    //开始自动滚动
    startAutoSlide(){}

}

new Slider(document.getElementById('container'));
