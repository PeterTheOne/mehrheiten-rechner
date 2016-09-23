module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      jquery: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/jquery/dist/',
            src: 'jquery.min.js',
            dest: 'vendor/js/'
          }
        ]
      },
      bootstrap: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/bootstrap/dist/css/',
            src: 'bootstrap.min.css',
            dest: 'vendor/css/'
          },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/dist/js/',
            src: 'bootstrap.min.js',
            dest: 'vendor/js/'
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy']);

};