const gulp = require('gulp'),
      path = require('path'),
      data = require('gulp-data'),
      yaml = require('js-yaml'),
      twig = require('gulp-twig'),
      // sass = require('gulp-sass'),
      sass = require('gulp-sass')(require('sass')),
      plumber = require('gulp-plumber'),
      cleancss = require('gulp-clean-css'),
      purgecss = require('gulp-purgecss'),
      prefix = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      browserSync = require('browser-sync').create(),
      fs = require('fs');
      sass.compiler = require('node-sass');

class App {
  constructor(app){
    this.app = app.name;
    this.path = {
      scss: `css/scss`,
      css: `css`,
      js: `js`,
      twig: `twig`,
      data: `data`,
      html: `html`
    };
    this.files = {
      scss: `${this.path.scss}/**/*.scss`,
      js: `${this.path.js}/*.js`,
      twig: `${this.path.twig}/*.twig`,
      compile_twig: this.mapTwig(app.is_template),
      yaml: `${this.path.data}/*.yaml`,
      html: `${this.path.html}/*.html`,
    };
  }
  
  mapTwig(is_template) {
    //篩選哪些twig不要輸出html
    var _filter = [
          '_*', '*.*'
        ].join('|'),
        _file = is_template ? '!(* - *)' : `!(${_filter})`;
    return `${this.path.twig}/${_file}.twig`;
  }
}
const config = new App({name: '.', is_template: false});
function compileTwig() {
  return gulp.src(config.files.compile_twig)
    .pipe(
      //gulp時的錯誤提示 
      plumber({
        handleError: function (err) {
          console.log(err);
          this.emit('end');
        }
      })
    )
    .pipe(
      //撈data
      data(function (file) {
            //對照名稱條件
        var fileName = path.basename(file.path).replace('.twig', '.yaml'),
            //fs.existsSync(path):路徑存在返回true, 否則false
            //yaml.safeLoad():以安全方式讀取
            //fs.readFileSync（path，options）:同步讀取(路徑,編碼)並返回其內容
            //data=(若此路徑存在)?(返回其內容):{若無則返回空物件}
            _data =  (fs.existsSync(`${config.path.data}/${fileName}`)) ? yaml.load(fs.readFileSync(`${config.path.data}/${fileName}`, 'utf-8')): {};
        return _data;
      })
    )
    .pipe(
      twig()
      //編twig時的錯誤提示
      .on('error', function (err) {
        process.stderr.write(err.message + '\n');
        this.emit('end');
      })
    )
    .pipe(
      //輸出html
      gulp.dest(`${config.path.html}/`)
    );
}

function compileSass() {
  return gulp.src(`${config.path.scss}/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(
      sass({ outputStyle: 'compressed' }).on('error', sass.logError)
    )
    // .pipe(
    //   purgecss({
    //     content: [
    //       `${config.files.html}`,
    //       `${config.files.twig}`,
    //       `${config.files.js}`,
    //       `${config.path.scss}/helps/*.scss`,
    //       `${config.path.scss}/layout/_common.scss`,
    //       `${config.path.scss}/template/_form.scss`,
    //       `${config.path.scss}/template/_editor.scss`,
    //     ],
    //     //為運算樣式寫的白名單
    //     safelist: [/^[placeholder]/,/^[flex]/,/^[api]/,/^[col]/,/^[w,m]\d{2}$/,/^[s,m,l][x,y,t,b,l,r]\d{1,3}.*/,/active/]
    //   }),
    // )
    .pipe(
      prefix(['last 5 versions', '> 1%'], { cascade: true })
    )
    .pipe(cleancss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${config.path.css}`))
}
//監看
function watch() {
  browserSync.init({
    server: './'
  });
  gulp.watch([`${config.files.twig}`], compileTwig);
  gulp.watch([`${config.files.scss}`], compileSass);
  gulp.watch([`${config.files.yaml}`]).on('change', compileTwig);
  gulp.watch([`${config.files.yaml}`, `${config.files.twig}`, `${config.files.scss}`, `${config.files.js}`]).on('change', browserSync.reload);
}
exports.compileTwig = compileTwig;
exports.compileSass = compileSass;
exports.default = watch;