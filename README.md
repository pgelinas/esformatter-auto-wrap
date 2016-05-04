# esformatter-collapse-objects

[esformatter](https://github.com/millermedeiros/esformatter) plugin for
automagically wrap line when they are over a configurable length.

## Features
* Wrap lines that are too long
* Unwrap lines that fit under the configured length
* Respects your original esformatter whitespace settings
* Different wrapping strategy for different type of expressions

## Usage

install it:

```sh
npm install esformatter-auto-wrap
```

and something like this to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-auto-wrap"
  ]
}
```

## Options

The following is the default configuration for the plugin, which can be reproduced
and modified in your .esformatter config:

```json

{
  "autoWrap": {
    "maxLineLength": 120
  }
}

```

### maxLineLength (int)
The maximum lenght a line is allowed to be before being wrapped onto the next line.

## JavaScript API

Register the plugin and call esformatter like so:

```js
// register plugin
esformatter.register(require('esformatter-auto-wrap'));
// pass options as second argument
var output = esformatter.format(str, options);
```

## License

Released under the [MIT License](http://opensource.org/licenses/MIT).
