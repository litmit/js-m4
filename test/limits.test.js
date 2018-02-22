'use strict';

var test = require('tape');
var M4 = require('..');
var M4Error = require('../lib/m4-error');
//var fs = require('fs');
//var path = require('path');


test('[m4] nesting limit', function (t) {
    t.plan(1);
    var output = new M4({nestingLimit: 2});
    output.on('error', function (err) {
        t.equal(err.code, M4Error.Code.E_NEST_LIMIT);
    });
    output.write('define(foo, define(bar, define(glo, 0)))');
    output.end();
});
