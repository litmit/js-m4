#!/usr/bin/env node
'use strict';

var M4 = require('..');
var nopt = require('nopt');
var path = require('path');
var fs = require('fs');
var npmlog = require('npmlog');
var Sysexits = require('sysexits');
var FileBatch = require('./file-batch.js');
var ut = require('../lib/misc.js');


var knownOpts = {
    'help':            Boolean,
    'version':         Boolean,
    'fatal-warnings':  Boolean,
    'prefix-builtins': Boolean,
    'quiet':           Boolean,
    'define':          [String, Array],
    'include':         [path,   Array],
    'synclines':       Boolean,
    'undefine':        [String, Array],
    'source-map':      path,
    'output':          path,
    'extensions':      Boolean,
    'nesting-limit':   Number,
    'freeze-state':    path,
    'reload-state':    path,
    'debug':           String,
    'debugfile':       String
};

var shortHands = {
    'v':      '--version',
    'E':      '--fatal-warnings',
    'P':      '--prefix-builtins',
    'silent': '--quiet',
    'Q':      '--quiet',
    'D':      '--define',
    'I':      '--include',
    's':      '--synclines',
    'U':      '--undefine',
    'm':      '--source-map',
    'o':      '--output',
    'L':      '--nesting-limit',
    'F':      '--freeze-state',
    'R':      '--reload-state',
    'd':      '--debug'
};

function main() {
    var opts = nopt(knownOpts, shortHands);
    var files = opts.argv.remain;

    npmlog.heading = path.basename(process.argv[1]) + ':';
    if (opts.help) return help();
    if (opts.version) return version();
    run(opts, files);
}

function help() {
    var opts = {encoding: 'utf8'};
    fs.readFile(path.join(__dirname, 'help'), opts, function (err, data) {
        if (err) {
            npmlog.error(null, err.message);
            process.exit(Sysexits.IOERR);
        }
        process.stdout.write(data);
    });
}

function version() {
    var pack = require(path.join(__dirname, '../package.json'));
    console.log(pack.version);
}

function run(opts, files) {
    var output, dbg_output;
    var errored = false;
    var m4_options = {};
    var m4_dbg_options = {};

    // parse and prepare options from the command line
    if ( opts['prefix-builtins'] ) {
       m4_options.prefix_builtins = true;
    }

    if ( ut.isStrValid(opts.debug) ) 
    {
       var dbgopts = opts.debug;

       if ( dbgopts.indexOf('V') !== -1 ) 
       {
          dbgopts = 'fi' + dbgopts.replace(/V/g,'');
       }

       if ( dbgopts.indexOf('i') !== -1 ) 
       {
          dbgopts = dbgopts.replace(/i/g,'');
          m4_dbg_options.input_changes = true;
       }

       if ( dbgopts.indexOf('f') !== -1 ) 
       {
          dbgopts = dbgopts.replace(/f/g,'');
          m4_dbg_options.print_filename = true;
       }

       if ( dbgopts.length > 0 )
       {
          npmlog.error(null, "bad debug flags: `" + dbgopts + "'");
          process.exit(Sysexits.USAGE);
       }
    }

    m4_options.debug = m4_dbg_options;

//console.log(m4_options);
    var m4 = new M4(m4_options);
//console.log(m4.getOptions());

//console.log(opts);

    // prepare debug output stream
    m4.setDebugFile(opts.debugfile);

    // prepare output stream
    if (typeof opts.output !== 'undefined') {
        output = fs.createWriteStream(opts.output, {encoding: 'utf8'});
    } else {
        output = process.stdout;
    }

    process.stdin.setEncoding('utf8');
    if (files.length === 0) files = ['-'];
    var batch = new FileBatch(files, m4, end.bind(null, m4, output));
    m4.on('warning', function (err) {
        npmlog.warn(null, err.message);
    });
    batch.on('error', function (err) {
        npmlog.error(err.source === 'output' ? 'm4' : 'input',
                     err.inner.message);
        errored = true;
    });
    m4.pipe(output, {end: false});
    batch.on('done', function () { end(m4, output, errored); });
    batch.execute();
    output.on('error', function (err) {
        npmlog.error('output', err.message);
        m4.unpipe(output);
        batch.abort();
    });
}

function end(m4, output, errored) {
    if (!errored) m4.end();
    if (output !== process.stdout) output.end();
    if (errored) process.exit(1);
}

main();
