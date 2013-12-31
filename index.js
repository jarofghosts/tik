#!/usr/bin/env node

var through = require('through'),
    color = require('bash-color'),
    levelup = require('levelup'),
    path = require('path'),
    fs = require('fs'),
    dir = path.resolve(process.env.HOME || process.env.USERPROFILE, '.tik')

try {
  fs.mkdirSync(dir)
} catch (e) {
}

module.exports.Tik = Tik
module.exports.createTik = createTik

function Tik(settings) {
  
  if (!(this instanceof Tik)) return new Tik(settings)

  this.settings = settings || {}
  this.settings.db = this.settings.db || path.join(dir, 'db')
  this.db = levelup(path.normalize(this.settings.db))

  return this
}

Tik.prototype.listAll = function Tik$listAll() {
  var tr = through(),
      db = this.db

  process.nextTick(go)
  return tr

  function go() {
    db.createReadStream()
      .on('data', function ondata(data) {
        if (!data.key || !data.value) return
        tr.queue([color.green(data.key + ':'), data.value].join(' '))
      })
      .on('end', closeStream)
      .on('close', closeStream)
  }

  function closeStream() {
    tr.queue(null)
  }
}

Tik.prototype.keyStream = function Tik$keyStream() {
  return this.db.createKeyStream()
}

Tik.prototype.readStream = function Tik$readStream() {
  var tr = through(write, function () {}),
      db = this.db

  return tr

  function write(buf) {
    var keyName = buf.toString()
    db.get(keyName, function (err, data) {
      if (err) tr.queue(null)
      if (data) tr.queue(data)
    })
  }
}

Tik.prototype.writeStream = function Tik$writeStream() {
  return this.db.createWriteStream({ type: 'put' })
}

Tik.prototype.deleteStream = function Tik$deleteStream() {
  return this.db.createWriteStream({ type: 'del' })
}

function createTik(settings) {
  return new Tik(settings)
}
