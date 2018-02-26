'use strict';

//--------------------------------------------------------------------
function isNullOrUndefined(arg)
{
   return ( arg === null || typeof arg === 'undefined' );
}
exports.isNullOrUndefined = isNullOrUndefined;

//--------------------------------------------------------------------
// return true if @o is a primitive string value or a String object
function isString(o) 
{
   return ( typeof o === 'string' ) || 
          ( ( o !== null && typeof o === 'object' && o.constructor === String ) );
}
exports.isString = isString;

//--------------------------------------------------------------------
// return true if @o is a primitive number value or a Number object
function isNumber(o) 
{
   return ( typeof o === 'number' ) ||
          ( ( o !== null && typeof o === 'object' && o.constructor === Number) );
}
exports.isNumber = isNumber;

//--------------------------------------------------------------------
// return true if @o is a primitive boolean or a Boolean object
function isBoolean(o) 
{
   return ( typeof o === 'boolean' ) ||
          ( ( o !== null && typeof o === 'object' && o.constructor === Boolean ) );
}
exports.isBoolean = isBoolean;

//--------------------------------------------------------------------
function isObject(o)
{
   return ( o !== null && typeof o === "object" );
}
exports.isObject = isObject;

//--------------------------------------------------------------------
function isSymbol(o)
{
   return typeof o === "symbol";
}
exports.isSymbol = isSymbol;


//--------------------------------------------------------------------
function isStrValid(s)
{
   return ( isString(s) && s.length > 0 );
}
exports.isStrValid = isStrValid;
