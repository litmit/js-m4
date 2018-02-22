'use strict';

var streams = require('memory-streams');
var test = require('tape');
var M4 = require('..');


function check_stream(t, m4, fn, expected)
{
   var writer = new streams.WritableStream();

   writer.on('finish', function () {
      var res = writer.toString();
      t.equal(res, expected);
   });

   m4.pipe(writer);
   fn();
   writer.end();
}

test('[m4-api] define', function (t) {
   t.plan(19);
   var m4 = new M4();

   // macro without definition
   m4.define('userMacro1');

   check_stream(t, m4, function () 
      {
         m4.write('userMacro1\n');
         m4.write('userMacro1()\n');
         m4.write('userMacro1(foo)\n');
         m4.write('userMacro1(foo,bar)\n');
      }, '\n\n\n\n');

   // empty macro
   m4.define('userMacro2','');

   check_stream(t, m4, function () 
      {
         m4.write('userMacro2\n');
         m4.write('userMacro2()\n');
         m4.write('userMacro2(foo)\n');
         m4.write('userMacro2(foo,bar)\n');
      }, '\n\n\n\n');

   // macro plain string
   m4.define('userMacro3','baz');

   check_stream(t, m4, function () 
      {
         m4.write('userMacro3\n');
         m4.write('userMacro3()\n');
         m4.write('userMacro3(foo)\n');
         m4.write('userMacro3(foo,bar)\n');
      }, 'baz\nbaz\nbaz\nbaz\n');

   // macro with parameters
   m4.define('userMacro4',"`$0'($*)$#");

   check_stream(t, m4, function () 
      {
         m4.write('userMacro4\n');
         m4.write('userMacro4()\n');
         m4.write('userMacro4(foo)\n');
         m4.write('userMacro4(foo,bar)\n');
      },          'userMacro4()0\n' +
                  'userMacro4()1\n' +
                  'userMacro4(foo)1\n' +
                  'userMacro4(foo,bar)2\n'
      );

   // user function with empty expansion
   m4.define('userFn1', function userFn1() {
      t.equal(arguments.length, 2);
      t.equal(arguments[0], m4);
      t.equal(arguments[1], 'userFn1');
      return '';
   });

   check_stream(t, m4, function () 
      {
         m4.write('userFn1\n');
      }, '\n');

   m4.define('userFn2', function userFn2() {
      t.equal(arguments.length, 3);
      t.equal(arguments[0], m4);
      t.equal(arguments[1], 'userFn2');
      t.equal(arguments[2], '');
      return '';
   });

   check_stream(t, m4, function () 
      {
         m4.write('userFn2()\n');
      }, '\n');

   // user function with non empty expansion
   m4.define('userFn3', function userFn3(m4arg,name,s1,s2) {
      t.equal(arguments.length, 4);
      t.equal(m4arg, m4);
      t.equal(name, 'userFn3');
      t.equal(s1, 'foo');
      t.equal(s2, 'bar');
      return m4arg.quoted(name) + ' result is:' + s2 + s1;
   });

   check_stream(t, m4, function () 
      {
         m4.write('userFn3(foo,bar)\n');
      }, 'userFn3 result is:barfoo\n');

   m4.end();
});
