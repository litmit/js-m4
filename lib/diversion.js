'use strict';

var ut = require('./misc.js');

//--------------------------------------------------------------------
// Now Diversion is just a string. But it can be improved in a future.
// For example a large diversions may be a file based streams.
function Diversion() 
{
   this._buffer = '';
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

function getDiversion(divnum) 
{
   return this._diversions[divnum];
}

//--------------------------------------------------------------------
// The current diversion is changed to @divnum. 
// If @divnum is left out or null, it is assumed to be '0'. 
// If @divnum is present it must be a SafeInteger, String or a Symbol.
// If @divnum can be treated as a negative integer, then a output simply discarded. 
function divert(divnum) 
{
   if ( ut.isNullOrUndefined(divnum) )
   {
      divnum = '0';
   } 
   else if ( ut.isNumber(divnum) )
   {
      if ( Number.isSafeInteger(divnum) )
      {
         divnum = String(divnum);
      }
      else
      {
         throw new TypeError('numeric divnum must be a safe integer');
      }
   }
   else if ( !(ut.isString(divnum) || ut.isSymbol(divnum) ) )
   {
      throw new TypeError('divnum must be a string or a symbol');
   }

   if ( this._divnum !== divnum )
   {
      this._divnum = divnum;
      this._outputDiverted = ( divnum !== '0' );
      this._outputDiscarded = /^-[0-9]+$/.test(divnum);

      if ( !this._diversions[divnum] ) 
      {
         this._diversions[divnum] = new Diversion();
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
   Object.getOwnPropertyNames(this._diversions).sort().forEach(fundivert);

   // at second undivert all symbol diversions
   Object.getOwnPropertySymbols(this._diversions).sort().forEach(fundivert);
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
function divnum()
{
   return this._divnum;
}

module.exports.Diversion = Diversion;
module.exports.getDiversion = getDiversion;
module.exports.divert = divert;
module.exports.undivert = undivert;
module.exports.divnum = divnum;

