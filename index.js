#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    color = require('bash-color'),
    levelup = require('levelup'),
    appendage = require('appendage'),
    path = require('path'),
    fs = require('fs'),
    stream = require('stream'),
    dir = path.resolve(process.env.HOME || process.env.USERPROFILE, '.tik'),
    isCli = (require.main === module)

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

Tik.prototype.listAll = function () {
  var tr = through(),
      db = this.db

  process.nextTick(go)
  return tr

  function go() {
    db.createReadStream()
      .on('data', function (data) {
        if (!data.key || !data.value) return
        tr.queue([color.green(data.key + ':'), data.value].join(' '))
      })
      .on('end', closeStream)
      .on('close', closeStream)
  }

  function closeStream() { tr.queue(null) }
};

Tik.prototype.keyStream = function () {
  return this.db.createKeyStream()
}

Tik.prototype.readStream = function () {
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

Tik.prototype.writeStream = function () {
  return this.db.createWriteStream({ type: 'put' })
}

Tik.prototype.deleteStream = function () {
  return this.db.createWriteStream({ type: 'del' })
}

function createTik(settings) {
  return new Tik(settings)
}

if (isCli) {
  c
    .version('0.0.7')
    .option('-d, --database <databasedir>', 'use specific leveldb')
  c
    .command('rm <key> [key2 ..]')
    .description('remove key from database')
    .action(function () {
      var delStream = new Tik({ db: c.database }).deleteStream(),
          args = Array.prototype.slice.call(arguments, 0, -2),
          i = 0,
          l = args.length
      for (; i < l; ++i) {
        delStream.write({ key: args[i] })
      }
      delStream.end()
    })
  c
    .command('ls')
    .description('list all items')
    .action(function () {
      new Tik({ db: c.database }).listAll().pipe(appendage({ after: '\n' })).pipe(process.stdout)
     })
  c
    .command('lskeys')
    .description('list all keys')
    .action(function () {
      new Tik({ db: c.database }).keyStream().pipe(appendage({ after: '\n' })).pipe(process.stdout)
    })
  c
    .command('*')
    .action(function (stuff) {

      if (c.args.length === 2) {

        var read = new Tik({ db: c.database }).readStream(),
            rs = stream.Readable()

        rs.push(c.args[0])
        rs.push(null)

        rs.pipe(read).pipe(appendage({ after: '\n' })).pipe(process.stdout)

      } else {

        c.args.pop()

        var keyName = c.args.shift(),
            keyValue = c.args.join(' '),
            write = new Tik({ db: c.database }).writeStream()

        write.write({ key: keyName, value: keyValue })
        write.end()

      }

    })
  c.parse(process.argv)
  if (!c.args.length) c.help()

}

