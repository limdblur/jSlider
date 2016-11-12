'use strict';

var _JSlider = require('./JSlider');

var _JSlider2 = _interopRequireDefault(_JSlider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//================================
//=========Test Case Here=========
//================================
new _JSlider2.default({
    element: document.getElementById('container'),
    orientation: 'vertical',
    inertiaFrame: 60,
    inertiaFrameRatio: 1.01,
    reboundCritical: 2,
    autoCarousel: true,
    // carouselReverse: true,
    autoCarouselInterval: 3000,
    loop: true
});