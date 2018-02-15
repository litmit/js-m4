"use strict";

//////////////////////////////////////////////////////////////////////
// return true if @o is a primitive string value or a String object
function isString(o) 
{
   return ( o !== null ) &&
          ( typeof o === "string" || (typeof o === "object" && o.constructor === String) );
}
exports.isString = isString;

//////////////////////////////////////////////////////////////////////
function isStrValid(s)
{
   return ( isString(s) && s.length > 0 );
}
exports.isStrValid = isStrValid;
