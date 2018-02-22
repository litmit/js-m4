'use strict';

var test = require('tape');
var M4 = require('..');
var fs = require('fs');
var path = require('path');

function streamEqual(t, lhs, rhs, cb) {
    var count = 0;
    var lbuf = '';
    lhs.on('readable', function () {
        lbuf += lhs.read();
    });
    var rbuf = '';
    rhs.on('readable', function () {
        rbuf += rhs.read();
    });
    var bothEnd = function () {
        ++count;
        if (count < 2) return;
        t.equal(lbuf, rbuf);
        return cb();
    };
    lhs.on('end', bothEnd);
    rhs.on('end', bothEnd);
}

var smPath = path.join(__dirname, 'samples');
var opt = {encoding: 'utf8', autoClose: true};

fs.readdir(smPath, function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
        if (path.extname(file) !== '.m4') return;
        file = path.basename(file, '.m4');
        var filePath = path.join(smPath, file);

        test('[m4] ' + file, function (t) { testM4(t,filePath); } );
    });
});


function testM4(t, filePath) 
{
   var options;
   var input = fs.createReadStream(filePath + '.m4', opt);
   var ref = fs.createReadStream(filePath, opt);

   var optionsFilePath = filePath + '.options.json';
   if ( fs.existsSync(optionsFilePath) )
   {
      var json = fs.readFileSync(optionsFilePath,opt);
      options = JSON.parse(json);
   }
   var output = input.pipe(new M4(options));

   streamEqual(t, output, ref, function () { t.end(); });
}
