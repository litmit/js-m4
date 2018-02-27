'use strict';

var streams = require('memory-streams');
var test = require('tape');
var M4 = require('..');


function check_info(t, m4, divnum, diverted, discarded)
{
   var info = m4.getDiversionInfo();

   t.equal(info.divnum, divnum);

   t.equal(typeof info.diverted, 'boolean');
   t.equal(info.diverted, diverted);

   t.equal(typeof info.discarded, 'boolean');
   t.equal(info.discarded, discarded);

   var diversion = m4.getDiversion(info.divnum);

   if ( info.diverted && !info.discarded )
   {
      t.ok(diversion);
   }
   else
   {
      t.notOk(diversion);
   }
}

test('[m4-api] diversion', function (t) {
   t.plan(117);
   var m4 = new M4();

   check_info(t, m4, '0', false, false);

   m4.divert();
   check_info(t, m4, '0', false, false);

   m4.divert(0);
   check_info(t, m4, '0', false, false);

   m4.divert(1000);
   check_info(t, m4, '1000', true, false);

   m4.divert(-1000);
   check_info(t, m4, '-1000', true, true);

   m4.divert(null);
   check_info(t, m4, '0', false, false);

   m4.divert(Number.MAX_SAFE_INTEGER);
   check_info(t, m4, String(Number.MAX_SAFE_INTEGER), true, false);

   t.throws(function () { m4.divert(Number.MAX_SAFE_INTEGER+1) },TypeError);
   check_info(t, m4, String(Number.MAX_SAFE_INTEGER), true, false);

   m4.divert(Number.MIN_SAFE_INTEGER);
   check_info(t, m4, String(Number.MIN_SAFE_INTEGER), true, true);

   t.throws(function () { m4.divert(Number.MIN_SAFE_INTEGER-1) },TypeError);
   check_info(t, m4, String(Number.MIN_SAFE_INTEGER), true, true);

   t.comment('check arbitrary number diversions')

   var bn = '1234567890';
   bn = bn + bn + bn + bn + bn;
   t.notOk(Number.isSafeInteger(bn));

   m4.divert(bn);
   check_info(t, m4, bn, true, false);

   var neg_bn = '-' + bn;
   t.notOk(Number.isSafeInteger(neg_bn));

   m4.divert(neg_bn);
   check_info(t, m4, neg_bn, true, true);

   var pos_bn = '+' + bn;
   t.notOk(Number.isSafeInteger(pos_bn));

   m4.divert(pos_bn);
   check_info(t, m4, bn, true, false);

   t.comment('check arbitrary string diversions')
   m4.divert('');
   check_info(t, m4, '', true, false);

   m4.divert('-');
   check_info(t, m4, '-', true, false);

   m4.divert('+');
   check_info(t, m4, '+', true, false);

   m4.divert('prototype');
   check_info(t, m4, 'prototype', true, false);

   t.comment('check symbol diversions')
   var sym = Symbol();
   m4.divert(sym);
   check_info(t, m4, sym, true, false);

   t.comment('other native primitives should throw')

   t.throws(function () { m4.divert([]) },TypeError);
   t.throws(function () { m4.divert({}) },TypeError);
   t.throws(function () { m4.divert(function() {}) },TypeError);
   t.throws(function () { m4.divert(true) },TypeError);
});
