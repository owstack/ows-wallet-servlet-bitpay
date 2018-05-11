'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project Configuration
  grunt.initConfig({
    exec: {
      clean: {
        command: 'rm -Rf bower_components node_modules'
      }
    },
    watch: {
      options: {
        dateFormat: function(time) {
          grunt.log.writeln('The watch finished in ' + time + 'ms at ' + (new Date()).toString());
          grunt.log.writeln('Waiting for more changes...');
        }
      },
      css: {
        files: ['src/css/*.css'],
        tasks: ['concat:css']
      },
      main: {
        files: [
          'plugin/plugin.js',
          'plugin/plugin.init.js',
          'plugin/shared/**/*.js',
          'plugin/services/**/*.js',
          'plugin/components/**/*.js'
        ],
        tasks: ['concat:js']
      }
    },
    sass: {
      // Plugin base css; one css file for plugin
      plugin: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['plugin/shared/sass/main.scss'],
          dest: 'www/css/',
          ext: '.css'
        }]
      },
      // Applet skins css; one css file per skin
      skins: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          flatten: false,
          cwd: 'plugin/skins/',
          src: ['**/main.scss'],
          dest: 'www/skins/',
          ext: '.css',
          rename: function (dest, src) {
            return dest + src.replace('/sass', '/css');
          }
        }]
      }
    },
    concat: {
      options: {
        sourceMap: false,
        sourceMapStyle: 'link' // embed, link, inline
      },
      plugin_js: {
        src: [
          'plugin/plugin.js',
          'plugin/plugin.init.js',
          'plugin/shared/**/*.js',
          'plugin/services/**/*.js',
          'plugin/components/**/*.js',
          'plugin/api/handlers/**/*.js'
        ],
        dest: 'www/js/plugin.js'
      },
      plugin_css: {
        src: ['www/css/main.css'],
        dest: 'www/css/main.css'
      },
      plugin_api_js: {
        src: [
          'plugin/api/*.js'
        ],
        dest: 'api/api.js'
      },
    },
    uglify: {
      options: {
        mangle: false
      },
      release: {
        files: {
          'www/js/plugin.js': ['www/js/plugin.js']
        }
      }
    },
    nggettext_extract: {
      pot: {
        files: {
          'i18n/po/template.pot': [
            'plugin/**/*.html',
            'plugin/**/*.js'
          ]
        }
      }
    },
    nggettext_compile: {
      all: {
        options: {
          module: 'owsWalletPlugin'
        },
        files: {
          'plugin/shared/translations/translations.js': ['i18n/po/*.po']
        }
      }
    },
    clean: {
      api: [
        'api/'
      ],
      www: [
        'www/'
      ],
      release: [
        'release/'
      ]
    },
    copy: {
      plugin_index: {
        expand: true,
        flatten: false,
        cwd: 'plugin/',
        src: 'index.html',
        dest: 'www/'
      },
      plugin_views: {
        expand: true,
        flatten: false,
        cwd: 'plugin/components',
        src: '**/*.html',
        dest: 'www/views/'
      },
      plugin_shared: {
        expand: true,
        flatten: false,
        cwd: 'plugin/shared',
        src: '**/*.html',
        dest: 'www/shared/'
      },
      plugin_imgs: {
        expand: true,
        flatten: false,
        cwd: 'plugin/assets/img',
        src: '**/*',
        dest: 'www/img/'
      },
      plugin_skins: {
        expand: true,
        flatten: false,
        cwd: 'plugin/assets/skins',
        src: [
          '**/*',
          '!**/sass/**' // Don't bring sass files into the app
        ],
        dest: 'www/skins/'
      },
      ionic_fonts: {
        expand: true,
        flatten: true,
        src: 'bower_components/ionic/release/fonts/ionicons.*',
        dest: 'www/fonts/'
      },
      ionic_css: {
        expand: true,
        flatten: true,
        src: 'bower_components/ionic/release/css/ionic.min.css',
        dest: 'www/css/'
      },      
      ionic_js: {
        expand: true,
        flatten: true,
        src: 'bower_components/ionic/release/js/ionic.bundle.min.js',
        dest: 'www/lib/'
      },      
      release: {
        expand: true,
        flatten: false,
        cwd: '',
        src: [
          'api/**/*',
          'www/**/*',
          'plugin.json'
        ],
        dest: 'release/'
      },
      release_plugin_index: {
        expand: true,
        flatten: false,
        cwd: 'plugin/',
        src: 'index.html.release',
        dest: 'release/www/',
        rename: function (dest, src) {
          return dest + src.replace('.release', '');
        }
      },
      pre_js: {
        expand: false,
        flatten: false,
        cwd: '',
        src: 'node_modules/@owstack/ows-wallet-plugin-client/release/ows-wallet-pre.min.js',
        dest: 'www/lib/ows-wallet-pre.js'
      },
      pre_css: {
        expand: false,
        flatten: false,
        cwd: '',
        src: 'node_modules/@owstack/ows-wallet-plugin-client/release/ows-wallet-pre.css',
        dest: 'www/css/ows-wallet-pre.css'
      }
    }
  });

  grunt.registerTask('base', [
    'clean:api',
    'clean:www',
    'sass',
    'concat:plugin_js',
    'concat:plugin_api_js',
    'concat:plugin_css',
    'copy:plugin_index',
    'copy:plugin_views',
    'copy:plugin_shared',
    'copy:plugin_imgs',
    'copy:plugin_skins'
  ]);

  grunt.registerTask('default', [
    'base',
    'copy:pre_js',
    'copy:pre_css',
    'copy:ionic_fonts',
    'copy:ionic_css',
    'copy:ionic_js'
  ]);

  grunt.registerTask('release', [
    'base',
    'uglify',
    'clean:release',
    'copy:release',
    'copy:release_plugin_index'
  ]);

  grunt.registerTask('translate', ['nggettext_extract']);
};
