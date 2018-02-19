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
   return ( o !== null ) &&
          ( typeof o === 'string' || (typeof o === 'object' && o.constructor === String) );
}
exports.isString = isString;

//--------------------------------------------------------------------
// return true if @o is a primitive boolean or a Boolean object
function isBoolean(o) 
{
   return ( o !== null ) &&
          ( typeof o === 'boolean' || (typeof o === 'object' && o.constructor === Boolean) );
}
exports.isBoolean = isBoolean;

//--------------------------------------------------------------------
function isObject(o)
{
   return ( o !== null && typeof(o) === "object" );
}
exports.isObject = isObject;

//--------------------------------------------------------------------
function isStrValid(s)
{
   return ( isString(s) && s.length > 0 );
}
exports.isStrValid = isStrValid;
