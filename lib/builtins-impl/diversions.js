'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

var MININT32 = -2147483648;
var MAXINT32 =  2147483647;

// See: https://www.gnu.org/software/m4/manual/m4.html#Diversions

//--------------------------------------------------------------------
/*
Builtin: divert ([number = ‘0’])

    The current diversion is changed to @number. 
    If @number is left out or empty, it is assumed to be zero. 
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

   if ( typeof ix === 'undefined' || ix === '' )
   {
      diversionNo = 0;
   }
   else
   {
      diversionNo = parseInt(ix);

      if ( String(diversionNo) !== ix )
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
function builtin_undivert() {
    var ics = Array.prototype.slice.call(arguments);
    if (ics.length === 0) {
        this._undivertAll();
        return;
    }
    while (ics.length > 0) {
        var arg = ics.pop();
        if (arg === '') continue;
        var i = +arg;
        if (i + '' === arg) {
            this._undivert(+i);
        } else {
            if (this._opts.extensions) {
                throw new Error('not implemented');
            } else {
                this.error('W_TXT_UNDIV', arg);
            }
        }
    }
}

//--------------------------------------------------------------------
function builtin_divnum()
{
   return this._divertIx;
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('divert',    builtin_divert),
   BuiltinDescr('undivert',  builtin_undivert, false, 0, true),
   BuiltinDescr('divnum',    builtin_divnum),
];
