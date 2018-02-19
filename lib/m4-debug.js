'use strict';

var EOL = require('os').EOL;

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
// If debugfile is called without any arguments, 
// debug and trace output are sent to standard error.
//
// NOT IMPLEMENTED:
//    If file cannot be opened, the current debug file is unchanged, and an error is issued.
function setDebugFile(file) 
{
   var dbg_stream;

   if ( file === null || typeof file === 'undefined' )
   {
      dbg_stream = process.stderr;
   }
   else
   {
      if ( typeof file !== 'string' )
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
