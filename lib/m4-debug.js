'use strict';

var EOL = require('os').EOL;
var ut = require('./misc.js');

//--------------------------------------------------------------------
// @options can be one of: object, string or boolean.
// If @options is boolean false then all debugging options set to false.
// If @options is boolean true then all debugging options set to true.
// If @options is object then all debugging options that corresponding to object properties
// set to it value by converting a property value to the boolean.
// The last choice is to use a string as @options. In this case @options
// should be a subset of the letters listed below. 
// As special cases, if the argument starts with a ‘+’, the flags are added to the 
// current debug options, and if it starts with a ‘-’, they are removed.
// If @options is an empty string, null or absent then nothing happen. 
// List of all valid options and corresponding letters:
//
//   letter    option
//     f     print_filename
//     i     input_changes
//     t     trace_all
//     V                       A shorthand for all of the above flags
//
//  Any other letters and options cause TypeError exception
var dbg_opt_names =
[
   'print_filename',
   'input_changes',
   'trace_all'
];

// letters in string MUST be ordered as corresponding options names in dbg_opt_names
var dbg_opt_letters = 'fit';

var dbg_opt_count = dbg_opt_names.length;

function _setAllDebugOptions(o,v)
{
   var i = dbg_opt_count;
   while ( i-- ) 
   {
      o[dbg_opt_names[i]] = v;
   }
}

function setDebugOptions(options/*opt*/)
{
   if ( ut.isNullOrUndefined(options) )
   {
      return;
   }

   var o = this._opts.debug;
   var opti;

   if ( ut.isBoolean(options) )
   {
      _setAllDebugOptions(o,options);
      return;
   }

   if ( ut.isStrValid(options) )
   {
      var v, flag, opti;
      var pos = 0;
      var flags = options;
      var bad_flags = '';
      var len = flags.length;

      if ( flags[0] === '-' )
      {
         v = false;
         ++pos;
      } 
      else if ( flags[0] === '+' )
      {
         v = true;
         ++pos;
      } 
      else
      {
         v = true;
         _setAllDebugOptions(o,false);
      }

      while ( pos < len )
      {
         flag = flags[pos++];
         if ( flag === 'V' )
         {
            _setAllDebugOptions(o,v);
         }
         else
         {
            opti = dbg_opt_letters.indexOf(flag);
            if ( opti === -1 )
            {
               bad_flags += flag;
            }
            else
            {
               o[dbg_opt_names[opti]] = v;
            }
         }
      }

      if ( bad_flags.length > 0 )
      {
         throw new TypeError("bad debug flags: `" + bad_flags + "'");
      }

      return;
   }

   if ( ut.isObject(options) )
   {
      var opt_name;

      for ( opt_name in options )
      {
         opti = dbg_opt_names.indexOf(opt_name);
         if ( opti === -1 )
         {
            throw new TypeError("bad debug option: `" + opt_name + "'");
         }
         else
         {
            o[opt_name] = Boolean(options[opt_name]);
         }
      }

      return;
   }

   throw new TypeError('invalid type of options');
}
exports.setDebugOptions = setDebugOptions;

//--------------------------------------------------------------------
function getDebugStream()
{
   return this._debugStream;
}
exports.getDebugStream = getDebugStream;

//--------------------------------------------------------------------
function setDebugStream(stream)
{
   var old_stream = this._debugStream;
   this._debugStream = stream || null;
   return old_stream;
}
exports.setDebugStream = setDebugStream;

//--------------------------------------------------------------------
//   Sends all further debug and trace output to file, opened in append mode. 
// If file is the empty string, debug and trace output are discarded. 
// If setDebugFile is called without any arguments, 
// debug and trace output are sent to standard error.
//
// NOT IMPLEMENTED:
//    If file cannot be opened, the current debug file is unchanged, and an error is issued.
function setDebugFile(file/*opt*/) 
{
   var dbg_stream;

   if ( ut.isNullOrUndefined(file) )
   {
      dbg_stream = process.stderr;
   }
   else
   {
      if ( ut.isString(file) )
      {
         throw new TypeError('file name must be a string');
      }

      if ( file.length > 0 ) 
      {
         dbg_stream = fs.createWriteStream(file, {flags:'a', encoding: 'utf8'});
      } 
      else // file name is empty string
      {
         // discard any debug output
         dbg_stream = null;
      }
   }

   if ( dbg_stream )
   {
      dbg_stream.on('error', onDebugStreamError);
   }

   var old_stream = this.setDebugStream(dbg_stream);
   if ( old_stream )
   {
      old_stream.removeListener('error', onDebugStreamError);
      if ( old_stream !== process.stdout && old_stream !== process.stderr )
      {
         old_stream.end();
      }
   }
}
exports.setDebugFile = setDebugFile;


//--------------------------------------------------------------------
// TODO: need more smart handler
function onDebugStreamError(err)
{
   throw err;
}

//--------------------------------------------------------------------
// Write message @msg to debug stream if it present. Otherwise function do nothing.
// Output formating depends on debug options (see setDebugOptions description)
function debug(msg)
{
   if ( this._debugStream )
   {
      this._debugStream.write('m4debug:');
      if ( this._opts.debug.print_filename && this._inputTag.length > 0 )
      {
         this._debugStream.write(this._inputTag);
         this._debugStream.write(':');
      }
      this._debugStream.write(' ');
      this._debugStream.write(msg);
      this._debugStream.write(EOL);
   }
}
exports.debug = debug;
