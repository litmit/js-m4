'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

//--------------------------------------------------------------------
/*
Builtin: indir(name, [args…])

   Results in a call to the macro @name, which is passed the rest of the arguments @args. 
   If @name is not defined, an error message is printed, and the expansion is void.

   The macro 'indir' is recognized only with parameters. 
*/
function builtin_indir(args)
{
   var name = args[0];
   var macro = this._macros[name];

   if ( !macro )
   {
      this.error('M4_BAD_MACRO', name);
   }
   else
   {
      return this._callMacro(macro, args);
   }
}

//--------------------------------------------------------------------
/*
Builtin: builtin(name, [args…])

   Results in a call to the builtin @name, which is passed the rest of the arguments @args. 
   If @name does not name a builtin, an error message is printed, and the expansion is void.

   The macro 'builtin' is recognized only with parameters. 

   The @name argument only matches the original name of the builtin, 
   even when the 'prefix_builtins' option is in effect. 
   This is different from 'indir', which only tracks current macro names. 
*/
function builtin_builtin(args)
{
   var name = args.shift();
   var builtinDescr = this._builtins[name];

   if ( !builtinDescr )
   {
      this.error('M4_BAD_BUILTIN', name);
   }
   else
   {
      if ( args.length < builtinDescr.needArgs )
      {
         this.error('M4_TOO_FEW_ARGS', name, builtinDescr.needArgs);
      }
      else
      {
         return builtinDescr._invokeHelper(this, name, args);
      }
   }
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('indir',   builtin_indir,   true, 1, true, true),
   BuiltinDescr('builtin', builtin_builtin, true, 1, true, true),
];
