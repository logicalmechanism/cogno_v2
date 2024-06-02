use aiken/transaction.{Input, ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{AssetName, PolicyId}
use assist/count
use assist/data
use assist/find
use assist/payout
use assist/signing
use assist/types/hashes.{ValidatorHash}
use assist/values
use cogno_v2/types/cogno.{CognoDatum}
use cogno_v2/types/reference.{ReferenceDatum}
use cogno_v2/types/thread.{
  CommentThread, RemoveThread, ThreadDatum, ThreadRedeemer,
}

validator(
  // genesis token information
  genesis_pid: PolicyId,
  genesis_tkn: AssetName,
  // data reference hash
  data_ref_hash: ValidatorHash,
) {
  fn params(
    this_datum: ThreadDatum,
    redeemer: ThreadRedeemer,
    context: ScriptContext,
  ) -> Bool {
    expect Spend(output_reference) = context.purpose
    when redeemer is {
      // removes the utxo entirely from the contract
      RemoveThread -> {
        // the transaction being validated
        let Transaction {
          inputs,
          outputs,
          reference_inputs,
          extra_signatories,
          ..
        } = context.transaction
        // get reference data stuff
        let ref_addr: Address = credential.from_script(data_ref_hash)
        let ref_input: Input = find.input_by_addr(reference_inputs, ref_addr)
        expect ref_datum: ReferenceDatum = data.input_datum(ref_input)
        // the cogno contract
        let cogno_addr: Address = credential.from_script(ref_datum.cogno)
        let cogno_input: Input =
          find.input_by_addr(reference_inputs, cogno_addr)
        expect cogno_datum: CognoDatum = data.input_datum(cogno_input)
        // this input is being validated
        let this_input: Input = find.input_by_ref(inputs, output_reference)
        // this script address
        let this_addr: Address = this_input.output.address
        //
        // If the owner of the cogno associated with this thread signs the
        // transaction then it can be removed from the contract.
        //
        and {
          // owner must sign
          signing.verify_sig(extra_signatories, cogno_datum.owner.pkh)?,
          // single script input, no script output
          count.inputs_by_addr(inputs, this_addr, 1)?,
          count.outputs_by_addr(outputs, this_addr, 0)?,
          // must be the correct reference data
          values.prove_exact_nft(
            ref_input.output.value,
            genesis_pid,
            genesis_tkn,
          )?,
          // must be correct cogno
          values.prove_exact_nft(
            cogno_input.output.value,
            ref_datum.policy_id,
            this_datum.tkn,
          )?,
        }
      }
      // updates the metadata and can change the minimum lovelace
      CommentThread(comment) -> {
        let Transaction { inputs, outputs, .. } = context.transaction
        // this input is being validated
        let this_input: Input = find.input_by_ref(inputs, output_reference)
        // this script address
        let this_addr: Address = this_input.output.address
        // this prevents bricking the utxo with the empty datum attack
        expect that_datum: ThreadDatum =
          find.output_datum_by_addr(outputs, this_addr)
        //
        // Send at least this value to this address with a new comment inside
        // the datum. This transaction can be done by anyone.
        //
        and {
          // send at least this value to this address
          payout.at_least(this_addr, this_input.output.value, outputs)?,
          // single script input
          count.inputs_by_addr(inputs, this_addr, 1)?,
          // single script output
          count.outputs_by_addr(outputs, this_addr, 1)?,
          // must be a valid comment on the thread
          thread.is_valid_comment(this_datum, that_datum, comment)?,
        }
      }
    }
  }
}
