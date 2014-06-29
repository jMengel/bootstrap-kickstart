// JSHint settings
/* jshint camelcase: false, es3: false */

'use strict';
//var mozjpeg = require('imagemin-mozjpeg');

module.exports = function(grunt) {

	// Get devDependencies
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

	// Displays the execution time of grunt tasks
	require('time-grunt')(grunt);

	// Config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// jsHint
		jshint: {
			options: {
				reporter: require('jshint-stylish'),
				jshintrc: '.jshintrc',
				ignores: ['assets/js/*.min.js']
			},
			all: [
				'Gruntfile.js',
				'assets/js/*.js'
			]
		},

		// uglify
		uglify: {
			options: {
				sourceMap: true,
				compress: {
					// drop_console: true
				},
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %>' +
						' - MIT License - ' +
						'<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			modules : {
				files: [{
					expand: true,
					cwd: 'assets/js',
					src: ['**/*.js', '!**/*min.js'],
					dest: 'assets/js',
					ext: '.min.js',
					extDot: 'first'
				}]
			}
		},

		// less
		less: {
			dev: {
				options: {
					sourceMap: true,
					sourceMapFilename: "assets/css/index_raw.css.map",
					sourceMapURL: "index_raw.css.map",
					sourceMapRootpath: "../../"
				},
				files: {
					"assets/css/index_raw.css": "assets/less/index.less"
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 3 version', 'ie 8', 'ie 9', 'Firefox ESR', 'Opera 12.1'],
				// diff: true, // or 'custom/path/to/file.css.patch',
				map: true
			},
			dev: {
				src: 'assets/css/index_raw.css',
				dest: 'assets/css/index.css'
			}
		},

		clean: {
			less: ["assets/css/index_raw.*"],
			dist: ["dist"],
			temp: ["temp"],
		},

		// Local dev server
		connect: {
			dev: {
				options: {
					port: 9000,
					hostname: 'localhost',
					open: {
						 target: 'http://<%= connect.dev.options.hostname %>:' +
						 '<%= connect.dev.options.port %>/assets',
					},
				}
			},
			dist: {
				options: {
					port: 9001,
					hostname: 'localhost',
					base: 'dist',
					keepalive: true,
					open: {
						 target: 'http://<%= connect.dev.options.hostname %>:' +
						 '<%= connect.dist.options.port %>/assets',
					},
				}
			}
		},

		uncss: {
			options: {
				ignoreSheets: [/fonts.googleapis/],
			},
			dist: {
				src: 'assets/*.html',
				dest: 'temp/index.css'
			}
		},

		cssmin: {
			dist: {
				options: {
					keepSpecialComments: 0,
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %>' +
						' - MIT License - ' +
						'<%= grunt.template.today("yyyy-mm-dd") %> */'
				},
				files: {
					'dist/assets/css/index.uncss.min.css': ['temp/index.css'],
					'dist/assets/css/index.min.css': ['assets/css/index.css'],
				}
			}
		},

		imagemin: {
			dist: {
				options: {},
				files: [{
					expand: true, // Enable dynamic expansion
					cwd: 'assets/img', // Src matches are relative to this path
					src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
					dest: 'dist/assets/img' // Destination path prefix
				}]
			}
		},

		processhtml: {
			dist: {
				// files: {
				// 	'dist/assets/index.html': ['assets/index.html'],
				// }
				files: [
					{
						expand: true,
						src: [
							'assets/*.html'
						],
						dest: 'dist/'
					},
				]
			}
		},

		copy: {
			dist: {
				files: [
					{
						expand: true,
						src: [
							'assets/css/*.css',
							'assets/fonts/**',
							'assets/js/**/*',
							'libs/bootstrap/dist/js/*.js',
							'libs/bootstrap/js/*.js',
							'libs/jquery/dist/*'
						],
						dest: 'dist/'
					},
				]
			}
		},

		// watch
		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: ['assets/js/**/*.js'],
				tasks: ['jshint', 'uglify:modules'],
				options: {
					spawn: false
				}
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint'],
				options: {
					spawn: false
				}
			},
			css: {
				files: ['assets/less/**/*.less'],
				tasks: ['less:dev', 'autoprefixer', 'clean:less'],
				options: {
					spawn: false
				}
			},
			html: {
				files: ['assets/**/*.html'],
				options: {
					spawn: false,
				}
			},
			images: {
				files: ['assets/img/**/*.{png,jpg,gif}'],
				options: {
					spawn: false,
				}
			}
		}

	});



	/**
	 * A task for development
	 */
	grunt.registerTask('dev',
		'`grunt server` will hint your JS and building sources within the ' +
		'assets directory while developing.',
		[
			'jshint',
			'uglify:modules',
			'less:dev',
			'autoprefixer',
			'clean:less',
		]
	);

	// Start dev server and watching files
	grunt.registerTask('server',
		'`grunt server` starts a local dev server und watches your files to ' +
		'run dev tasks when saving (jsHint, Uglify, LESS, Autoprefixer etc.)',
		[
			'connect:dev',
			'watch'
		]
	);

	// Default task
	grunt.registerTask(
		'default',
		'Default Task. Just type `grunt` for this one. Alias to `grunt server`',
		['server']
	);

	/**
	 * A task for your production ready build
	 */
	grunt.registerTask('build',
		'`grunt build` builds production ready sources to dist directory', [
		'clean:dist',
		'jshint',
		'uglify:modules',
		'less:dev',
		'autoprefixer',
		'clean:less',
		'uncss',
		'cssmin',
		'imagemin',
		'processhtml',
		'copy',
		'clean:temp',
	]);

	// Start server to check production build
	grunt.registerTask('checkBuild',
		'`grunt checkBuild` starts a local server to make it possible to check'+
		'the build in the browser',
		[
			'connect:dist'
		]
	);


};
