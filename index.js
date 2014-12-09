var path = require('path')
  , fs = require('fs')

var color = require('bash-color')
  , through = require('through')
  , levelup = require('levelup')

var dir = path.resolve(process.env.HOME || process.env.USERPROFILE, '.tik')

try {
  fs.mkdirSync(dir)
} catch (e) {
}

module.exports = createTik

function Tik(settings) {
  this.settings = settings || {}
  this.settings.db = this.settings.db || path.join(dir, 'db')
  this.db = levelup(path.normalize(this.settings.db))

  return this
}

Tik.prototype.listAll = function Tik$listAll() {
  var stream = through(format)

  this.db.createReadStream().pipe(stream)

  return stream

  function format(data) {
    if(!data.key || !data.value) return

    stream.queue(color.green(data.key + ':') + ' ' + data.value)
  }
}

Tik.prototype.keyStream = function Tik$keyStream() {
  return this.db.createKeyStream()
}

Tik.prototype.readStream = function Tik$readStream() {
  var stream = through(write, Function())
    , db = this.db

  return stream

  function write(buf) {
    var key_name = buf.toString()

    db.get(key_name, function(err, data) {
      if(err) stream.queue(null)
      if(data) stream.queue(data)
    })
  }
}

Tik.prototype.writeStream = function Tik$writeStream() {
  return this.db.createWriteStream({type: 'put'})
}

Tik.prototype.deleteStream = function Tik$deleteStream() {
  return this.db.createWriteStream({type: 'del'})
}

function createTik(settings) {
  return new Tik(settings)
}
