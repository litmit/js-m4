'use strict';

var M4Error = require('./m4-error');
var Code = M4Error.Code;
var ut = require('./misc.js');

//--------------------------------------------------------------------
// inert = true if macro must be recognized only with parameters
// needArgs - number of arguments that must present, 
//         if less then call of macro will ignored and cause void expansion
// dynArgs - true if macro can have variable number of arguments
function BuiltinDef(fn, inert, needArgs, dynArgs) 
{
   if ( !(this instanceof BuiltinDef) )
   {
      return new BuiltinDef(fn, inert, needArgs, dynArgs);
   }

   if ( typeof inert === 'undefined' ) { inert = false; }
   if ( typeof needArgs === 'undefined' ) { needArgs = 0; }
   if ( typeof dynArgs === 'undefined' ) { dynArgs = false; }

   this.fn = fn;
   this.inert = inert;
   this.needArgs = needArgs;
   this.dynArgs = dynArgs;
}

//--------------------------------------------------------------------
/*
Builtin: debugmode ([flags])

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
         var warn = new M4Error(Code.W_BAD_DEBUG_FLAGS, err.message);
         this.emit('warning', warn);
      }
   }
}

//--------------------------------------------------------------------
/*
Builtin: builtin (name, [args…])

    Results in a call to the builtin name, which is passed the rest of the arguments args. 
    If name does not name a builtin, an error message is printed, and the expansion is void.

    The macro builtin is recognized only with parameters. 
*/
function builtin_builtin(name/*,args*/)
{
   if ( !builtins.hasOwnProperty(name) )
   {
      var warn = new M4Error(Code.W_BAD_BUILTIN, name);
      this.emit('warning', warn);
   }
   else
   {
      var builtinDef = builtins[name];
      var args = Array.prototype.slice.call(arguments);
      args.shift();

      if ( args.length < builtinDef.needArgs )
      {
         var warn = new M4Error(Code.W_TOO_FEW_ARGS, name, builtinDef.needArgs);
         this.emit('warning', warn);
      }
      else
      {
         if ( !builtinDef.dynArgs && args.length > builtinDef.fn.length ) 
         {
            var err = new M4Error(Code.W_TOO_MANY_ARGS, macroName);
            this.emit('warning', err);
         }

         var res = builtinDef.fn.apply(this, args);

         if ( typeof res === 'undefined' )
         {
            return '';
         }
         return String(res);
      }
   }
}



//--------------------------------------------------------------------
var builtins =
{
   'builtin':   BuiltinDef(builtin_builtin, true, 1, true),
   'debugmode': BuiltinDef(builtin_debugmode)
};

module.exports = builtins;
