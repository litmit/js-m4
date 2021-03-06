'use strict';

var util = require('util');

module.exports = M4Error;
util.inherits(M4Error, Error);

function _vformatMessage(code,args) {
    var template = M4Error.Message[code];
    if (typeof template === 'undefined') {
       template = 'unknown error #' + code + ', arguments:';
    }
    var msg = util.format.apply(null, [template].concat(args));
    return msg;
}

function M4Error(code/*,args*/) {
    var args = Array.prototype.slice.call(arguments,1);
    var msg = _vformatMessage(code,args);

    Object.defineProperty(this, "message", { value: msg });        
    Object.defineProperty(this, "name", { value: this.constructor.name });        
    Error.captureStackTrace(this, this.constructor);

    this.code = code;
    this.args = args;
}

var Code = M4Error.Code = {
    E_INV_RET: 1,
    E_NEST_LIMIT: 2,
    E_EOF_IN_STR: 65,
    M4_EMPTY_DIVERT:    128,
    M4_TXT_UNDIV:       129,
    M4_TOO_MANY_ARGS:   130,
    M4_TOO_FEW_ARGS:    131,
    M4_BAD_BUILTIN:     132,
    M4_BAD_MACRO:       133,
    M4_BAD_DEBUG_FLAGS: 134,
    M4_NON_NUMERIC:     135,
    M4_NUMERIC_OVERFLOW:136,
};

M4Error.Message = {};
M4Error.Message[Code.E_INV_RET] =
    'macro function `%s\' did not return a string';
M4Error.Message[Code.E_NEST_LIMIT] =
    'too much macro nesting (max. %s)';
M4Error.Message[Code.E_EOF_IN_STR] =
    'unexpected end of file in string (unmatched quote)';
M4Error.Message[Code.M4_EMPTY_DIVERT] =
    'empty string treated as 0';
M4Error.Message[Code.M4_TXT_UNDIV] =
    'non-number `%s\' in undivert arguments (forgot to enable extensions?)';
M4Error.Message[Code.M4_TOO_MANY_ARGS] =
    'excess arguments to builtin `%s\' ignored, need no more than %d';
M4Error.Message[Code.M4_TOO_FEW_ARGS] =
    'too few arguments to builtin `%s\', at less %d required';
M4Error.Message[Code.M4_BAD_BUILTIN] =
    'undefined builtin `%s\'';
M4Error.Message[Code.M4_BAD_MACRO] =
    'undefined macro `%s\'';
M4Error.Message[Code.M4_BAD_DEBUG_FLAGS] =
     'bad debug flags: `%s\'';
M4Error.Message[Code.M4_NON_NUMERIC] =
     'non-numeric argument: `%s\'';
M4Error.Message[Code.M4_NON_NUMERIC] =
     'non-numeric argument: `%s\'';
M4Error.Message[Code.M4_NUMERIC_OVERFLOW] =
     'numeric overflow detected: given number %d should be in range [%d,%d]';

