'use strict';

var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon');

var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({
    // nodemon our expressjs server
    script: 'server.js',
    // watch core server file(s) that require server restart on change
    watch: ['server.js', 'server/**/*.js']
  })
  .on('start', function onStart() {
    // ensure start only got called once
    if (!called) { cb(); }
    called = true;
  })
  .on('restart', function onRestart() {
    // reload connected browsers after a slight delay
    setTimeout(function reload() {
      browserSync.reload({
        stream: false
      });
    }, BROWSER_SYNC_RELOAD_DELAY);
  });
});

gulp.task('browser-sync', ['nodemon'], function() {
  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync({
    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:8000',
    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,
    // open the proxied app in chrome
    //browser: 'google chrome'
  });
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

var watching = false;
function onError(err) {
  console.log(err.toString());
  if (watching) {
    this.emit('end');
  } else {
    // if you want to be really specific
    process.exit(1);
  }
}

gulp.task("test", function() {
  return gulp.src('test/**/*.js')
    .pipe(mocha({ reporter: "spec" }).on("error", onError));
});

gulp.task('default', ['browser-sync'], function() {
  //gulp.watch(['test/**/*.js', '*.js'], ['test']);
});
