import JSlider from './JSlider';

//================================
//=========Test Case Here=========
//================================
new JSlider({
    element: document.getElementById('container'),
    orientation: 'vertical',
    inertiaFrame: 60,
    inertiaFrameRatio: 1.03,
    reboundCritical: 2,
    autoCarousel: true,
    // carouselReverse: true,
    autoCarouselInterval: 3000,
    loop: true,
    onPageShow: (page)=>console.log(page)
});
