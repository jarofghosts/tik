var assert = require('assert'),
    Tik = require('../').Tik,
    tik = new Tik({ db: __dirname + '/testdb' }),
    stream = require('stream'),
    rs = new stream.Readable(),
    ws = new stream.Writable(),
    tws = tik.writeStream(),
    trs = tik.readStream(),
    tds = tik.deleteStream(),
    called = 0;

tws.write({ key: 'a', value: 1 });
tws.write({ key: 'b', value: 2 });
tws.write({ key: 'c', value: 3 });
tws.end();

var bad = setTimeout(function () { assert.ok(false); }, 1000);

rs._read = function () {
  rs.push('a');
  rs.push('b');
  rs.push('c');
  rs.push(null);
}
ws._write = function (data, enc, next) {
  data = data.toString();
  called++;
  assert.ok(data == 1 || data == 2 || data == 3);
  if (called == 3) this.end();
  next();
};

ws.on('finish', function () {
  clearTimeout(bad);
  testKeyStream();
});

rs.pipe(trs).pipe(ws);

function testKeyStream() {
  var ws2 = new stream.Writable();
  bad = setTimeout(function () { assert.ok(false); }, 1000);

  ws2._write = function (data, enc, next) {
   data = data.toString();
    assert.ok(data == 'a' || data == 'b' || data == 'c');
    next();
  }

  tik.keyStream().pipe(ws2);
  ws2.on('finish', function () {
    clearTimeout(bad);
    testDeleteStream();
  });
}
function testDeleteStream() {
  tds.on('close', checkDeleted);
  tds.write({ key: 'a' });
  tds.write({ key: 'b' });
  tds.write({ key: 'c' });
  tds.end();
}
function checkDeleted() {
  var ws3 = new stream.Writable();
  ws3._write = function (data, enc, next) {
    assert.ok(data == null);
    this.end();
  };
  trs.pipe(ws3);
}
