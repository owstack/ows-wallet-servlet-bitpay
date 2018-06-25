'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project Configuration
  grunt.initConfig({
    exec: {
      build: {
        command: 'node ./util/build.js'
      },
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
      main: {
        files: [
          'plugin/plugin.js',
          'plugin/plugin.init.js',
          'plugin/shared/**/*.js',
          'plugin/services/**/*.js'
        ],
        tasks: ['concat:js']
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
          'plugin/api/handlers/**/*.js'
        ],
        dest: 'www/js/plugin.js'
      },
      plugin_api_js: {
        src: [
          'plugin/api/api.module.js',
          'plugin/api/public/**/*.js'
        ],
        dest: 'api/api.js'
      },
    },
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      api: {
        files: {
          'www/js/plugin.js': 'www/js/plugin.js',
          'api/api.js': 'api/api.js'
        },
      },
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
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      release: {
        files: {
          'release/www/js/plugin.js': ['release/www/js/plugin.js']
        }
      }
    }
  });

  grunt.registerTask('dev', [
    'clean:release',
    'clean:api',
    'clean:www',
    'concat:plugin_js',
    'concat:plugin_api_js',
    'ngAnnotate',
    'exec:build',
    'copy:plugin_index',
    'copy:plugin_shared',
    'copy:plugin_imgs',
    'copy:release'
  ]);

  grunt.registerTask('default', [
    'dev',
    'uglify'
  ]);

  grunt.registerTask('translate', ['nggettext_extract']);
};
