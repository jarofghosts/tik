var memdown = require('memdown')
  , level = require('levelup')
  , test = require('tape')

var tik = require('../')

test('throws if no args provided', function(t) {
  t.plan(1)

  t.throws(function() {
    tik(level('literallywhatever', {db: memdown}))
  }, /arguments/)
})

test('puts values in DB', function(t) {
  t.plan(3)

  var testDb = level('uh-huh', {db: memdown})

  tik(testDb, ['set', 'herp', 'derp']).on('data', checkValue)

  function checkValue(data) {
    t.equal(data.toString(), 'derp\n')

    testDb.get('herp', function(err, value) {
      t.ok(!err)
      t.equal(value, 'derp')
    })
  }
})

test('puts values in DB', function(t) {
  t.plan(3)

  var testDb = level('uh-huh', {db: memdown})

  tik(testDb, ['herp', 'derp']).on('data', checkValue)

  function checkValue(data) {
    t.equal(data.toString(), 'derp\n')

    testDb.get('herp', function(err, value) {
      t.ok(!err)
      t.equal(value, 'derp')
    })
  }
})

test('gets values out of DB', function(t) {
  t.plan(1)

  var testDb = level('uh-huh', {db: memdown})

  testDb.put('derp', 'herp', function() {
    tik(testDb, ['get', 'derp']).on('data', checkValue)
  })

  function checkValue(data) {
    t.equal(data.toString(), 'herp\n')
  }
})

test('gets values out of DB', function(t) {
  t.plan(1)

  var testDb = level('uh-huh', {db: memdown})

  testDb.put('derp', 'herp', function() {
    tik(testDb, ['derp']).on('data', checkValue)
  })

  function checkValue(data) {
    t.equal(data.toString(), 'herp\n')
  }
})

test('removes keys from DB', function(t) {
  t.plan(3)

  var testDb = level('uh-huh', {db: memdown})

  testDb.put('derp', 'herp', function() {
    tik(testDb, ['rm', 'derp']).on('data', function(data) {
      t.equal(data.toString(), 'Removed 1 object\n')

      testDb.get('derp', function(err) {
        t.ok(err)
        t.equal(err.name, 'NotFoundError')
      })
    })
  })
})
