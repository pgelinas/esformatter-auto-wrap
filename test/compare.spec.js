//jshint node:true, eqnull:true, esversion:6
/*global describe, it, beforeEach */
'use strict';

var esformatter = require('esformatter');
var fs = require('fs');
var autoWrap = require('../');
var expect = require('chai').expect;
var implementedTypes = ['FunctionExpression', 'ArrayExpression', 'BinaryExpression'];

describe('compare input/output', () => {
  beforeEach(function() {
    esformatter.register(autoWrap);
    this.config = {
      preset: 'default',
      lineBreak: {
        value: "\r\n"
      },
      autoWrap: {
        maxLineLength: 40,
        eclipseCompatible: false
      }
    };
  });

  for (var type of implementedTypes) {
    it(type,test(type));
  }

  describe('eclipse compatibility', function() {
    beforeEach(function() {
      this.config.autoWrap.eclipseCompatible = true;
    });

    for (var type of implementedTypes) {
      it(type, eclipseTest(type));
    }
  });
});

function getFile(name) {
  return fs.readFileSync('test/compare/' + name).toString();
}

function test(type){
   return function() {
    var input = getFile('input-' + type + '.js');
    var output = esformatter.format(input, this.config);
    var outputFile = getFile( 'output-' + type + '.js');
    expect(output).to.eql(outputFile);
  };
}

function eclipseTest(type){
  return function() {
    var input = getFile('input-' + type + '.js');
    var output = esformatter.format(input, this.config);
    var outputFile = getFile( 'output-eclipse-' + type + '.js');
    expect(output).to.eql(outputFile);
  };
}
