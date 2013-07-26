#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    color = require('bash-color'),
    levelup = require('levelup'),
    isCli = (require.main === module);

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

