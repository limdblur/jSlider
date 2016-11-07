class Slider {
    constructor(binder){
        this.element = binder; //容器对象

        this.autoSlide = false; //自动轮播
        this.onPageStop = null; //一页进行到底时触发事件
        this.orientation = 'vertical'; // horizontal || verical
        if(this.orientation != 'vertical' && this.orientation !== 'horizontal') {
            throw new Error('must specify orientation of the slider');
        }

        this.loop = false; //是否允许循环滚动

        this.position = 0;
        this.currentPage = 1; //序号从1开始
        this.totalPage = this.element.querySelectorAll('.page').length;
        this.parent = this.element.parentNode;
        if(this.orientation === 'vertical'){
            this.pageSize = this.parent.offsetHeight;
        } else {
            this.pageSize = this.parent.offsetWidth;
        }

        this.thresholdTime = 300; //手指最大停留时间，超过此时间，则认定脱离跟随状态
        this.thresholdVelocity = 10; //最大速度，超过此速度，始终惯性翻屏


        this.responder();
    }

    //初始化响应参数
    responderInit(){
        this.response = {
            inResponse: false,  //是否正在响应状态
            position: null, //响应时的位置
            responseTime: null, //上次响应时的事件，包括start、move
        };
    }

    //响应跟随系统
    responder(){
        this.responderInit();

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
                this.follow(offsetPosition);
            }
        };
        let end = (e) => {
            if(this.response.inResponse){
                let tmpEndPosition = getTouchPosition(e);
                let velocity = tmpEndPosition - this.response.position;
                //停留事件代表手指停留在屏幕静止不动的时间
                let stayTime = Date.now() - this.response.responseTime;
                this.responderInit();


                if(stayTime < this.thresholdTime){
                    //小于300毫秒，则按照既定逻辑

                    if(velocity >= this.thresholdVelocity){
                        //如果速度>=10，直接触发翻屏操作
                    } else {
                        //如果速度<=10，则严格按照物理学规律
                    }

                } else {
                    //大于300毫秒，认定为停留过长，直接按照惯性回弹处理
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

    //执行最终的位移渲染
    render(newPosition){
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

    //跟随
    follow(offsetPosition){
        //跟随不切换页，先求边界页
        let boundary = null;
        if(this.currentPage == 1){
            boundary = [1, this.totalPage >= 2 ? 2 : 1];
        } else if(this.currentPage == totalPage){
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

        this.render(newPosition);
    }

    //回弹
    rebound(){}
    //计算将要回弹进入的页面
    _willReboundPage(){
        return Math.round(Math.abs(this.position)/this.pageHeight);
    }
    //一屏滚动完成触发
    setOnPageStop(page){
        this.onPageStop &&
        typeof this.onPageStop == 'function' &&
        this.onPageStop(page);
    }
    //停止自动滚动
    stopAutoSlide(){}
    //开始自动滚动
    startAutoSlide(){}

}

new Slider(document.getElementById('container'));
