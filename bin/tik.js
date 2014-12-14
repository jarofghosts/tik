#!/usr/bin/env node
var path = require('path')
  , fs = require('fs')

var parseArgs = require('minimist')
  , color = require('bash-color')
  , level = require('levelup')

var package = require('../package.json')
  , tik = require('../')

var argv = parseArgs(process.argv.slice(2))

if(argv.help || !argv._.length) return help()
if(argv.version) return version()

var home = path.normalize(process.env.HOME || process.env.USERPROFILE)
var tikDir = path.join(home, '.tik')

try {
  fs.mkdirSync(tikDir)
} catch(e) {
}

tik(level(argv.database || path.join(tikDir, 'db')), argv._)
  .pipe(process.stdout)

function version() {
  console.log(color.yellow('tik version ' + package.version))
}

function help() {
  version()

  fs.createReadStream(path.join(__dirname, '..', 'help.txt'))
    .pipe(process.stderr)
}
