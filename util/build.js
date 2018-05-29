#!/usr/bin/env node

'use strict';

var fs = require('fs-extra');
var execSync = require('child_process').execSync;

// This script runs from the project root directory via Grunt.

console.log("Starting build");

console.log('>> [1/3] Exporting images from resources sketch file');
exportResourcesSketch();

console.log('>> [2/3] Updating package.json');
updatePackageJson();

console.log('>> [3/3] Building index.html');
createIndexHtml();

console.log("Build complete");

//////////////

// [1/3] Generate image resources from sketch file.
//
function exportResourcesSketch() {
  execSync('sh ./generate.sh', { cwd: './util/resources', stdio: [0,1,2] });
};

// [2/3] Update fields in package.json from plugin.json.
//
function updatePackageJson() {
  // Read and parse content of each file.
  var pkg = getPackage();
  var plugin = getPlugin();

  // Create assignments in package.json
  pkg.title = plugin.header.name;
  pkg.version = plugin.header.version;
  pkg.description = plugin.header.description;
  pkg.author = plugin.header.author;

  // Write the result.
  pkg = JSON.stringify(pkg, null, 2);
  fs.writeFileSync('./package.json', pkg, 'utf8');
};

// [3/3] Create the index.html file by substituting values from json config files.
//
function createIndexHtml() {
  var pkg = getPackage();
  var plugin = getPlugin();

  // Setup substitutions.
  var config = {};

  // Substitute the plugin name.
  config.pluginName = plugin.header.name;
  config.pluginKind = plugin.header.kind;

  // If the plugin package includes an npm organization (i.e., starts with '@') then the plugin path is one level deeper than without.
  config.rootRelative = (pkg.name.indexOf('@') == 0 ? '../../../../' : '../../../');

  // Insert css links if the plugin is an applet.
  if (plugin.header.kind == 'applet') {
    config.plugincss = {};
    config.plugincss = '\n  <link rel="stylesheet" type="text/css" href="' + config.rootRelative + 'css/ionic.min.css">';
    config.plugincss += '\n  <link rel="stylesheet" type="text/css" href="' + config.rootRelative + 'css/ows-wallet-applet.css">';
  } else {
    config.plugincss = '';
  }

  // Read the index.html template.
  var indexHtml = fs.readFileSync('./plugin/index.html.template', 'utf8');

  Object.keys(config).forEach(function(k) {
    // Replace the key with a value.
    var r = new RegExp("\\*" + k.toUpperCase() + "\\*", "g");
    indexHtml = indexHtml.replace(r, config[k]);
  });

  fs.writeFileSync('./plugin/index.html', indexHtml, 'utf8');
};

// Get package.json as an object.
//
function getPackage() {
  var pkg = fs.readFileSync('./package.json', 'utf8');
  return JSON.parse(pkg, 'utf8');
};

// Get plugin.json as an object.
//
function getPlugin() {
  var plugin = fs.readFileSync('./plugin.json', 'utf8');
  return JSON.parse(plugin, 'utf8');
};
