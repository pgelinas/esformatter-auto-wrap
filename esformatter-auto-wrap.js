/* jshint esversion: 6 */
/* global require, module */

'use strict';
var defaults = require("defaults-deep");
var debug = require("debug")("esformatter:autoWrap");
var rocambole = require("rocambole");
var _tk = require("rocambole-token");
var _lb = require("rocambole-linebreak");
var _ws = require("rocambole-whitespace");
var _indent = require("rocambole-indent");

var options;
var defaultOptions = {
  maxLineLength : 120,
  eclipseCompatible : true
};

module.exports = {
  setOptions : (opts) => {
    options = defaults(opts.autoWrap || {}, defaultOptions);
    _ws.setOptions(opts && opts.whiteSpace);
    _lb.setOptions(opts && opts.lineBreak);
    _indent.setOptions(opts && opts.indent);
  },

  nodeBefore : (node) => {
    if (node.type in config) {
      config[node.type].unwrap(node);
    }
  },

  transformAfter : (ast) => {
    rocambole.walk(ast, wrapNode);
  }
};

function collapseAll(node, property) {
  node[property].forEach((argument) => {
    _lb.limitBefore(argument.startToken, 0);
    _lb.limitAfter(argument.endToken, 0);
  });
}

function nextElementOn(property) {
  return (node, element) => {
    if (element === undefined) {
      return node[property][0];
    }
    return element.next;
  };
}

var config = {
  CallExpression : {
    wrappingStrategy : wrapWhenNecessary,
    unwrap : (node) => {
      collapseAll(node, "arguments");
    },
    skip : (node) => {
      return node.arguments.length === 0 || node.arguments.length === 1;
    },
    nextElement : nextElementOn("arguments")
  },
  FunctionExpression : {
    wrappingStrategy : wrapWhenNecessary,
    unwrap : (node) => {
      collapseAll(node, "params");
    },
    skip : (node) => {
      return node.params.length === 0 || node.params.length === 1;
    },
    nextElement : nextElementOn("params")
  },
  ArrayExpression : {
    wrappingStrategy : wrapWhenNecessary,
    unwrap : (node) => {
      collapseAll(node, "elements");
    },
    skip : (node) => {
      return node.elements.length === 0 || node.elements.length === 1;
    },
    nextElement : nextElementOn("elements")
  },
  BinaryExpression : {
    wrappingStrategy : wrapWhenNecessary,
    unwrap : (node) => {
      _lb.limitBefore(node.left.startToken, 0);
      _lb.limitAfter(node.left.endToken, 0);
      _lb.limitBefore(node.right.startToken, 0);
      _lb.limitAfter(node.right.endToken, 0);
    },
    skip : (node) => {
      return node.parent.type === "BinaryExpression";
    },
    nextElement : (node, element) => {
      if (element !== undefined) {
        var parent = element.parent;
        return parent.right === element ? parent.parent.right : parent.right;
      }
      element = node.left;
      while (element.left !== undefined) {
        element = element.left;
      }
      return element;
    }
  }
};

function wrapNode(node) {
  if (!(node.type in config) || (config[node.type].skip !== undefined && config[node.type].skip(node))) {
    return;
  }

  var startOfTheLine = findStartOfLine(node.startToken);
  var endOfTheLine = _tk.findNext(node.startToken, _tk.isBr);

  // Quick check for line length.
  // range === undefined means a the token was added by code (not part of original input). Avoid for now.
  if (endOfTheLine.range === undefined || startOfTheLine.range === undefined || endOfTheLine.range[1] -
      startOfTheLine.range[0] <= options.maxLineLength) {
    return;
  }

  var currentIndentLevel = 0;
  if (_tk.isIndent(startOfTheLine)) {
    currentIndentLevel = startOfTheLine.level;
  }

  // TODO handle comments?
  var length = 0;
  var currentToken = startOfTheLine;
  var lastWrap;
  while (currentToken.next != endOfTheLine) {
    length += currentToken.value.length;
    if (length >= options.maxLineLength) {
      debug("Line length exceed %s at %s (%s).", options.maxLineLength, currentToken.value, currentToken.type);
      // If the current token is an Indent, then it means that whatever we do the line is too long...
      // abort wrapping at this point.
      if (currentToken.type === "Indent") {
        debug("Hit a line that was too long with its indent... don't bother!");
        break;
      }
      currentToken = config[node.type].wrappingStrategy(node, currentToken, currentIndentLevel);
      lastWrap = currentToken;
      if (currentToken === undefined) break;
      length = 0;
    }
    currentToken = currentToken.next;
  }
  return lastWrap;
}

function wrapWhenNecessary(node, token, currentIndentLevel) {
  // range can be undefined in case of Whitespace added by esformatter.
  // Skip to next valid token, should only skip one or two token, nothing to screw formatting (hopefully).
  while(token.range === undefined || token.type === "WhiteSpace") {
    token = token.next;
  }

  var nextElement = config[node.type].nextElement;
  var argument = nextElement(node);
  var prev;
  while (argument !== undefined) {
    if (token.range[0] <= argument.endToken.range[0]) {
      // If the previous token is an Indent, then it means the element is the first on the line
      // and that it was probably already wrapped
      if (argument.startToken.prev.type !== "Indent") {
        return wrapAndIndent(argument, token, currentIndentLevel);
      // Eclipse's formatter decides in this case that everyting should be wrapped...
      // But the right decision would be to skip the element; instead wrap the next one and continue on.
      } else if (options.eclipseCompatible) {
        return alwaysWrap(node, token, currentIndentLevel);
      }
    }

    prev = argument;
    argument = nextElement(node, argument);
    if (argument !== undefined &&
      options.eclipseCompatible && token.range[0] < argument.startToken.range[0]) {
      return wrapAndIndent(prev, token, currentIndentLevel);
    }
  }
  // If we're at the end of the node's "wrappable" elements, then Eclipse would wrap the last element.
  if (options.eclipseCompatible) {
    return wrapAndIndent(prev, token, currentIndentLevel);
  }
}

function alwaysWrap(node, token, currentIndentLevel) {
  var nextElement = config[node.type].nextElement;
  var element = nextElement(node);
  var lastToken;
  while (element !== undefined) {
    if (element.startToken.prev.type !== "Indent") {
      lastToken = wrapAndIndent(element, token, currentIndentLevel);
    }
    element = nextElement(node, element);
  }
  return lastToken;
}

function wrapAndIndent(node, token, currentIndentLevel) {
  if (node.type in config) {
    var firstElement = config[node.type].nextElement(node);
    if(token.range[0] >= firstElement.startToken.range[0]){
      if (wrapNode(node)) return;
    }
  }
  debug("Wrapping node of type %s on next line", node.type);
  _lb.limitBefore(node.startToken, 1);
  var newLine = _tk.findPrev(node.startToken, _tk.isBr);
  _indent.inBetween(newLine, node.endToken.next, currentIndentLevel + 2);
  return newLine;
}

// Taken from rocambole-indent
function findStartOfLine(token) {
  if (_tk.isBr(token) && _tk.isBr(token.prev)) {
    // empty lines are ignored
    return null;
  }
  var prev = token.prev;
  while (true) {
    if (!prev || _tk.isBr(prev)) {
      return token;
    }
    token = prev;
    prev = token.prev;
  }
}
