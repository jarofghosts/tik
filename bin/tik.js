#!/usr/bin/env node

var c = require('commander'),
    package = require('../package.json'),
    appendage = require('appendage'),
    stream = require('stream'),
    Tik = require('../').Tik

c
  .version(package.version)
  .option('-d, --database <databasedir>', 'use specific leveldb')
c
  .command('rm <key> [key2 ..]')
  .description('remove key from database')
  .action(function Tik$rm() {
    var delStream = new Tik({ db: c.database }).deleteStream(),
        args = [].slice.call(arguments, 0, -2),
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
  .action(function Tik$ls() {
    new Tik({ db: c.database }).listAll()
      .pipe(appendage({ after: '\n' }))
      .pipe(process.stdout)
   })
c
  .command('lskeys')
  .description('list all keys')
  .action(function Tik$lskeys() {
    new Tik({ db: c.database }).keyStream()
      .pipe(appendage({ after: '\n' }))
      .pipe(process.stdout)
  })
c
  .command('*')
  .action(function Tik$default(stuff) {
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
