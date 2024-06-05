use aiken/transaction.{Input, Mint, ScriptContext, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{AssetName, PolicyId}
use assist/count
use assist/data
use assist/find
use assist/minting
use assist/payout
use assist/types/hashes.{TxHash, ValidatorHash}
use assist/values
use cogno_v2/types/minter.{BurnToken, MintRedeemer, MintToken}
use cogno_v2/types/reference.{ReferenceDatum}
use cogno_v2/types/thread.{ThreadDatum}
use cogno_v2/util

validator(
  // genesis token information
  genesis_pid: PolicyId,
  genesis_tkn: AssetName,
  // data reference hash
  data_ref_hash: ValidatorHash,
) {
  fn params(redeemer: MintRedeemer, context: ScriptContext) -> Bool {
    expect Mint(currency_symbol) = context.purpose
    when redeemer is {
      MintToken -> {
        let Transaction { inputs, reference_inputs, outputs, mint, .. } =
          context.transaction
        // get tx info
        let index: Int = find.first_input_index(inputs)
        let tx_hash: TxHash = find.first_input_txid(inputs)
        // get reference data stuff
        let ref_addr: Address = credential.from_script(data_ref_hash)
        let ref_input: Input = find.input_by_addr(reference_inputs, ref_addr)
        expect ref_datum: ReferenceDatum = data.input_datum(ref_input)
        let token_name: AssetName = util.token_name(tx_hash, index, #"1abe11ed")
        // what is being minted in this transaction
        let mint_list: List<(PolicyId, AssetName, Int)> =
          mint
            |> value.from_minted_value()
            |> value.flatten()
        // the thread contract
        let thread_addr: Address = credential.from_script(ref_datum.thread)
        expect _: ThreadDatum = find.output_datum_by_addr(outputs, thread_addr)
        //
        // The owner of the thread must sign the transactions that sends at 
        // least the cafebabe token to the thread address with a CognoDatum.
        //
        and {
          // prevent roll over double nft attack
          (index < 256)?,
          // must mint 1 pointer token
          minting.exact(mint_list, currency_symbol, token_name, 1)?,
          // data reference must be holding correct token
          values.prove_exact_nft(
            ref_input.output.value,
            genesis_pid,
            genesis_tkn,
          )?,
          // at least the token must go to thread contract
          payout.at_least(
            thread_addr,
            value.from_asset(currency_symbol, token_name, 1),
            outputs,
          )?,
          // can not spend anything from thread address
          count.outputs_by_addr(outputs, thread_addr, 1)?,
        }
      }
      BurnToken -> {
        let Transaction { mint, .. } = context.transaction
        // what is being minted in this transaction
        let mint_list: List<(PolicyId, AssetName, Int)> =
          mint
            |> value.from_minted_value()
            |> value.flatten()
        //
        // Burning can occur whenever but the only thing can be burned are
        // tokens that are prefixed with cafebabe.
        //
        minting.by_prefix(mint_list, currency_symbol, #"1abe11ed", -1)?
      }
    }
  }
}
