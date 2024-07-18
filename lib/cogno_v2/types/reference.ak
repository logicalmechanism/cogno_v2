use aiken/transaction.{InlineDatum, Input}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{PolicyId}
use assist/addresses
use assist/tests/fake_tx
use assist/types/hashes.{ValidatorHash}

pub type ReferenceDatum {
  cogno_policy_id: PolicyId,
  thread_policy_id: PolicyId,
  cogno: ValidatorHash,
  thread: ValidatorHash,
}

/// Find the first occurence of an input that matches an address and has an
/// inline datum. If found then return the input else fail. This prevents
/// selecting incorrect UTxOs from the reference inputs living at the same
/// address.
///
/// ```aiken
/// reference.find_first_input_with_datum(reference_inputs, reference_address)
/// ```
pub fn find_first_input_with_datum(inputs: List<Input>, addr: Address) -> Input {
  when inputs is {
    [input, ..rest] ->
      // find the input at this address
      if input.output.address == addr {
        // only inline datums here
        when input.output.datum is {
          InlineDatum(_) -> input
          // else just go to the next one
          _ -> find_first_input_with_datum(rest, addr)
        }
      } else {
        find_first_input_with_datum(rest, addr)
      }
    [] -> fail @"No Input Found By Address With Inline Datum"
  }
}

test empty_input_fails() fail {
  let addr: Address = addresses.create_address(#"acab", #"")
  find_first_input_with_datum([], addr) == fake_tx.test_input()
}

test single_good_input() {
  let addr: Address = addresses.create_address(#"acab", #"")
  let inputs: List<Input> =
    [fake_tx.test_input()]
  find_first_input_with_datum(inputs, addr) == fake_tx.test_input()
}

test many_inputs() {
  let addr: Address = addresses.create_address(#"acab", #"")
  let inputs: List<Input> =
    [
      fake_tx.test_script_input(),
      fake_tx.test_input_with_datum_hash(),
      fake_tx.test_bad_input(),
      fake_tx.test_input(),
    ]
  find_first_input_with_datum(inputs, addr) == fake_tx.test_input()
}

test many_inputs_cant_find() fail {
  let addr: Address = addresses.create_address(#"fade", #"")
  let inputs: List<Input> =
    [
      fake_tx.test_script_input(),
      fake_tx.test_input_with_datum_hash(),
      fake_tx.test_bad_input(),
      fake_tx.test_input(),
    ]
  find_first_input_with_datum(inputs, addr) == fake_tx.test_input()
}
