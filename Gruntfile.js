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
          'plugin/services/**/*.js'
        ],
        dest: 'www/js/plugin.js'
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
      }
    }
  });

  grunt.registerTask('base', [
    'clean:www',
    'concat:plugin_js',
    'copy:plugin_shared',
    'copy:plugin_imgs'
  ]);

  grunt.registerTask('default', [
    'base',
    'copy:pre_js'
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
