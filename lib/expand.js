'use strict';

module.exports = expand;

function expand(opts, val, m4/*,args*/) {
    var args = Array.prototype.slice.call(arguments,3);
/*    var opts = args.shift();
    var val = args.shift();
    args.shift(); // remove reference to m4 
    */
    val = val.replace(/\$([0-9]+|[#*@])/g, function (match, nb) {
        if (nb === '#') return args.length - 1;
        if (nb === '*') return args.slice(1).join(',');
        if (nb === '@') return quotedArgs(opts, args);
        nb = +nb;
        if (nb >= args.length) return '';
        return args[nb];
    });
    return val;
}

function quotedArgs(opts, args) {
    return args.slice(1).map(function (e) {
        return opts.leftQuote + e + opts.rightQuote;
    }).join(',');
}
