function foobar() {
  foobar('veryLong', 'parameters',
      'list', 'toWrap',
      'againAndAgainAndAgain');
  foobar("Don't wrap a single argument CallExpression");
  foobar('Push',
      'ArgumentSoLongThatItGetsWrappedAgainOnItsOwn');
  var bar = function(longArgument, name,
      toWrap) {
    foobar("SOMETHING");
  };
}
foobar("Multiple", "ArgumentCornerCase1");
foobar("Skipped", "Arg",
    bar("RecursiveWrap"));
