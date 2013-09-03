tik
====

[![Build Status](https://travis-ci.org/jarofghosts/tik.png?branch=master)](https://travis-ci.org/jarofghosts/tik)

A command line key/value store based on [LevelDB](https://code.google.com/p/leveldb/)

## install

`npm install -g tik`

## usage

`tik <key> [newvalue]`

retrieve `key` value if no `newvalue` specified, or set the value of `key` to `newvalue` if it is.

## options

+ `-d <dir>` or `--database <dir>` - Use LevelDB from `<dir>` instead of default.

## additional commands

#### tik ls

list all keys and values

#### tik lskeys

list all keys

#### tik rm key [key2 ..]

remove `key` from db, accepts a list of keys separated by space

## as a module

im not sure why you would want to, but it's possible..

```js
var Tik = require('tik').Tik,
    tik = new Tik();

tik.listAll() // read stream of all key: value

tik.keyStream() // read stream of all keys

tik.readStream() // feed this stream key names and it will pump out values

tik.writeStream() // feed it objects like { key: keyName, value: valueName }

tik.deleteStream() // throw a key name in here and watch it disappear
```

## license

MIT
