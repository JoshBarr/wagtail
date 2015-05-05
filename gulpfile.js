var gulp = require('gulp');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');


gulp.task('font-awesome', function() {
    return gulp
        .src('wagtail/wagtailadmin/static-src/icons/font-awesome/*.svg')
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(gulp.dest('wagtail/wagtailadmin/static/wagtailadmin/icons/'));
});

gulp.task('svgstore', function() {
    return gulp
        .src('wagtail/wagtailadmin/static-src/icons/wagtail/*.svg')
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(gulp.dest('wagtail/wagtailadmin/static/wagtailadmin/icons/'));
});