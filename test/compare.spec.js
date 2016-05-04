//jshint node:true, eqnull:true, esversion:6
/*global describe, it, beforeEach */
'use strict';

var esformatter = require('esformatter');
var fs = require('fs');
var autoWrap = require('../');
var expect = require('chai').expect;


describe('compare input/output', function() {
  beforeEach(function() {
    esformatter.register(autoWrap);
    this.config = {
      preset: 'default',
      lineBreak: {
        value: "\r\n"
      },
      autoWrap: {
        maxLineLength: 40
      }
    };
  });
  for (var type of ['FunctionExpression']) {
    it(type, function() {
      var input = getFile('input-' + type + '.js');
      var output = esformatter.format(input, this.config);
      var outputFile = getFile( 'output-' + type + '.js');
      expect(output).to.eql(outputFile);
    });
  }
});

function getFile(name) {
  return fs.readFileSync('test/compare/' + name).toString();
}
