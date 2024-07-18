use aiken/transaction.{InlineDatum, Input}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{PolicyId}
use assist/types/hashes.{ValidatorHash}

pub type ReferenceDatum {
  cogno_policy_id: PolicyId,
  thread_policy_id: PolicyId,
  cogno: ValidatorHash,
  thread: ValidatorHash,
}

pub fn find_first_input_with_datum(inputs: List<Input>, addr: Address) -> Input {
  when inputs is {
    [input, ..rest] ->
      if input.output.address == addr {
        when input.output.datum is {
          InlineDatum(_) -> input
          _ -> find_first_input_with_datum(rest, addr)
        }
      } else {
        find_first_input_with_datum(rest, addr)
      }
    [] -> fail @"No Input Found By Address With Inline Datum"
  }
}
