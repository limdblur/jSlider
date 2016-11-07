var path = require('path');
var gulp = require('gulp');
// var gulpCssnano = require('gulp-clean-css');
var gulpCssnano = require('gulp-cssnano');
var gulpReplace = require('gulp-replace');
var gulpUglify = require('gulp-uglify');
var gulpConnect = require('gulp-connect');
var gulpSass = require('gulp-sass');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var gulpBabel = require('gulp-babel');
var gulpPlumber = require('gulp-plumber');
var gulpAutoprefixer = require('gulp-autoprefixer');

//全局配置相关
var config = {
	//宏定义
	macro: {
		'__VERSION': Date.now().toString(16)
	},
	//发布目录
	// release: '../../../dist/2016/'+path.basename(__dirname) + '/',
    //webpack配置
    webpack: {
        entry : {
            'index' : './js/index.js'
        },
        output : {
            filename : '[name].bundle.js'
        },
		plugins : [
			new webpack.DefinePlugin({
				"process.env": {
					NODE_ENV: JSON.stringify("production")
				}
			})
		]
    },
    //babel配置
    babel: {
        presets: ["es2015", "react"]
    }
};

gulp.task('scss', function () {
	return gulp.src('./scss/*.scss')
		.pipe(gulpSass().on('error', gulpSass.logError))
		.pipe(gulpAutoprefixer({
			browsers: ['Android >= 4', 'iOS >= 7.1'],
			cascade: false
		}))
		.pipe(gulp.dest('./css/'));
});

gulp.task('css', ['scss'], function () {
	return gulp.src('./css/*.css')
		.pipe(gulpCssnano())
		.pipe(gulp.dest('./build/css/'));
});

gulp.task('babel', function(){
	return gulp.src('./src/**/*.js')
		.pipe(gulpPlumber())
		.pipe(gulpBabel(config.babel))
		.pipe(gulp.dest('./js/'));
});

gulp.task('webpack', ['babel'], function () {
	return gulp.src('./js/**/*.js')
		.pipe(gulpPlumber())
		.pipe(webpackStream(config.webpack))
		.pipe(gulp.dest('./js/'));
});

gulp.task('js', ['webpack'], function () {
	return gulp.src('./js/**/*.bundle.js')
		.pipe(gulpPlumber())
		.pipe(gulpUglify())
		.pipe(gulp.dest('./build/js/'));
});

gulp.task('html', function () {
	return gulp.src('./*.html')
		.pipe(gulp.dest('./build/'));
});

gulp.task('default', ['css', 'js', 'html'], function () {
	var stream = gulp.src(['./build/**/*.css', './build/**/*.js', 'build/*.html']);
	for (var key in config.macro) {
		if (config.macro.hasOwnProperty(key)) {
			stream = stream.pipe(gulpReplace(key, config.macro[key]));
		}
	}
	return stream.pipe(gulp.dest('./build/'));
});

gulp.task('watch', function(){
	gulp.watch('./scss/**/*.scss', ['css']);
	gulp.watch('./src/**/*.js', ['js']);
});


//启动一个本地调试服务器
gulp.task('server', function () {
	gulpConnect.server({
		root: './',
		port: 8000
	});
});
