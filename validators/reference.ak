use aiken/transaction.{ScriptContext}
use cogno_v2/types/reference.{ReferenceDatum}

validator(
  // this creates a custom always fail
  _random_string: ByteArray,
) {
  fn params(
    _datum: ReferenceDatum,
    _redeemer: Void,
    _context: ScriptContext,
  ) -> Bool {
    False
  }
}
