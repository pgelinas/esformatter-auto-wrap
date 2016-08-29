if ("SomeFirstArgument" || "SomeLongSecondArgument") {
  fooBar();
}
if ("SomeFirstArgument" || "SomeSecondArgument" || "SomeLongThirdArgument"){
  fooBar();
}
if ("Some" + "First" || "SomeLong" + "SecondArgument" || "LastOneToWrap") {
  fooBar();
}
if ("Some" + "First" || "SomeLong" + "SecondBinary" + "ShouldWrapBinaryThen" || "LastOneToWrap") {
  fooBar();
}
