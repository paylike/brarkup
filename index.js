'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through2');
var assign = require('object-assign');
var staticModule = require('static-module');
var quote = require('quote-stream');
var resolve = require('resolve');
var jade = require('jade');

module.exports = transform;

transform.compile = compile;

function transform( file, opts ){
	if (/\.json$/.test(file))
		return through();

	if (!opts)
		opts = {};

	var vars = {
		__filename: file,
		__dirname: path.dirname(file),
		require: { resolve: resolver }
	};

	if (opts.vars)
		Object.keys(opts.vars).forEach(function( key ){
			vars[key] = opts.vars[key];
		});

	var sm = staticModule({
		brarkup: {
			compile: staticCompile,
		},
	}, {
		vars: vars,
		varModules: { path: path },
	});

	function resolver(p){
		return resolve.sync(p, { basedir: path.dirname(file) });
	}

	return sm;

	function staticCompile( file, ropts, cb ){
		if (typeof ropts === 'function') {
			cb = ropts;
			ropts = {};
		}

		var stream = through(write, end);
		stream.push('process.nextTick(function(){(' + cb + ')(null,');

		var markup = quote();
		markup.pipe(stream);

		markup.end(compile(file, assign({
			compress: opts.compress,
		}, ropts)));

		return stream;

		function write( buf, enc, next ){
			this.push(buf);
			next();
		}

		function end( next ){
			this.push(')})');
			this.push(null);
			sm.emit('file', file);
			next();
		}
	}
};


function compile( file, opts ){
	return jade.renderFile(file, {
		filename: file,
		pretty: !(opts && opts.compress) && '\t',
	});
}
