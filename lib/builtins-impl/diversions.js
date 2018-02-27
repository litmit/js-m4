'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

var MININT32 = -2147483648;
var MAXINT32 =  2147483647;

// See: https://www.gnu.org/software/m4/manual/m4.html#Diversions

//--------------------------------------------------------------------
function parseIntStrict(s, radix) 
{
   var n = parseInt(s, radix);

   if ( !isNaN(n) )
   {
      var sn = String(n);
      if ( sn !== s && '+'+sn !== s )
      {
         n = NaN;
      }
   }
   return n;
}

//--------------------------------------------------------------------
/*
Builtin: divert ([number = ‘0’])

    The current diversion is changed to @number. 
    If @number is left out or empty, it is assumed to be zero. 
    
    A @number can be both positive or negative. Positive numbers may have leading '+' sign.

    If @number cannot be parsed, the diversion is unchanged.

    The expansion of divert is void. 

    If output is diverted to a negative diversion, it is simply discarded. 
    This can be used to suppress unwanted output. 

    Traditional implementations only supported ten diversions. 
    But as a GNU extension, diversion numbers can be as large as positive integers will allow, 
    rather than treating a multi-digit diversion number as a request to discard text.
*/
function builtin_divert(ix) 
{
   var diversionNo;

   if ( typeof ix === 'undefined' )
   {
      diversionNo = 0;
   }
   else if ( ix === '' )
   {
      this.error('M4_EMPTY_DIVERT');
      diversionNo = 0;
   }
   else
   {
      diversionNo = parseIntStrict(ix);

      if ( isNaN(diversionNo) )
      {
         this.error('M4_NON_NUMERIC', ix);
         return;
      }

      if ( diversionNo < MININT32 )
      {
         this.error('M4_NUMERIC_OVERFLOW', diversionNo, MININT32, MAXINT32);
         diversionNo = MININT32;
      }
      else if ( diversionNo > MAXINT32 )
      {
         this.error('M4_NUMERIC_OVERFLOW', diversionNo, MININT32, MAXINT32);
         diversionNo = MAXINT32;
      }
   }

   this.divert(diversionNo);
}

//--------------------------------------------------------------------
/*
Builtin: undivert ([diversions...])

    Undiverts the numeric @diversions given by the arguments, in the order given. 
    If no arguments are supplied, all diversions are undiverted, in numerical order.

    As a GNU extension, diversions may contain non-numeric strings, 
    which are treated as the names of files to copy into the output without expansion. 
    A warning is issued if a file could not be opened.

    Attempts to undivert the current diversion are silently ignored. 

    The expansion of undivert is void. 
*/
function builtin_undivert(args)
{
   this.undivert.apply(this,args);
}

//--------------------------------------------------------------------
/*
Builtin: divnum

    Expands to the number of the current diversion. 
*/
function builtin_divnum()
{
   return this.getDiversionInfo().divnum;
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('divert',    builtin_divert),
   BuiltinDescr('undivert',  builtin_undivert, false, 0, true, true),
   BuiltinDescr('divnum',    builtin_divnum),
];
