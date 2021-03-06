'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Tokenizer = require('./lib/tokenizer');
var expand = require('./lib/expand');
var M4Error = require('./lib/m4-error');
var Code = M4Error.Code;
var debug_features = require('./lib/m4-debug');
var diversion_features = require('./lib/diversion');
var BuiltinDescr = require('./lib/builtin-helpers.js').BuiltinDescr;

var util = require('util');
var fs = require('fs');
var ut = require('./lib/misc.js');

module.exports = M4;
util.inherits(M4, Transform);

function M4(opts/*opt*/) {
    Transform.call(this, {decodeStrings: false, encoding: 'utf8'});
    this._opts = {};
    for (var opt in opts) this._opts[opt] = opts[opt];

    // ensure that all used options has valid type and value
    this._opts.nestingLimit = this._opts.nestingLimit || 0;
    this._opts.extensions = this._opts.extensions || false;
    this._opts.prefix_builtins = !!this._opts.prefix_builtins;

    this._opts.debug = {};
    this.setDebugOptions(false);
    if ( ut.isObject(opts) && opts.hasOwnProperty('debug') )
    {
       this.setDebugOptions(opts.debug);
    }

    this._macros = Object.create(null);
    this._pending = null;
    this._macroStack = [];
    this._buffers = [];

//    this._divertIx = 0;
    this._divnum = '0';
    this._outputDiverted = false;
    this._outputDiscarded = false;
    this._diversions = Object.create(null);

    this._skipWhitespace = false;
    this._tokenizer = new Tokenizer();
    this._expandOpts = {ext: true, leftQuote: this._tokenizer._leftQuote,
                        rightQuote: this._tokenizer._rightQuote};
    this._err = null;
    this._dnlMode = false;

    // Writable stream to output debug info
    this._debugStream = null;

    // The tag that prefix all errors and warning messages. 
    // It also optionally printed in debug messages (depending on option debug.print_filename)
    // If _inputTag is an empty string then also disabled printing of line number and char position
    this._inputTag = '';

    this._registerBuiltins();

    this.on('pipe', onPipe);
    this.on('unpipe', onUnPipe);
}

M4.prototype.getOptions = function () {
    return this._opts;
};

M4.prototype._builtins = require('./lib/builtins');

M4.prototype.quoted = function(str)
{
   return this._expandOpts.leftQuote + str + this._expandOpts.rightQuote;
};

M4.prototype._registerBuiltins = function ()
{
   for ( var builtin in this._builtins )
   {
      var builtinDescr = this._builtins[builtin];
      var name = builtinDescr.name;
      if ( this._opts.prefix_builtins )
      {
         name = 'm4_' + name;
      }
      this.define(name, this._makeMacro(builtinDescr));
   }
};

M4.prototype._makeMacro = function (builtinDescr)
{
    return (function macro() {
        var args = Array.prototype.slice.call(arguments);
        var m4 = args.shift();
        return builtinDescr.invoke(m4, args);
    }).bind(this);
};

M4.prototype._transform = function (chunk, encoding, cb) {
    if (this._err !== null) return cb();
    try {
        this._tokenizer.push(chunk);
        this._processPendingMacro();
        var token = this._tokenizer.read();
        while (token !== null) {
            if (this._dnlMode) {
                if (token.value === '\n') this._dnlMode = false;
            } else {
                this._processToken(token);
            }
            this._processPendingMacro();
            token = this._tokenizer.read();
        }
    } catch (err) {
        this._err = err;
        return cb(err);
    }
    return cb();
};

M4.prototype._flush = function (cb) {
    this._tokenizer.end();
    this._transform('', null, (function (err) {
        if (err) return cb(err);
        this.divert(); // need to switch back to standard output
        this.undivert();
        return cb();
    }).bind(this));
};

M4.prototype._startMacroArgs = function () {
    if (this._opts.nestingLimit > 0 &&
        this._macroStack.length === this._opts.nestingLimit) {
        throw new M4Error(Code.E_NEST_LIMIT, this._opts.nestingLimit);
    }
    this._tokenizer.read();
    this._pending.args.push('');
    this._macroStack.push(this._pending);
    this._pending = null;
    this._skipWhitespace = true;
};

M4.prototype._callMacro = function (fn, args) {
    var result = fn.apply(null, args);
    if (typeof result !== 'string')
        throw new M4Error(Code.E_INV_RET, args[0]);
    return result;
};

M4.prototype._processPendingMacro = function () {
    if (this._pending === null) return;
    if (this._tokenizer.peekChar() === null &&
        !this._tokenizer.isEnd()) return;
//console.log('pending:',this._pending);
    if (this._tokenizer.peekChar() === '(')
        return this._startMacroArgs();
    var result = this._callMacro(this._pending.fn, this._pending.args);
    this._tokenizer.unshift(result);
    this._pending = null;
};

M4.prototype._processToken = function (token) {
    if (this._skipWhitespace && token.type === Tokenizer.Type.LITERAL &&
        /\s/.test(token.value)) return;
    this._skipWhitespace = false;
    if (token.type === Tokenizer.Type.NAME &&
        this._macros[token.value]) {
        this._pending = this._makeMacroCall(token.value);
        return;
    }
    if (this._macroStack.length === 0)
        return this._pushOutput(token.value);
    var macro = this._macroStack[this._macroStack.length - 1];
    if (token.type === Tokenizer.Type.LITERAL) {
        if (this._processLiteralInMacro(macro, token)) return;
    }
    macro.args[macro.args.length - 1] += token.value;
};

M4.prototype._makeMacroCall = function (name) {
    return {fn: this._macros[name], args: [this,name], parens: 0};
};

M4.prototype._processLiteralInMacro = function (macro, token) {
    if (token.value === ')') {
        if (macro.parens === 0) {
            macro = this._macroStack.pop();
            var result = this._callMacro(macro.fn, macro.args);
            this._tokenizer.unshift(result);
            return true;
        }
        --macro.parens;
    } else if (token.value === '(') {
        ++macro.parens;
    } else if (token.value === ',' && macro.parens === 0) {
        macro.args.push('');
        this._skipWhitespace = true;
        return true;
    }
    return false;
};

M4.prototype._pushOutput = function (output) 
{
   if ( !this._outputDiscarded )
   {
      if ( this._outputDiverted )
      {
         this._diversions[this._divnum].write(output);
      }
      else
      {
         this.push(output);
      }
   }
};

M4.prototype.define = function (name, fn) {
    if (typeof name !== 'string' || name.length === 0) return '';
    if (typeof fn === 'undefined') fn = '';
    if (typeof fn !== 'function')
        fn = expand.bind(null, this._expandOpts, fn);
    this._macros[name] = fn;
};

M4.prototype.undefine = function (name) {
   if ( ut.isStrValid(name) )
   {
      delete this._macros[name];
   }
};

M4.prototype.changeQuote = function (lhs, rhs) {
    if (typeof lhs === 'undefined') {
        lhs = '`';
        rhs = '\'';
    } else if (typeof rhs === 'undefined') {
        rhs = '\'';
    }
    this._tokenizer.changeQuote(lhs, rhs);
    this._expandOpts.leftQuote = lhs;
    this._expandOpts.rightQuote = rhs;
};

M4.prototype.getDiversionInfo = diversion_features.getDiversionInfo;
M4.prototype.getDiversion     = diversion_features.getDiversion;
M4.prototype.divert           = diversion_features.divert;
M4.prototype.undivert         = diversion_features.undivert;

M4.prototype.getDebugStream  = debug_features.getDebugStream;
M4.prototype.setDebugStream  = debug_features.setDebugStream;
M4.prototype.setDebugFile    = debug_features.setDebugFile;
M4.prototype.setDebugOptions = debug_features.setDebugOptions;
M4.prototype.debug           = debug_features.debug;

// Should handle all m4 related errors
// and separate it as warnings and fatal errors
// TODO: add more context specific info (current macro/builtin name for example)
function error(tag/*,args*/) 
{
   var code = M4Error.Code[tag];
   var args = Array.prototype.slice.call(arguments,1);
   var err = Object.create(M4Error.prototype);
   M4Error.apply(err, [code].concat(args));

   //err.m4 = this;

   // as described in https://nodejs.org/api/errors.html#errors_error_code
   // error.code should be a string
   err.errno = err.code;
   err.code = tag;

   var context = '';

   if ( this._inputTag.length > 0 )
   {
      context += this._inputTag;
      context += ':';
   }
   err.context = context;

   Error.captureStackTrace(err, error);

   this.emit('warning', err);
}

M4.prototype.error = error;

function onPipe(input)
{
   var info_str, tag;

   if ( ut.isStrValid(input.path) )
   {
      tag = input.path;
      info_str = 'file \'' + input.path + '\'';
   }
   else if ( input === process.stdin )
   {
      info_str = tag = 'stdin';
   }
   else
   {
      info_str = tag = 'stream';
   }

   if ( this._opts.debug.input_changes )
   {
      this._inputTag = '';
      this.debug('input read from ' + info_str);
   }

   this._inputTag = tag;
}

function onUnPipe(input)
{
   if ( this._opts.debug.input_changes )
   {
      this.debug('input exhausted');
   }

   this._inputTag = '';
}

