var gulp       	= require('gulp'), // Подключаем Gulp
	pug					 	= require('gulp-pug'), //Подключаем Pug
	sass         	= require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  	= require('browser-sync'), // Подключаем Browser Sync
	concat       	= require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       	= require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      	= require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       	= require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          	= require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     	= require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     	= require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        	= require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer 	= require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
	cssfont64			= require('gulp-cssfont64'), // Encode base64 data from font-files and store the result in a css file
	//ignore				= require('gulp-ignore'), //Include or exclude gulp files from the stream based on a condition
	reload				= browserSync.reload;

// var path = {
// 	  jade: 'app/jade/**/*.jade',
// 	  html: 'app/*.html'
// 	};

gulp.task('pug', function() {
  return gulp.src('app/pug/**/*.pug')
    .pipe(pug({
  		pretty: true
		}))
    .pipe(gulp.dest('app')) // указываем gulp куда положить скомпилированные HTML файлы
		// .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('sass', function() { // Создаем таск Sass
	return gulp.src([	'app/sass/**/*.+(scss|sass)']) // Берем источник
		.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

 gulp.task('fontsConvert', function () {
   return gulp.src(['app/fonts/*.+(woff|woff2)'])
     .pipe(cssfont64())
     .pipe(gulp.dest('app/fonts'))
 		.pipe(browserSync.stream());
 });

gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/js/*.js'
	])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('scripts-watch', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/js/*.js', '!app/js/libs.min.js' // Берем jQuery
		// 'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css') // Выбираем файл для минификации
		.pipe(cssnano()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('pug-watch', ['pug'], reload);

gulp.task('watch', ['fontsConvert', 'pug', 'browser-sync', 'css-libs', 'scripts'], function() {
	gulp.watch('app/fonts/**/*.+(woff|woff2)', ['fontsConvert']);
	gulp.watch('app/sass/**/*.+(scss|sass)', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/pug/**/*.+(pug|jade)', ['pug-watch']); // Наблюдение за pug/jade файлами в папке pug
	gulp.watch('app/**/*.html', reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', ['scripts-watch']);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'pug', 'scripts'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/*.css') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
