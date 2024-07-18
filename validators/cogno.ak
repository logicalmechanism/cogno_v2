//// The Cogno profile contract for holding the cogno data. UTxOs inside this
//// contract hold the profile and moderation data for a cogno. It can only
//// be removed or updated. Each cogno is supposed to co-exist with a cafebabe
//// pointer token.
////

use aiken/transaction.{Input, ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{AssetName, PolicyId, Value}
use assist/count
use assist/data
use assist/find
use assist/minting
use assist/payout
use assist/signing
use assist/types/hashes.{ValidatorHash}
use assist/values
use cogno_v2/types/cogno.{CognoDatum, CognoRedeemer, RemoveCogno, UpdateCogno}
use cogno_v2/types/reference.{ReferenceDatum}

validator(
  // genesis token information
  genesis_pid: PolicyId,
  genesis_tkn: AssetName,
  // data reference hash
  data_ref_hash: ValidatorHash,
) {
  fn params(
    this_datum: CognoDatum,
    redeemer: CognoRedeemer,
    context: ScriptContext,
  ) -> Bool {
    expect Spend(output_reference) = context.purpose
    when redeemer is {
      // removes the utxo entirely from the contract
      RemoveCogno -> {
        // the transaction being validated
        let Transaction {
          inputs,
          outputs,
          reference_inputs,
          extra_signatories,
          mint,
          ..
        } = context.transaction
        // get reference data stuff
        let ref_addr: Address = credential.from_script(data_ref_hash)
        let ref_input: Input =
          reference.find_first_input_with_datum(reference_inputs, ref_addr)
        expect ref_datum: ReferenceDatum = data.input_datum(ref_input)
        // this input is being validated
        let this_input: Input = find.input_by_ref(inputs, output_reference)
        // this script address
        let this_addr: Address = this_input.output.address
        let mint_list: List<(PolicyId, AssetName, Int)> =
          mint
            |> value.from_minted_value()
            |> value.flatten()
        //
        // Remove a cogno by burning the cafebabe token if it exists. This
        // transaction is valid if and only if there exists a valid signature.
        // If the cafebabe token doesn't exist then it is still removeable.
        //
        and {
          // owner must sign
          signing.verify_sig(extra_signatories, this_datum.owner.pkh)?,
          // single script input, no script output
          count.inputs_by_addr(inputs, this_addr, 1)?,
          count.outputs_by_addr(outputs, this_addr, 0)?,
          // must be the correct reference data
          values.prove_exact_nft(
            ref_input.output.value,
            genesis_pid,
            genesis_tkn,
          )?,
          // must burn cafebabe token if it exists
          or {
            // if cogno exists then burn it
            and {
              values.prove_nft(
                this_input.output.value,
                ref_datum.cogno_policy_id,
              )?,
              minting.by_prefix(
                mint_list,
                ref_datum.cogno_policy_id,
                #"cafebabe",
                -1,
              )?,
            },
            // if it doesn't exist then you can still remove it
            True,
          },
        }
      }
      // updates the metadata and can change the minimum lovelace
      UpdateCogno -> {
        let Transaction { inputs, outputs, extra_signatories, .. } =
          context.transaction
        // this input is being validated
        let this_input: Input = find.input_by_ref(inputs, output_reference)
        // this script address
        let this_addr: Address = this_input.output.address
        // that value going back to the contract
        let that_value: Value =
          this_input.output.value |> value.without_lovelace
        // this prevents bricking the utxo with the empty datum attack
        expect that_datum: CognoDatum =
          find.output_datum_by_addr(outputs, this_addr)
        //
        // Send at least that value to this address if and only if the owner
        // signs the transaction. The owner of the cogno can not change but
        // the profile information can change to anything.
        //
        and {
          // send at least that value to this address
          payout.at_least(this_addr, that_value, outputs)?,
          // owner must sign
          signing.verify_sig(extra_signatories, this_datum.owner.pkh)?,
          // single script input
          count.inputs_by_addr(inputs, this_addr, 1)?,
          // single script output
          count.outputs_by_addr(outputs, this_addr, 1)?,
          // the owner can not change
          (this_datum.owner == that_datum.owner)?,
        }
      }
    }
  }
}
