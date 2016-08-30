var bar = function(longArgument,
    name,
    toWrap) {
  foobar("SOMETHING");
};
foo = bar("someArg", function(firstArg,
    secondArg) {
  bar("soWhat");
});
