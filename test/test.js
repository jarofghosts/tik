var assert = require('assert'),
    Tik = require('../').Tik,
    tik = new Tik({ db: __dirname + '/testdb' }),
    stream = require('stream'),
    rs = stream.Readable(),
    ws = stream.Writable(),
    tws = tik.writeStream(),
    trs = tik.readStream(),
    tds = tik.deleteStream();

tws.write({ key: 'a', value: 1 });
tws.write({ key: 'b', value: 2 });
tws.write({ key: 'c', value: 3 });

var bad = setTimeout(function () { assert.ok(false); }, 1000),
    entry = 1;

rs._read = function () {
  rs.push('a');
  rs.push('b');
  rs.push('c');
  rs.push(null);
};

ws._write = function (data, enc, next) {
  if (entry == 3) clearTimeout(bad);
  data = data.toString();
  assert.ok(data == 1 || data == 2 || data == 3);
  entry++;
  if (entry == 4) testKeyStream();
  next();
};

rs.pipe(trs).pipe(ws);
function testKeyStream() {
  var ws2 = stream.Writable();
  bad = setTimeout(function () { assert.ok(false); }, 1000);

  ws2._write = function (data, enc, next) {
    data = data.toString();
    if (entry == 2) clearTimeout(bad);
    assert.ok(data == 'a' || data == 'b' || data == 'c');
    entry--;
    console.log(data)
    next();
  }

  tik.keyStream().pipe(ws2);
}
