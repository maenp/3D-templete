
const path = require('path');
var gulp = require('gulp');
var fileInline = require('gulp-file-inline');
var htmlmin = require('gulp-htmlmin');

let projectPath = path.join(__dirname, "../../../");


let doHtmlMin = function (cb) {
  gulp.src(`${projectPath}/build/web-mobile/index.html`)
    .pipe(fileInline({//内联资源
      js: {
        filter: function(tag) {
            return tag.indexOf('data-inline="true"') > 0;
        }
      }
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,//压缩HTML
      removeComments: true,//清除HTML注释
      minifyJS: true,//压缩页面JS
    }))
    .pipe(gulp.dest(`${projectPath}/build/web-mobile/`).on('end', cb));
}

exports.default = gulp.series(
  doHtmlMin
)