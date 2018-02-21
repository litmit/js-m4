'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

// See: https://www.gnu.org/software/m4/manual/m4.html#Input-Control

//--------------------------------------------------------------------
function builtin_dnl()
{
   this._dnlMode = true;
}

//--------------------------------------------------------------------
function builtin_changequote(lhs, rhs)
{
   this.changeQuote(lhs, rhs)
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('dnl',         builtin_dnl),
   BuiltinDescr('changequote', builtin_changequote),
];
