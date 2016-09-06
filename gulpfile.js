var gulp = require('gulp'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    gulpif = require('gulp-if'),
    browserify = require('browserify'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync');


var sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    lost    = require('lost'),
    minifyCss = require('gulp-minify-css');


function errorAlert(error){
    notify.onError({
        title: "Error",
        message: "Check your terminal",
        sound: "Sosumi"})(error);
    console.log(error.toString());
    this.emit("end");
};


var devBuild = ((process.env.NODE_ENV || 'dev').trim().toLowerCase() !== 'prod');

var src = 'src/';
var dest = 'build/';


gulp.task('sass', function() {
    return gulp.src(src + "scss/main.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'nested'}))
        .on('error', errorAlert)
        .pipe(postcss([
              lost(),
              autoprefixer({
                browsers: ['last 2 versions']
            })
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest + "css"))
        .pipe(browserSync.stream());
});


gulp.task('minify-css', function() {
    if (!devBuild) {
        return gulp.src( dest + 'css/*.css' )
            .pipe(minifyCss({compatibility: 'ie8'}))
            .pipe(gulp.dest(dest + 'css'));
    }
});


gulp.task('js-plugins', function() {
    return gulp.src(src + 'js/plugins/**/*.js')
        .pipe(deporder())
        .pipe(concat('all.js'))
        .pipe(gulp.dest(dest + 'js/'));
});


gulp.task('combine', [ 'browserify', 'js-plugins' ], function() {
    return gulp.src([ dest + 'js/all.js', dest + 'js/bundle.js' ])
    .pipe(concat('all.min.js'))
    .pipe(gulpif(!devBuild, uglify()))
    .pipe(gulp.dest(dest + 'js/'));
});



gulp.task('lintjs', function() {
    return gulp.src(src + 'js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});



gulp.task('browserify', function () {
    return browserify(src + 'js/app/entry', { debug: true})
        .bundle()
        .on('error', errorAlert)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(dest + 'js'));
});


gulp.task('browser-sync', function() {
    browserSync({
         proxy: "localhost/devon-atlas/build"
        // server: {
        //     baseDir: "./build"
        // }
    });
});

gulp.task('reload-js', ['lintjs', 'combine' ], function() {
    browserSync.reload();
});

gulp.task('reload-css', ['sass'], function() {
    browserSync.reload();
});


gulp.task('watch', ['sass', 'lintjs', 'combine', 'browser-sync'], function() {
    gulp.watch(src + 'js/**/*.js', ['reload-js']);
    gulp.watch(src + 'scss/**/*.scss', ['reload-css']);
});


gulp.task('default', ['watch']);

