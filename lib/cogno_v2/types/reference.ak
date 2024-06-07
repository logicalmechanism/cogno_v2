use aiken/transaction/value.{PolicyId}
use assist/types/hashes.{ValidatorHash}

pub type ReferenceDatum {
  cogno_policy_id: PolicyId,
  thread_policy_id: PolicyId,
  cogno: ValidatorHash,
  thread: ValidatorHash,
}
