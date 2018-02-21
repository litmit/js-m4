'use strict';

//--------------------------------------------------------------------
// inert = true if a builtin should be recognized only with parameters
// needArgs - number of arguments that must present, 
//         if less then the indirect call of a builtin will be ignored and 
//         cause a void expansion
// dynArgs - true if macro can have variable number of arguments
function BuiltinDescr(name, fn, inert, needArgs, dynArgs) 
{
   if ( !(this instanceof BuiltinDescr) )
   {
      return new BuiltinDescr(name, fn, inert, needArgs, dynArgs);
   }

   if ( typeof inert === 'undefined' ) { inert = false; }
   if ( typeof needArgs === 'undefined' ) { needArgs = 0; }
   if ( typeof dynArgs === 'undefined' ) { dynArgs = false; }

   this.fn = fn;
   this.name = name;
   this.inert = inert;
   this.needArgs = needArgs;
   this.dynArgs = dynArgs;
}

exports.BuiltinDescr = BuiltinDescr;
