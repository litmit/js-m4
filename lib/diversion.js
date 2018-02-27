'use strict';

var ut = require('./misc.js');

//--------------------------------------------------------------------
// Now Diversion is just a string buffer. But it can be improved in a future.
// For example a large diversions may be a file based streams.
function Diversion(isNumeric) 
{
   this._buffer = '';
   this._isNumeric = isNumeric;
}

//--------------------------------------------------------------------
// Add @s to this diversion
function write(s)
{
   this._buffer += s;
}

Diversion.prototype.write = write;


//--------------------------------------------------------------------
// Store all diversion in writable @stream. Note that @stream can be an other diversion too.
// After 'pop' a diversion become the empty.
function pop(stream)
{
   stream.push(this._buffer);
   this._buffer = '';
}

Diversion.prototype.pop = pop;

//--------------------------------------------------------------------
function _parseDivnum(divnum) 
{
   var isNumeric = false;
   var isNegative = false;

   if ( ut.isNullOrUndefined(divnum) )
   {
      divnum = '0';
      isNumeric = true;
   } 
   else if ( ut.isNumber(divnum) )
   {
      if ( Number.isSafeInteger(divnum) )
      {
         isNumeric = true;
         isNegative = ( divnum < 0 );
         divnum = String(divnum);
      }
      else
      {
         throw new TypeError('numeric divnum must be a safe integer');
      }
   }
   else if ( ut.isString(divnum) )
   {
      isNumeric = /^[+-]?\d+$/.test(divnum);

      if ( isNumeric )
      {
         if ( divnum[0] === '-' )
         {
            isNegative = true;
         }
         else if ( divnum[0] === '+' )
         {
            divnum = divnum.slice(1);
         }
      }
   }
   else if ( !ut.isSymbol(divnum) )
   {
      throw new TypeError('divnum must be a string or a symbol');
   }

   return { divnum:divnum,  isNumeric:isNumeric, isNegative:isNegative};
}

//--------------------------------------------------------------------
function getDiversion(_divnum) 
{
   var divnum = _parseDivnum(_divnum).divnum;
   return this._diversions[divnum];
}

//--------------------------------------------------------------------
// The current diversion is changed to @divnum. 
// If @divnum is left out or null, it is assumed to be '0'. 
// If @divnum is present it must be a SafeInteger, String or a Symbol.
// If @divnum can be treated as a negative integer, then a output simply discarded. 
function divert(_divnum) 
{
   var result = _parseDivnum(_divnum);

   if ( this._divnum !== result.divnum )
   {
      this._divnum = result.divnum;
      this._outputDiverted = ( this._divnum !== '0' );
      this._outputDiscarded = result.isNegative;

      if ( this._outputDiverted && !this._outputDiscarded )
      {
         if ( !this._diversions[this._divnum] ) 
         {
            this._diversions[this._divnum] = new Diversion(result.isNumeric);
         }
      }
   }
}

//--------------------------------------------------------------------
function Redirect(m4) 
{
   this._m4 = m4;
}

Redirect.prototype.push = function(s)
{
   this._m4._pushOutput(s);
};

//--------------------------------------------------------------------
function _compareDivnum(a, b) 
{
   var diva = this._diversions[a];
   var divb = this._diversions[b];
   var result;

   if ( diva._isNumeric && divb._isNumeric )
   {
      if ( a === b )
      {
         result = 0;
      }
      else if ( a.length === b.length )
      {
         result = ( a > b ) ? 1 : -1;
      }
      else
      {
         result = ( a.length > b.length ) ? 1 : -1;
      }
   }
   else
   {
      result = ( a === b ) ? 0 : (a > b ? 1 : -1);
   }

   return result;
}

//--------------------------------------------------------------------
function _undivertOne(divnum) 
{
   if ( this._divnum !== divnum )
   {
      var diversion = this._diversions[divnum];
      if ( diversion )
      {
         diversion.pop(new Redirect(this));
         delete this._diversions[divnum];
      }
   }
}

//--------------------------------------------------------------------
function _undivertAll() 
{
//console.log(this._diversions);

   var fundivert = _undivertOne.bind(this);

   // at first undivert all non symbol diversions
   Object.getOwnPropertyNames(this._diversions).sort(_compareDivnum.bind(this)).forEach(fundivert);

   // at second undivert all symbol diversions
   Object.getOwnPropertySymbols(this._diversions).forEach(fundivert);
}

//--------------------------------------------------------------------
function undivert()
{
   var ics = Array.prototype.slice.call(arguments);

   if ( ics.length === 0 ) 
   {
      _undivertAll.call(this);
   }

   while (ics.length > 0) {
       var arg = ics.pop();
       if (arg === '') continue;
       var i = +arg;
       if (i + '' === arg) {
           _undivertOne.call(this,+i);
       } else {
           if (this._opts.extensions) {
               throw new Error('not implemented');
           } else {
               this.error('M4_TXT_UNDIV', arg);
           }
       }
   }
}

//--------------------------------------------------------------------
function getDiversionInfo()
{
   return {
      divnum:    this._divnum,
      diverted:  this._outputDiverted,
      discarded: this._outputDiscarded
   };
}

module.exports.Diversion = Diversion;
module.exports.getDiversion = getDiversion;
module.exports.getDiversionInfo = getDiversionInfo;
module.exports.divert = divert;
module.exports.undivert = undivert;

