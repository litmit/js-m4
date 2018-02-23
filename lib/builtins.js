'use strict';

//--------------------------------------------------------------------
// collection af all registered builtins
var builtins = Object.create(null);

//--------------------------------------------------------------------
/*
  Short guide to write builtins handlers:

  1) Builtins called as part of M4 engine (this = current M4 object)

  2) All arguments, if present, always strings

  3) A caller always pass all an encountered parameters to a handler 
     (regardless of number of function arguments declared in a handler)

  4) A builtin macro can be called without parameters at all or with any count of parameters. 
     This can be checked easily, if need, using expresions like typeof arg === 'undefined' or
     arguments.length = 0

     The example how a parameters passed to a handler (a handler declared without 'arrArgs' flag).

          M4                            Javascript  
     some_builtin        -->  some_builtin_handler()
     some_builtin()      -->  some_builtin_handler('')
     some_builtin(,)     -->  some_builtin_handler('','')
     some_builtin(a,b,c) -->  some_builtin_handler('a','b','c')

     If a handler declared with 'arrArgs' flag then it will called in other manner:
          M4                            Javascript  
     other_builtin        -->  other_builtin_handler([])
     other_builtin()      -->  other_builtin_handler([''])
     other_builtin(,)     -->  other_builtin_handler(['',''])
     other_builtin(a,b,c) -->  other_builtin_handler(['a','b','c'])
     In this case the handler should accept only one argument: an array that contain
     a list of all parameters passed.

  5) If a handler declared with 'inert' flag it always called only with one or more parameters.
     In this case the invocation without parameters processed at caller level.

  6) If a handler return nothing then the expansion of a builtin will be void.
     In other cases a handler may return something convertable to the string.

  7) A handler usually should not throw an exception. Use this.error() call to informs
     a M4 users about some unexpected behavior.
*/

//--------------------------------------------------------------------
function register(builtinsDescrArr) 
{
   var len = builtinsDescrArr.length;

   for (var i = 0; i < len; ++i)
   {
      var builtinDescr = builtinsDescrArr[i];
      builtins[builtinDescr.name] = builtinDescr;
   }
}

//--------------------------------------------------------------------
register(require('./builtins-impl/debugging'));
register(require('./builtins-impl/definitions'));
register(require('./builtins-impl/diversions'));
register(require('./builtins-impl/indirect'));
register(require('./builtins-impl/input'));

//--------------------------------------------------------------------
module.exports = builtins;
