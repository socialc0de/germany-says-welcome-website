var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var clean = require('gulp-clean');

// "Deps" tasks copy dependencies to the build directories.

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

gulp.task('deps_i18next', function () {
    gulp.src([
        'bower_components/i18next/i18next.js'])
        .pipe(rename("i18next.js"))
        .pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_jquery', function () {
    gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/FitText.js/jquery.fittext.js',
        'bower_components/jquery-easing/jquery.easing.js'
    ]).pipe(gulp.dest('js/third-party'));
});

gulp.task('deps_scrollspy', function () {
    gulp.src([
        'bower_components/scrollspy/build/scrollspy.js',
        'bower_components/scrollspy/build/jquery.scrollspy.js'
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
    'deps_jquery',
    'deps_scrollspy',
    'deps_wow'
], function () {
});

// "Build" tasks copy the website to the "dist" directory and does some minification.

function removeMin(path) {
    var re = /(.*)\.min$/;
    var matches = re.exec(path.basename);
    if (matches && matches.length > 1) {
        path.basename = matches[1];
    }
}

gulp.task('build_bootstrap', function () {
    gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css'])
        .pipe(rename('bootstrap.css'))
        .pipe(gulp.dest('dist/css/third-party'));
    gulp.src(['bower_components/jasny-bootstrap/dist/css/jasny-bootstrap.min.css'])
        .pipe(rename('jasny-bootstrap.css'))
        .pipe(gulp.dest('dist/css/third-party'));
    gulp.src(['bower_components/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(rename('bootstrap.js'))
        .pipe(gulp.dest('dist/js/third-party'));
    gulp.src(['bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js'])
        .pipe(rename('jasny-bootstrap.js'))
        .pipe(gulp.dest('dist/js/third-party'));
});

gulp.task('build_fontawesome', function () {
    gulp.src(['bower_components/font-awesome/css/font-awesome.min.css'])
        .pipe(rename('font-awesome.css'))
        .pipe(gulp.dest('dist/css/third-party/font-awesome/css'));
    gulp.src(['bower_components/font-awesome/fonts/*'])
        .pipe(gulp.dest('dist/css/third-party/font-awesome/fonts'));

});

gulp.task('build_i18next', function () {
    gulp.src([
        'bower_components/i18next/i18next.min.js'])
        .pipe(rename("i18next.js"))
        .pipe(gulp.dest('dist/js/third-party'));
});

gulp.task('build_jquery', function () {
    gulp.src(['bower_components/jquery/dist/jquery.min.js'])
        .pipe(rename('jquery.js'))
        .pipe(gulp.dest('dist/js/third-party'));
    gulp.src(['bower_components/jquery-easing/jquery.easing.min.js'])
        .pipe(rename('jquery.easing.min.js'))
        .pipe(gulp.dest('dist/js/third-party'));
    gulp.src(['bower_components/FitText.js/jquery.fittext.js']).pipe(gulp.dest('dist/js/third-party'));
});

gulp.task('build_scrollspy', function () {
    gulp.src(['bower_components/scrollspy/build/scrollspy.min.js',
        'bower_components/scrollspy/build/jquery.scrollspy.min.js'
    ])
        .pipe(rename(removeMin))
        .pipe(gulp.dest('dist/js/third-party'));
});


gulp.task('build_wow', function () {
    gulp.src([
        'bower_components/wow/dist/wow.min.js'])
        .pipe(rename(removeMin))
        .pipe(gulp.dest('dist/js/third-party'));
});

gulp.task('build_our_css', function () {
    gulp.src(['css/*'])
        .pipe(gulp.dest('dist/css'));
});

gulp.task('build_our_images', function () {
    gulp.src(['images/**/*'])
        .pipe(gulp.dest('dist/images/'));
});

gulp.task('build_our_locales', function () {
    gulp.src(['locales/**/*'])
        .pipe(gulp.dest('dist/locales/'));
});

gulp.task('build_our_js', function () {
    gulp.src(['js/theme/**/*'])
        .pipe(gulp.dest('dist/js/theme'));
    gulp.src(['js/website/**/*'])
        .pipe(gulp.dest('dist/js/website'));
});

gulp.task('build_our_html', function() {
    gulp.src(['index.html'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('build',
    ['build_bootstrap',
        'build_fontawesome',
        'build_i18next',
        'build_jquery',
        'build_scrollspy',
        'build_wow',
        'build_our_css',
        'build_our_images',
        'build_our_locales',
        'build_our_js',
        'build_our_html'], function () {
    });


// Misc. tasks.

gulp.task('cleanup', function () {
    return gulp.src('dist/', {read: false}).pipe(clean());
});


gulp.task('default', ['deps'], function () {
});
