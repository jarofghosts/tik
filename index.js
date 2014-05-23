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
  var tr = through(format)
    , db = this.db

  db.createReadStream().pipe(tr)

  return tr

  function format(data) {
    if(!data.key || !data.value) return
    tr.queue(color.green(data.key + ':') + ' ' + data.value)
  }
}

Tik.prototype.keyStream = function Tik$keyStream() {
  return this.db.createKeyStream()
}

Tik.prototype.readStream = function Tik$readStream() {
  var tr = through(write, noop)
    , db = this.db

  return tr

  function write(buf) {
    var key_name = buf.toString()

    db.get(key_name, function (err, data) {
      if(err) tr.queue(null)
      if(data) tr.queue(data)
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

function noop(){}
