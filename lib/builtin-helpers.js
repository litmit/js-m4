'use strict';

//--------------------------------------------------------------------
// @inert = true if a builtin should be recognized only with parameters
// @needArgs - number of arguments that must present, 
//         if less then the indirect call of a builtin will be ignored and 
//         cause a void expansion
// @dynArgs - true if a builtin can have variable number of arguments
// @arrArgs - true if a builtin accept all passed arguments as one array argument.
//           Using @arrArgs implies @dynArgs to be true.
function BuiltinDescr(name, fn, inert, needArgs, dynArgs, arrArgs) 
{
   if ( !(this instanceof BuiltinDescr) )
   {
      return new BuiltinDescr(name, fn, inert, needArgs, dynArgs, arrArgs);
   }

   inert = !!inert;
   if ( typeof needArgs === 'undefined' ) { needArgs = 0; }
   dynArgs = !!dynArgs;
   arrArgs = !!arrArgs;

   if ( arrArgs ) { dynArgs = true; }

   this.fn = fn;
   this.name = name;
   this.inert = inert;
   this.needArgs = needArgs;
   this.dynArgs = dynArgs;
   this.arrArgs = arrArgs;
}

//--------------------------------------------------------------------
function _invokeHelper(m4, name, args)
{
   var builtinDescr = this
   var fn = builtinDescr.fn;

   if ( !builtinDescr.dynArgs && args.length > fn.length ) 
   {
      m4.error('M4_TOO_MANY_ARGS', name, fn.length);
   }

   return fn[(builtinDescr.arrArgs ? 'call':'apply')](m4, args);
};
BuiltinDescr.prototype._invokeHelper = _invokeHelper;

//--------------------------------------------------------------------
// Invoke a builtin.
// @args - arguments of a macro call. 
//   args[0] is a macro name. Note that this.name and args[0] can be
// different due using the 'prefix_builtins' option.
// Always returns a string that is the result of builtin invocation.
function invoke(m4, args)
{
   var macroName = args.shift();

   if ( this.inert && args.length === 0 )
   {
      return m4._quoted(macroName);
   }

   var res = this._invokeHelper(m4, macroName, args);

   if ( typeof res === 'undefined' )
   {
      return '';
   }
   return String(res);
};
BuiltinDescr.prototype.invoke = invoke;


//--------------------------------------------------------------------
exports.BuiltinDescr = BuiltinDescr;
