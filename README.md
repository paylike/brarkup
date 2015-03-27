# Brarkup

A highly opinionated package for compiling html (from [jade](http://jade-
lang.com/)) in node and inlined using browserify.

```js
var brarkup = require('brarkup');

brarkup.compile(__dirname + '/index.jade', function( err, html ){
	if (err)
		return console.error(err);

	// browser context?
	if (typeof document !== 'undefined' && document.body)
		document.body.innerHtml = html;
});
```

An optional argument before the callback is allowed for configuration. So far
the only option is `compress` which will disable the `pretty` parameter of
jade.

```js
brarkup.compile(__dirname + '/index.jade', {
	compress: true,
}, cb);
```

```js
var brarkup = require('brarkup');
var browserify = require('browserify');

browserify()
	.transform(brarkup, {
		compress: true,
	})
	.add('index.js')
	.bundle()
	.pipe(fs.createWriteStream('bundle.js'));
```

If you need anything else, like support for other languages than jade, or more
flexibility, send a pull request.

You might be interested in [Bryles](https://github.com/paylike/bryles).
