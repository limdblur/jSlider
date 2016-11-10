import Slider from './slider';

//================================
//=========Test Case Here=========
//================================
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
