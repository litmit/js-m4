'use strict';

var BuiltinDescr = require('../builtin-helpers.js').BuiltinDescr;

// See: https://www.gnu.org/software/m4/manual/m4.html#Diversions

//--------------------------------------------------------------------
function builtin_divert(ix) {
    if (ix === null || typeof ix === 'undefined') ix = 0;
    this._divertIx = +ix;
    if (typeof this._diversions[this._divertIx - 1] === 'undefined') {
        this._diversions[this._divertIx - 1] = '';
    }
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
function builtin_divnum() {
    return this._divertIx;
}

//--------------------------------------------------------------------
function builtin_changequote(lhs, rhs)
{
   this.changeQuote(lhs, rhs)
}

//--------------------------------------------------------------------
module.exports = 
[
   BuiltinDescr('divert',    builtin_divert),
   BuiltinDescr('undivert',  builtin_undivert, false, 0, true),
   BuiltinDescr('divnum',    builtin_divnum),
];
