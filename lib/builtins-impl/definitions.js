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
/*
Builtin: undefine (name...)

    For each argument, remove the macro @name. 
    The macro names must necessarily be quoted, since they will be expanded otherwise.

    The expansion of 'undefine' is void. The macro 'undefine' is recognized only with parameters. 

    It is not an error for @name to have no macro definition. In that case, 'undefine' does nothing.
*/
function builtin_undefine(args)
{
   var len = args.length;

   for (var i = 0; i < len; ++i)
   {
      var name = args[i];
      this.undefine(name);
   }
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('define',    builtin_define,   true, 1),
   BuiltinDescr('undefine',  builtin_undefine, true, 1, true, true),
];
