'use strict';

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//================================
//=========Test Case Here=========
//================================
new _slider2.default({
    binder: document.getElementById('container'),
    orientation: 'vertical',

    autoSlide: true,
    autoSlideDirection: true,
    loop: true,
    onPageShow: function onPageShow(pageInfo) {
        console.log(pageInfo);
    },

    animationDuration: 30,
    animateVelocityRatio: 1.05,
    autoSlideInreval: 3000 //3s
});