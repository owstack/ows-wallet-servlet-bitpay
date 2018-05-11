#!/usr/bin/env node

'use strict';

var fs = require('fs-extra');
var path = require('path');

function copyDir(from, to) {
  console.log('Copying dir ' + from + ' to ' + to);

  if (!fs.existsSync(from)) {
    return;
  }
  if (fs.existsSync(to)) {
    fs.removeSync(to);
  }

  fs.copySync(from, to);
}

var templates = {
  // output: template input
  '/package.json': 'package-template.json',
  '/plugin.json': 'plugin-template.json',
  'plugin/index.html': 'index-template.html',
  'plugin/index.html.release': 'index-template.html',
  '/ionic.config.json': 'ionic.config.json'
};

var configDir = process.argv[2];
if (!fs.existsSync(configDir)) {
  console.log('No distribution found for: ' + configDir + '. Use \'npm run set-dist <plugin-template>\' to set a distribution.');
  process.exit(1);
}

var JSONheader = ' { ' + "\n" + '  "//": "Changes to this file will be overwritten, modify it at plugin-template/ only.", ';
var configBlob = fs.readFileSync(configDir + '/config.json', 'utf8');
var config = JSON.parse(configBlob, 'utf8');

// Set internal config key values.
// If the plugin package includes an npm organization (i.e., starts with '@') then the plugin path is one level deeper than without.
config.rootRelative = {};
config.rootRelative.dev = '../';
config.rootRelative.rel = (config.packageName.indexOf('@') == 0 ? '../../../' : '../../');

console.log('Applying ' + config.nameCase + ' template');

// Generate image resources from sketch
console.log('Creating resources for ' + config.nameCase);
var execSync = require('child_process').execSync;
execSync('sh ./generate.sh ' + configDir, { cwd: '../util/resources', stdio: [0,1,2] });
console.log('Done creating resources');

// Replace key-value strings in template files and add installable plugins to package.json
console.log('Configuring plugin...');
Object.keys(templates).forEach(function(target) {
//  var targetDir = templates[f];

  var f = templates[target];
  var targetDir = target.replace(/[^\\\/]*$/, '');
  var targetFile = target.replace(targetDir, '');

  console.log(' #    ' + f + ' => ' + target);

  var content = fs.readFileSync(f, 'utf8');

  if (f.indexOf('.json') > 0) {
    content = content.replace('{', JSONheader);
  }

  Object.keys(config).forEach(function(k) {
    if (k.indexOf('_') == 0) {
      return;
    }

    var val = config[k];

    // Key values may be strings or objects. If an object then we look for 'dev' or 'rel' values
    // and apply based on the output filename.
    if (typeof val == 'object') {
      if (targetFile.endsWith('.release')) {
        val = val.rel;
      } else {
        val = val.dev;
      }
    }

    // Replace the key with a value.
    var r = new RegExp("\\*" + k.toUpperCase() + "\\*", "g");
    content = content.replace(r, val);
  });

  // Look for any leftover variables.
  var r = new RegExp("\\*[A-Z]{3,30}\\*", "g");
  var s = content.match(r);
  if (s) {
    console.log('UNKNOWN VARIABLE', s);
    process.exit(1);
  }

  // Write the result.
  if (!fs.existsSync('../' + targetDir)) {
    fs.mkdirSync('../' + targetDir);
  }
  fs.writeFileSync('../' + targetDir + targetFile, content, 'utf8');

});
console.log('Done configuring plugin');

// Create www directory
if (!fs.existsSync('../www')) {
  fs.mkdirSync('../www');
}

// Move assets
copyDir('../resources/' + configDir + '/img', '../plugin/assets/img');

// Done
console.log("apply.js finished. \n\n");
