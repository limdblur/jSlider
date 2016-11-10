# 高性能轮播控件

> 源码采用ES6开发，如果有特殊需要，请自己修改`src/slider.js`源文件。实测性能接近原生，支持滑动手势。实现要求每个子元素的尺寸和父元素保持一致，子元素的总尺寸是父元素的整数倍`n`，请自行修改CSS，或定制js。

- binder：Element DOM元素，滚动元素的父容器
- orientation：string 滚动方向，支持水平和垂直。只能取 `vertical|horizontal`，默认为`vertical`。**参数可选**
- autoSlide: bool 是否自动轮播，默认`false`。 **参数可选**
- autoSlideDirection：bool 自动轮播方向，分为正向和负向。true为负，false为正，默认`false`。**参数可选**
- loop：bool 是否支持列表循环，注意autoSlide为true时会自动激活loop为true，默认`false`。**参数可选**
- onPageShow：fucntion 每一个新页展示时触发。**参数可选**
- animationDuration: int 完成动画需要的帧数。**参数可选**
- animateVelocityRatio：number 动画执行时速度的衰减和增强幅度。**参数可选**
- autoSlideInreval：int 单位毫秒，自动轮播时，每播完一屏等待的时间。**参数可选**

###### 示例代码（演示请自行下载源码包）：
```
new Slider({
    binder: document.getElementById('container'),
    orientation: 'vertical',

    autoSlide: true,
    autoSlideDirection: true,
    loop: true,
    onPageShow: (pageInfo)=>{console.log(pageInfo)},

    animationDuration: 30,
    animateVelocityRatio: 1.05,
    autoSlideInreval: 3000 //3s
});
```
