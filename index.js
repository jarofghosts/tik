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
    isCli = (require.main === module);

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

module.exports.Tik = Tik;

function Tik(settings) {

  this.settings = settings || {};
  this.settings.db = this.settings.db || dir + '/db';
  this.db = levelup(this.settings.db);

  return this;
}

Tik.prototype.listAll = function () {
  var tr = through(),
      db = this.db;

  process.nextTick(go);
  return tr;

  function go() {
    db.createReadStream()
      .on('data', function (data) {
        if (!data.key || !data.value) return;
        tr.queue([color.green(data.key + ':'), data.value].join(' '));
      })
      .on('end', closeStream)
      .on('close', closeStream);
  }

  function closeStream() { tr.queue(null); }
};

Tik.prototype.keyStream = function () {
  return this.db.createKeyStream();
};

Tik.prototype.readStream = function () {
  var tr = through(write, function () {}),
      db = this.db;

  return tr;

  function write(buf) {
    var keyName = buf.toString();
    db.get(keyName, function (err, data) {
      if (err) tr.queue(undefined);
      if (data) tr.queue(data);
    });
  }
};

Tik.prototype.writeStream = function () {
  return this.db.createWriteStream({ type: 'put' });
};

Tik.prototype.deleteStream = function () {
  return this.db.createWriteStream({ type: 'del' });
};

if (isCli) {
  c
    .version('0.0.4');
  c
    .command('rm <key> [key2 ..]')
    .description('remove key from database')
    .action(function () {
      var delStream = new Tik().deleteStream(),
          args = Array.prototype.slice.call(arguments, [0, -1]),
          i = 0,
          l = args.length;

      for (; i < l; ++i) {
        delStream.write({ key: args[i] });
      }
      delStream.end();
    });
  c
    .command('ls')
    .description('list all items')
    .action(function () {
      new Tik().listAll().pipe(appendage({ after: '\n' })).pipe(process.stdout);
     });
  c
    .command('lskeys')
    .description('list all keys')
    .action(function () {
      new Tik().keyStream().pipe(appendage({ after: '\n' })).pipe(process.stdout);
    });
  c
    .command('*')
    .action(function (stuff) {

      if (c.args.length === 2) {

        var read = new Tik().readStream(),
            rs = stream.Readable();

        rs.push(c.args[0]);
        rs.push(null);

        rs.pipe(read).pipe(appendage({ after: '\n' })).pipe(process.stdout);

      } else {

        c.args.pop();

        var keyName = c.args.shift(),
            keyValue = c.args.join(' '),
            write = new Tik().writeStream();

        write.write({ key: keyName, value: keyValue });
        write.end();

      }

    });
  c.parse(process.argv);
  if (!c.args.length) c.help();

}

