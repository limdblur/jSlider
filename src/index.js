class Slider {
    constructor(binder){
        this.element = binder; //容器对象

        this.autoSlide = false; //自动轮播
        this.onSlideOver = null; //一页进行到底时触发事件
        this.orientation = 'vertical'; // horizontal || verical
        if(this.orientation != 'vertical' && this.orientation !== 'horizontal') {
            throw new Error('must specify orientation of the slider');
        }

        this.loop = false; //是否允许循环滚动
        this.isAnimating = false;

        this.position = 0;
        this.currentPage = 1; //序号从1开始
        this.totalPage = this.element.querySelectorAll('.page').length;
        this.parent = this.element.parentNode;
        if(this.orientation === 'vertical'){
            this.pageSize = this.parent.offsetHeight;
        } else {
            this.pageSize = this.parent.offsetWidth;
        }

        this.thresholdStayTime = 300; //手指最大停留时间，超过此时间，则认定脱离跟随状态
        this.thresholdVelocity = 10; //最大速度，超过此速度，始终惯性翻屏


        this._responder();
    }

    //初始化响应参数
    _responderInit(){
        this.response = {
            inResponse: false,  //是否正在响应状态
            position: null, //响应时的位置
            responseTime: null, //上次响应时的事件，包括start、move
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
                this.response.responseTime = Date.now();
                this.response.velocity = offsetPosition;
                this._follow(offsetPosition);
            }
        };
        let end = (e) => {
            if(this.response.inResponse){
                let tmpEndPosition = getTouchPosition(e);
                //停留事件代表手指停留在屏幕静止不动的时间
                let stayTime = Date.now() - this.response.responseTime;
                this._responderInit();


                //核心运动逻辑在这里
                if(stayTime < this.thresholdStayTime){
                    //小于停留时间阈值(thresholdStayTime)，则按照既定逻辑
                    if(this.response.velocity >= this.thresholdVelocity){
                        //如果速度>=thresholdVelocity，直接触发翻屏操作
                        this._slideOver(this.response.velocity);
                    } else {
                        //如果速度<=thresholdVelocity，有可能产生回弹
                        this._rebound();
                    }
                } else {
                    //大于停留时间阈值(thresholdStayTime)
                    //则认为停留过长（即按着屏幕不动），直接按照惯性回弹处理
                    this._rebound();
                }

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
        //跟随不切换页，先求边界页
        let boundary = null;
        if(this.currentPage == 1){
            boundary = [1, this.totalPage >= 2 ? 2 : 1];
        } else if(this.currentPage == this.totalPage){
            // boundary = [this.totalPage >= 2 ? this.totalPage - 1 : this.totalPage ,this.totalPage];
            boundary = [this.totalPage - 1, this.totalPage];
        } else {
            boundary = [this.currentPage - 1, this.currentPage + 1];
        }

        //然后计算边界临界值
        let rangePosition = {
            start: (boundary[0] - 1) * this.pageSize,
            end: -(boundary[1] - 1) * this.pageSize
        };

        let newPosition = this.position + offsetPosition;
        if(newPosition >= rangePosition.start) {
            newPosition = rangePosition.start;
        }
        if(newPosition <= rangePosition.end) {
            newPosition = rangePosition.end;
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
    _rebound(withVelocity = 0){
        let willReboundPage = this._willReboundPage();
        let offset = this.position/this.pageSize;

        //计算位移
        let displayment = (Math.round(offset) - offset)*this.pageSize;
        //位移为0，说明无需回弹
        if(displayment == 0) {
            return 0;
        }
        //计算回弹加速度，加速度方向决定了回弹方向
        let velocity = 0, durationFrames = 15;
        let acceleration = this._getAcceleration(velocity, displayment, durationFrames);

        //回弹范围
        let range = [
            Math.floor(offset)*this.pageSize,
            Math.ceil(offset)*this.pageSize
        ];

        //执行回弹动画
        this._startAnimation(()=>{
            velocity += acceleration;
            let newPosition = this.position + velocity;
            if(newPosition <= range[0] || newPosition >= range[1]){
                if(newPosition <= range[0]) {
                    newPosition = range[0];
                }
                if(newPosition >= range[1]){
                    newPosition = range[1];
                }
                this._stopAnimation();
                this.currentPage = parseInt(Math.abs(newPosition/this.pageSize)) + 1;
                this._setOnSlideOver(this.currentPage);
            }
            this._render(newPosition);
        });

    }

    //带初始速度滑到底
    _slideOver(velocity){

    }

    //计算将要回弹进入的页面
    _willReboundPage(){
        return Math.round(Math.abs(this.position)/this.pageHeight);
    }
    //一屏滚动完成触发
    _setOnSlideOver(pageIndex){
        this.onSlideOver &&
        typeof this.onSlideOver == 'function' &&
        this.onSlideOver(pageIndex);
    }
    //停止自动滚动
    stopAutoSlide(){}
    //开始自动滚动
    startAutoSlide(){}

}

new Slider(document.getElementById('container'));
