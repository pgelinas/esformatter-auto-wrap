//jshint node:true, eqnull:true, esversion:6
/*global describe, it, beforeEach */
"use strict";

var esformatter = require("esformatter");
var fs = require("fs");
var autoWrap = require("../");
var expect = require("chai").expect;
var implementedTypes = ["CallExpression", "ArrayExpression", "BinaryExpression", "FunctionExpression",
    "LogicalExpression"];

describe("compare input/output", () => {
  beforeEach(function() {
    esformatter.register(autoWrap);
    this.config = {
      preset : "default",
      lineBreak : {
        value : "\r\n"
      },
      autoWrap : {
        maxLineLength : 40,
        eclipseCompatible : false
      }
    };
  });

  describe("wrap when necessary", function() {
    for (var type of implementedTypes) {
      it(type, wrapWhenNecessaryTest(type));
    }
  });

  describe("eclipse compatibility", function() {
    beforeEach(function() {
      this.config.autoWrap.eclipseCompatible = true;
    });

    for (var type of implementedTypes) {
      it(type, eclipseTest(type));
    }
  });

  describe("always wrap", function() {
    for (var type of implementedTypes) {
      it(type, alwaysWrapTest(type));
    }
  });
});

function getFile(name) {
  var filePath = "test/compare/" + name;
  try {
    return fs.readFileSync(filePath).toString();
  } catch (e) {
    return undefined;
  }
}

function wrapWhenNecessaryTest(type) {
  return compareTest(type);
}

function eclipseTest(type) {
  return compareTest(type, "eclipse");
}

function alwaysWrapTest(type) {
  return function() {
    var wrappingStrategies = {};
    wrappingStrategies[type] = "alwaysWrap";
    this.config.autoWrap.wrappingStrategies = wrappingStrategies;
    this.config.autoWrap.eclipseCompatible = false;
    compareTest(type, "always").call(this);
  };
}

function compareTest(type, qualifier) {
  return function() {
    var input = getFile("input-" + type + ".js");

    var outputName = "output-";
    if (qualifier !== undefined) {
      outputName += qualifier + "-";
    }
    outputName += type + ".js";
    var outputFile = getFile(outputName);
    if (outputFile !== undefined) {
      var output = esformatter.format(input, this.config);
      expect(output).to.eql(outputFile);
    }
  };
}
