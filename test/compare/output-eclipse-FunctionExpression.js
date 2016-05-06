function foobar() {
  foobar('veryLong', 'parameters',
      'list', 'toWrap',
      'againAndAgainAndAgain');
  foobar("Don't wrap a single argument CallExpression");
  foobar(
      'Push',
      'ArgumentSoLongThatItGetsWrappedAgainOnItsOwn');
}
