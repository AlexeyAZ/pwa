var gulp = require('gulp'),
    watch = require('gulp-watch'), // альтернативный вариант слежения //
    prefixer = require('gulp-autoprefixer'), // вендорные префиксы //
    uglify = require('gulp-uglify'), // сжатие JS //
    less = require('gulp-less'), // компиляция less в css //
    //sass = require('gulp-sass'), // компиляция scss в css
    sourcemaps = require('gulp-sourcemaps'), // sourcemaps для css //
    rigger = require('gulp-rigger'), // импорт одного файла в другой //
    //concat = require('gulp-concat'), // объединение нескольких файлов в один
    imagemin = require('gulp-imagemin'), // сжатие изображений //
    pngquant = require('imagemin-pngquant'), // сжатие png изображений //
    del = require('del'), // права на удаление папок и файлов //
    browserSync = require("browser-sync"), // обновление окна браузера
    cssnano = require('gulp-cssnano'), // сжатие css
    pump = require('pump')
;
var path = {
    //Готовые после сборки файлы
    build: {
        html: 'build/',
        favicon: 'build/',
        json: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    //Пути откуда брать исходники
    src: {
        //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        html: 'src/*.html',
        favicon: 'src/favicon.ico',
        json: 'src/*.json',
        js: 'src/js/*.js',
        less: 'src/less/style.less',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    //За изменением каких файлов необходимо наблюдать
    watch: {
        html: 'src/**/*.html',
        favicon: 'src/favicon.ico',
        json: 'src/*.json',
        js: 'src/js/**/*.js',
        less: 'src/less/**/*.less',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend"
};

var reload = browserSync.reload;

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('favicon:build', function () {
    gulp.src(path.src.favicon) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.favicon)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('json:build', function () {
    gulp.src(path.src.json) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.json)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function (cb) {
    pump([
        gulp.src(path.src.js), //Найдем наш main файл
            rigger(), //Прогоним через rigger
            sourcemaps.init(), //Инициализируем sourcemap
            //uglify(), //Сожмем наш js
            sourcemaps.write(), //Пропишем карты
            gulp.dest(path.build.js), //Выплюнем готовый файл в build
            reload({stream: true}) //И перезагрузим сервер
    ],
    cb
  );
});


gulp.task('less:build', function () {
    gulp.src(path.src.less) //Выберем наш main.less
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(less())
        .pipe(prefixer())
        .pipe(cssnano())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('build', [
    'html:build',
    'favicon:build',
    'json:build',
    'js:build',
    'less:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.json], function(event, cb) {
        gulp.start('favicon:build');
    });
    watch([path.watch.json], function(event, cb) {
        gulp.start('json:build');
    });
    watch([path.watch.less], function(event, cb) {
        gulp.start('less:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    del(path.clean, cb);
});

gulp.task('default', ['build', /*'webserver',*/ 'watch']);
