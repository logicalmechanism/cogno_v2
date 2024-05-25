use aiken/bytearray

/// Simplified unique token name with a prefix generator. Prepend the tx index
/// to the txid then concat the prefix to the preprended txid. The first 32 
/// bytes, 64 ascii characters, is the token name.
///
/// ```aiken
/// util.token_name(txid, txidx, prefix_222)
/// ```
pub fn token_name(txid: ByteArray, idx: Int, prefix: ByteArray) -> ByteArray {
  // prefix the txid with the index
  let prepend_index: ByteArray = bytearray.push(txid, idx)
  // concat the prefix
  let prepend_prefix: ByteArray = bytearray.concat(prefix, prepend_index)
  // slice off the first 32, so 64 characters
  bytearray.slice(prepend_prefix, 0, 31)
}

test empty_token_name() {
  token_name(#"", 0, #"") == #"00"
}

test no_prefix_token_name() {
  token_name(
    #"e5993fa3cf4050b5b4bfb957c88e9f0d4d17636b239e249283808489847424ea",
    0,
    #"",
  ) == #"00e5993fa3cf4050b5b4bfb957c88e9f0d4d17636b239e249283808489847424"
}

test prefix_222_token_name() {
  token_name(
    #"e5993fa3cf4050b5b4bfb957c88e9f0d4d17636b239e249283808489847424ea",
    0,
    #"000de140",
  ) == #"000de14000e5993fa3cf4050b5b4bfb957c88e9f0d4d17636b239e2492838084"
}
