var gulp = require('gulp')
var gutil = require('gulp-util')
var source = require('vinyl-source-stream')
var babelify = require('babelify')
var watchify = require('watchify')
var exorcist = require('exorcist')
var browserify = require('browserify')
var browserSync = require('browser-sync').create()

// Input file.
watchify.args.debug = true
var bundler = browserify('./js/refugee.js', watchify.args)

// If we're running the default task, watch for changes
if (!process.argv.length) {
  bundler = watchify(bundler)
}

// Babel transform
bundler.transform(babelify.configure({
  sourceMapRelative: 'js'
}))

// On updates recompile
bundler.on('update', bundle)

function bundle () {
  gutil.log('Compiling JS...')

  return bundler.bundle()
    .on('error', function (err) {
      gutil.log(err.message)
      browserSync.notify('Browserify Error!')
      this.emit('end')
    })
    .pipe(exorcist('js/dist/bundle.js.map'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./js/dist'))
    .pipe(browserSync.stream({once: true}))
}

/**
 * Gulp task alias
 */
gulp.task('bundle', function () {
  return bundle()
})

/**
 * First bundle, then serve from the root directory
 */
gulp.task('default', ['bundle'], function () {
  browserSync.init({
    server: '.'
  })
})
