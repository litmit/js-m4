'use strict';

var ut = require('../misc.js');
var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

// See: https://www.gnu.org/software/m4/manual/m4.html#Debugging

//--------------------------------------------------------------------
/*
Builtin: debugmode([flags])

    If no argument is present, all debugging flags are cleared, 
    and with an empty argument the flags are reset to the default of ‘aeq’.

    The expansion of debugmode is void. 
*/
function builtin_debugmode(flags)
{
   if ( ut.isNullOrUndefined(flags) )
   {
      this.setDebugOptions(false);
   }
   else
   {
      if ( flags === '' )
      {
         flags = 'aeq'
      }

      try
      {
         this.setDebugOptions(flags);
      }
      catch(err)
      {
         if ( err.hasOwnProperty('bad_flags') )
         {
            this.error('M4_BAD_DEBUG_FLAGS', err.bad_flags);
         }
         else
         {
            throw err;
         }
      }
   }
}

//--------------------------------------------------------------------
/*
Builtin: debugfile ([file])

    Sends all further debug and trace output to @file, opened in append mode. 
    If @file is the empty string, debug and trace output are discarded. 
    If debugfile is called without any arguments, debug and trace output are sent to standard error. This does not affect warnings, error messages, or errprint output, which are always sent to standard error
    If @file cannot be opened, the current debug file is unchanged, and an error is issued.

    The expansion of debugfile is void. 

*/
function builtin_debugfile(file)
{
   this.setDebugFile(file)
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('debugmode', builtin_debugmode),
   BuiltinDescr('debugfile', builtin_debugfile),
];
