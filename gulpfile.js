'use strict';

var gulp = require('gulp');

var uglify = require('gulp-uglify'),
    runSequence = require("run-sequence").use(gulp),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    bom = require('gulp-bom'),
    exec = require('gulp-exec');

var pkg = require('./package.json')
var head = `/*!
 * BackBlur.js v${pkg.version}
 * 
 * Copyright 2017 Alexis Cheron
 * Licensed under MIT (${pkg.repository}/blob/master/LICENSE)
 */`+"\n"


 gulp.task('ts', function(){ // Used exec because gulp-ts dont work
    var options = {
      continueOnError: true,
      pipeStdout: false
    };
    var reportOptions = {
        err: true,
        stderr: true,
        stdout: true
    }

    var isWin = /^win/.test(process.platform);
    return gulp.src('.')
        .pipe(exec('"./node_modules/.bin/'+(isWin ? 'tsc.cmd' : 'tsc') + '"', options))
        .pipe(exec.reporter(reportOptions));
  
  });
  
  gulp.task('ts:header', function(){
    return gulp.src('./dist/backblur.js')
        .pipe(header(head))
        .pipe(bom())
        .pipe(gulp.dest('./dist'))
  });
  
  gulp.task('ts:minification', function(){
    return gulp.src('./dist/backblur.js')
      .pipe(uglify())
      .pipe(header(head))
      .pipe(bom())
      .pipe(rename('backblur.min.js'))
      .pipe(gulp.dest('./dist'))
  });

  gulp.task('watch', function () {
    gulp.watch('./src/**/*.ts', ['ts']);
  });
  
  gulp.task('default', function(cb){
    runSequence('ts', 'ts:header', 'ts:minification', cb);
  });