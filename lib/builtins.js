'use strict';

//--------------------------------------------------------------------
// collection af all registered builtins
var builtins = Object.create(null);

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
