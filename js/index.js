'use strict';

var _jSlider = require('./jSlider');

var _jSlider2 = _interopRequireDefault(_jSlider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//================================
//=========Test Case Here=========
//================================
new _jSlider2.default({
    element: document.getElementById('container'),
    orientation: 'vertical',
    inertiaFrame: 60,
    inertiaFrameRatio: 1.03,
    reboundCritical: 2,
    autoCarousel: true,
    // carouselReverse: true,
    autoCarouselInterval: 3000,
    loop: true,
    onPageShow: function onPageShow(page) {
        return console.log(page);
    }
});