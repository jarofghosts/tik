tik
===

[![Build Status](http://img.shields.io/travis/jarofghosts/tik.svg?style=flat)](https://travis-ci.org/jarofghosts/tik)
[![npm install](http://img.shields.io/npm/dm/tik.svg?style=flat)](https://www.npmjs.org/package/tik)

A command line key/value store based on
[LevelDB](https://code.google.com/p/leveldb/)

## install

`npm install -g tik`

## usage

`tik <key> [newvalue]`

retrieve value of `key` if no `newvalue` specified, or set the value of `key` to
`newvalue` if it is.

### options

+ `-d <dir>` or `--database <dir>` - Use LevelDB from `<dir>` instead of default.

## additional commands

### tik ls

list all keys and values

### tik lskeys

list all keys

### tik rm key [key2 ..]

remove `key` from db, accepts a list of keys separated by space

## license

MIT
