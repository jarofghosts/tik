#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    color = require('bash-color'),
    levelup = require('levelup'),
    path = require('path'),
    fs = require('fs'),
    dir = path.resolve(process.env.HOME || process.env.USERPROFILE, '.tik'),
    isCli = (require.main === module);

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

function Tik(settings) {

  this.settings = settings || {};
  this.settings.db = this.settings.db || dir + '/db';
  this.db = levelup(this.settings.db);

  return this;
}

Tik.prototype.listAll = function () {
  var tr = through();

  process.nextTick(go);
  return tr;

  function go() {
    this.db.createReadStream()
      .on('data', function (data) {
        if (value) this.queue([color.green(data.key + ':'), data.value].join(' '));
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
  var tr = through(write),
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
    .version('0.0.0');
  c
    .command('rm <key>')
    .description('remove key from database')
    .action(function (keyName) {
      if (!keyName) c.help();
      var delStream = new Tik().deleteStream();
      delStream.write({ key: keyName });
      delStream.end();
    });
  c
    .command('ls')
    .description('list all items')
    .action(function () {
      new Tik().listAll().pipe(process.stdout);
     });
  c
    .command('lskeys')
    .description('list all keys')
    .action(function () {
      new Tik().keyStream().pipe(process.stdout);
    });

  c.parse(process.argv);

  if (!c.args.length) c.help();
  if (c.args.length === 1) {

    var read = new Tik().readStream();

    read.pipe(process.stdout);

    read.push(c.args[0]);
    read.push(null);

  } else {

    var keyName = c.args.shift(),
        keyValue = c.args.join(' '),
        write = new Tik().writeStream();

    write.write({ key: keyName, value: keyValue });
    write.end();

}

