/**
 * Compiles font files from svg.
 */

const gulp = require('gulp');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');

gulp.task('iconfont', () => {
    return gulp.src(['src/assets/fonts/crypto-icons/crypto-svg/*.svg'])
        .pipe(iconfontCss({
            fontName: "crypto-icons",
            targetPath: '../../../global-styles/_icons.scss',
            fontPath: '../assets/fonts/crypto-icons/',
            cssClass: 'crypto-icon'
        }))
        .pipe(iconfont({
            fontName: "crypto-icons",
            prependUnicode: true,
            normalize: true,
            fontHeight: 1001,
            formats: ['ttf', 'eot', 'woff', 'woff2', 'svg']
        }))
        .pipe(gulp.dest('src/assets/fonts/crypto-icons/'));
});