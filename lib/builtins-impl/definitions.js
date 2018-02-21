'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

// See: https://www.gnu.org/software/m4/manual/m4.html#Definitions

//--------------------------------------------------------------------
/*
Builtin: define (name, [expansion])

    Defines @name to expand to @expansion. If @expansion is not given, it is taken to be empty.

    The expansion of 'define' is void. The macro 'define' is recognized only with parameters. 
*/
function builtin_define(name, expansion)
{
   this.define(name, expansion)
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('define',    builtin_define, true, 1),
];
