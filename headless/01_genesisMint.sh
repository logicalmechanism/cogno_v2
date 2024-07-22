#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

# get params
${cli} query protocol-parameters ${network} --out-file tmp/protocol.json

# genesis contract
reference_script_path="../contracts/reference_contract.plutus"
reference_script_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})

# the genesis token contract and policy
genesis_script_path="../contracts/genesis_contract.plutus"
genesis_policy_id=$(cat ../hashes/genesis_contract.hash)

# starter wallet
starter_address=$(cat wallets/starter-wallet/payment.addr)
starter_pkh=$(${cli} address key-hash --payment-verification-key-file wallets/starter-wallet/payment.vkey)

# change address for left over lovelace
change_address=$(jq -r '.change_address' ../config.json)

# collat wallet
collat_address=$(cat wallets/collat-wallet/payment.addr)
collat_pkh=$(${cli} address key-hash --payment-verification-key-file wallets/collat-wallet/payment.vkey)

# Prompt user for confirmation
read -p "$(echo -e "\033[1;37\033[1;36m\nPress\033[0m \033[1;32mEnter\033[0m \033[1;36mTo Mint Genesis Token Or Any Other Key To Exit:\n\033[0m")" -n 1 -r
echo -ne '\033[1A\033[2K\r'

# Check if input is empty (user pressed Enter)
if [[ -z $REPLY ]]; then
    echo "Minting Genesis Token..."
else
    echo "Operation cancelled."
    exit;
fi

echo -e "\033[0;36m Gathering Starter UTxO Information\033[0m"
${cli} query utxo \
    ${network} \
    --address ${starter_address} \
    --out-file tmp/starter_utxo.json

TXNS=$(jq length tmp/starter_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${starter_address} \033[0m \n";
   exit;
fi

TXIN=$(jq -r --arg alltxin "" 'keys[] | . + $alltxin + " --tx-in"' tmp/starter_utxo.json)
starter_tx_in=${TXIN::-8}

echo "Starter UTxO:" $starter_tx_in

# the pointer token
genesis_tx_id=$(jq -r '.genesis_tx_id' ../config.json)
genesis_tx_idx=$(jq -r '.genesis_tx_idx' ../config.json)
genesis_tx_idx_cbor=$(python3 -c "import cbor2;encoded=cbor2.dumps(${genesis_tx_idx});print(encoded.hex())")
genesis_prefix="ca11ab1e"
full_genesis_tkn="${genesis_prefix}${genesis_tx_idx_cbor}${genesis_tx_id}"
genesis_tkn="${full_genesis_tkn:0:64}"
mint_genesis_asset="1 ${genesis_policy_id}.${genesis_tkn}"
echo -e "\033[1;36m\nGenesis Token: ${mint_genesis_asset} \033[0m"

# mint 1 genesis token and burn 100M old fet
mint_asset="${mint_genesis_asset}"

utxo_value=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file tmp/protocol.json \
    --tx-out-inline-datum-file data/reference/reference-datum.json \
    --tx-out="${reference_script_address} + 5000000 + ${mint_genesis_asset}" | tr -dc '0-9')
reference_script_out="${reference_script_address} + ${utxo_value} + ${mint_genesis_asset}"

echo "Genesis OUTPUT:" ${reference_script_out}
#
# exit
#
echo -e "\033[0;36m Gathering Collateral UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${collat_address} \
    --out-file tmp/collat_utxo.json
TXNS=$(jq length tmp/collat_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${collat_address} \033[0m \n";
   exit;
fi
collat_utxo=$(jq -r 'keys[0]' tmp/collat_utxo.json)

genesis_ref_utxo=$(${cli} transaction txid --tx-file tmp/utxo-genesis_contract.plutus.signed)

echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file tmp/tx.draft \
    --change-address ${change_address} \
    --tx-in-collateral="${collat_utxo}" \
    --tx-in ${starter_tx_in} \
    --tx-out="${reference_script_out}" \
    --tx-out-inline-datum-file data/reference/reference-datum.json \
    --required-signer-hash ${collat_pkh} \
    --required-signer-hash ${starter_pkh} \
    --mint="${mint_asset}" \
    --mint-tx-in-reference="${genesis_ref_utxo}#1" \
    --mint-plutus-script-v2 \
    --policy-id="${genesis_policy_id}" \
    --mint-reference-tx-in-redeemer-file data/genesis/genesis-redeemer.json \
    ${network})

IFS=':' read -ra VALUE <<< "${FEE}"
IFS=' ' read -ra FEE <<< "${VALUE[1]}"
FEE=${FEE[1]}
echo -e "\033[1;32m Fee: \033[0m" $FEE
#
# exit
#
echo -e "\033[0;36m Signing \033[0m"
${cli} transaction sign \
    --signing-key-file wallets/starter-wallet/payment.skey \
    --signing-key-file wallets/collat-wallet/payment.skey \
    --tx-body-file tmp/tx.draft \
    --out-file tmp/tx.signed \
    ${network}
#    
# exit
#
echo -e "\033[0;36m Submitting \033[0m"
${cli} transaction submit \
    ${network} \
    --tx-file tmp/tx.signed

tx=$(${cli} transaction txid --tx-file tmp/tx.signed)
echo "Tx Hash:" $tx
