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

Tik.prototype.listKeys = function () {
  return this.db.createKeyStream();
};

Tik.prototype.remove = function (keyName) {
  return this.db.del(keyName);
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
    .action(function (key) {
      if (!key) c.help();
      
    });
  c
    .command('ls')
    .description('list all items')
    .action(function () {
     });
  c.parse(process.argv);

  if (!c.args.length) c.help();
  if (c.args.length === 1) return getKey(c.args[0]);
  var keyName = c.args.shift(),
      keyValue = c.args.join(' ');
  return setKey(keyName, keyValue);

}

