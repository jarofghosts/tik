var Readable = require('stream').Readable

var appendage = require('appendage')
  , color = require('bash-color')
  , through = require('through')

module.exports = createTik

function Tik(db, args) {
  if(!args) throw new Error('Must provide arguments to parse')

  Readable.call(this)

  this.db = db

  this.parse(args)
}

Tik.prototype = Object.create(Readable.prototype)

Tik.prototype._read = Function()

Tik.prototype.parse = function parse(args) {
  var self = this

  var router = {
      rm: self.remove
    , ls: self.list
    , set: self.set
    , get: self.get
  }

  var route = router[args[0]]

  if(!route) return interpretArgs.apply(null, args)

  route.apply(self, args.slice(1))

  function interpretArgs(key, value) {
    if(!value) return self.get(key)

    self.set(key, value)
  }
}

Tik.prototype.remove = function remove() {
  var keys = [].slice.call(arguments)
    , self = this

  self.db.batch(keys.map(toDeletes), outputResult)

  function outputResult(err) {
    if(err) return self.emit('error', err)

    self.push('Removed ' + keys.length + ' object' +
      (keys.length === 1 ? '' : 's') + '\n')
  }
}

function toDeletes(x) {
  return {type: 'del', key: x}
}

Tik.prototype.get = function get(key) {
  var self = this

  this.db.get(key, function(err, value) {
    if(err) {
      if(err.name === 'NotFoundError') {
        return self.push(color.red('No such key "' + key + '"\n'))
      }

      return self.emit('error', err)
    }

    self.push(value + '\n')
  })
}

Tik.prototype.set = function set(key, value) {
  this.db.put(key, value, this.get.bind(this, key))
}

Tik.prototype.list = function list() {
  var formatStream = through(format)

  this.db.createReadStream()
    .pipe(formatStream)
    .pipe(appendage({after: '\n'}))
    .on('data', this.push.bind(this))

  function format(obj) {
    if(!obj.key || !obj.value) return

    formatStream.queue(color.green(obj.key + ':') + ' ' + obj.value)
  }
}

function createTik(db, args) {
  return new Tik(db, args)
}
