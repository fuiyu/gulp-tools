'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
// var shrink = require('gulp-cssshrink');
var cleanCSS = require('gulp-clean-css');

var smushit = require('gulp-smushit');
// 静态文件打包合并
var webpack = require('gulp-webpack');
// 上传七牛sdn
// var qn = require('gulp-qn');
// MD5戳
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var runSequence = require('run-sequence');
var spritesmith = require('gulp.spritesmith');

var config = require('./webpack.config');
// var qiniu = {
//   accessKey: '6sBCo463jJOCnBIYX__uy9avZ7C2hj_MHb-ffKAr',
//   secretKey: '3vPk7fB0HcwL5V9E2AErHuR19HM389eYqdvQcncL',
//   bucket: 'xdemo',
//   domain: 'http://7xik9a.com1.z0.glb.clouddn.com'
// };

// gulp.task('js', function () {
//   gulp.src('./js')
//     .pipe(webpack(config))
//     .pipe(gulp.dest('./build'));
// });

// gulp.task('css', function () {
//   gulp.src(['./css/main.css', './css/view.css'])
//     .pipe(concat('app.css'))
//     .pipe(gulp.dest('./build'));
// });
gulp.task('publish-js', function () {
  return gulp.src(['./js'])
    .pipe(webpack(config))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./build'))
    // .pipe(qn({
    //   qiniu: qiniu,
    //   prefix: 'gmap'
    // }))
    .pipe(rev.manifest({
      merge: true
    }))
    .pipe(gulp.dest('./build/rev/js'));
});
gulp.task('publish-css', function () {
  return gulp.src(['./css/main.css', './css/view.css'])
    .pipe(concat('app.css'))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rev())
    .pipe(gulp.dest('./build'))
    .pipe(rev.manifest({
      merge: true
    }))
    .pipe(gulp.dest('./build/rev/css'));
});

gulp.task('watch', function () {
  gulp.watch('./css/*.css',
    function (callback) {
      runSequence(
        'publish-css', 'publish-html'
      );
    }
  );
  gulp.watch('./js/*.js',
    function (callback) {
      runSequence(
        'publish-js', 'publish-html'
      );
    }
  );
  gulp.watch('./images/*', ['smushit']);
});

gulp.task('publish-html', function () {
  return gulp.src(['./build/rev/**/*.json', './index.html'])
    .pipe(revCollector({
      dirReplacements: {
        'build/': ''
      }
    }))
    .pipe(gulp.dest('./build/'));
});

gulp.task('publish', function (callback) {
  runSequence(
    ['publish-css', 'publish-js'],
    'publish-html',
    callback);
});

// 图片压缩
gulp.task('smushit', function () {
  return gulp.src('images/**/*', {
      base: 'images'
    })
    .pipe(smushit({
      verbose: true
    }))
    .pipe(gulp.dest('dist/images'));
});

// 雪碧图生成工具
gulp.task('sprite', function () {
  var spriteData = gulp.src('images/*.png').pipe(spritesmith({
    imgName: 'btn_sprite.png',
    cssName: 'btn_sprite.css'
  }));
  return spriteData.pipe(gulp.dest('dist/images'));
});
// gulp.task('default',['publish','smushit','watch'])
// gulp.task('default', ['smushit'])
gulp.task('default', ['sprite'])
