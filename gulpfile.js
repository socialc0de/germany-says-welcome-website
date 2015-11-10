var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('deps_bootstrap', function () {
    gulp.src([
        'bower_components/bootstrap/dist/css/bootstrap.css',
        'bower_components/jasny-bootstrap/dist/css/jasny-bootstrap.css'
    ]).pipe(gulp.dest('css/third-party'));

    gulp.src([
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.js'
    ]).pipe(gulp.dest('js/third-party'));

});

gulp.task('deps_fontawesome', function () {
    gulp.src(['bower_components/font-awesome/css/font-awesome.css'])
        .pipe(gulp.dest('css/third-party/font-awesome/css'));
    gulp.src(['bower_components/font-awesome/fonts/*'])
        .pipe(gulp.dest('css/third-party/font-awesome/fonts'));

});

gulp.task('deps_handlebars', function () {
    gulp.src(['bower_components/handlebars/handlebars.amd.js'])
        .pipe(rename("handlebars.js"))
        .pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_hoverboard', function () {
    gulp.src(['bower_components/hoverboard-flux/dist/hoverboard.js'])
        .pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_html2hscript', function () {
    return browserify({entries: ['node_modules/html2hscript/index.js'],
        standalone: 'html2hscript'})
        .bundle()
        .pipe(source('html2hscript.js'))
        .pipe(gulp.dest("js/third-party"));
});

gulp.task('deps_i18next', function () {
    gulp.src([
        'bower_components/i18next/i18next.amd.withJQuery.js'])
        .pipe(rename('i18next.js'))
        .pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_jquery', function () {
    gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/FitText.js/jquery.fittext.js',
        'bower_components/jquery-easing/jquery.easing.js'
    ]).pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_requirejs', function () {
    gulp.src([
        'bower_components/requirejs/require.js'
    ]).pipe(gulp.dest('js/third-party'));
    gulp.src([
        'bower_components/requirejs-domready/domReady.js'
    ])
        .pipe(rename('requirejs-domready.js'))
        .pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_vdom', function () {
    gulp.src([
        'bower_components/virtual-dom/dist/virtual-dom.js'
    ]).pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_wow', function () {
    gulp.src([
        'bower_components/wow/dist/wow.js'
    ]).pipe(gulp.dest('js/third-party'));
});

gulp.task('deps', [
    'deps_bootstrap',
    'deps_fontawesome',
    'deps_i18next',
    'deps_handlebars',
    'deps_html2hscript',
    'deps_hoverboard',
    'deps_jquery',
    'deps_requirejs',
    'deps_vdom',
    'deps_wow'
], function () {
});

gulp.task('default', ['deps'], function () {
});
