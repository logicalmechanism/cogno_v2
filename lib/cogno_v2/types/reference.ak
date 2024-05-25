use aiken/transaction/value.{PolicyId}
use assist/types/hashes.{ValidatorHash}

pub type ReferenceDatum {
  // this is needed in tag and cogno
  policy_id: PolicyId,
  // this is needed tag and minter
  cogno: ValidatorHash,
}
