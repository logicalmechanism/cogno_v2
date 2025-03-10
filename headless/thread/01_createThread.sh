#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# get params
${cli} query protocol-parameters ${network} --out-file ../tmp/protocol.json

# thread contract
thread_script_path="../../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})

# reference data contract
reference_script_path="../../contracts/reference_contract.plutus"
reference_script_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})

# pays for tx
user_address=$(cat ../wallets/user-1-wallet/payment.addr)
user_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/user-1-wallet/payment.vkey)

# collat
collat_address=$(cat ../wallets/collat-wallet/payment.addr)
collat_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/collat-wallet/payment.vkey)

# the policy id
policy_id=$(cat ../../hashes/thread_minter_contract.hash)

echo -e "\033[0;36m Gathering UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${user_address} \
    --out-file ../tmp/user_utxo.json

TXNS=$(jq length ../tmp/user_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${user_address} \033[0m \n";
   exit;
fi

TXIN=$(jq -r --arg alltxin "" 'keys[] | . + $alltxin + " --tx-in"' ../tmp/user_utxo.json)
user_tx_in=${TXIN::-8}

echo "User UTxO:" $user_tx_in
cogno_token=$(cat ../data/cogno/token.name)

echo Cogno Token: ${cogno_token}

jq -r '' thread.json
python3 -c "import sys, json; sys.path.append('../py/'); from thread import create_datum; create_datum('thread.json', '${cogno_token}', '../data/thread/thread-datum.json');"

first_utxo=$(jq -r 'keys[0]' ../tmp/user_utxo.json)
string=${first_utxo}
IFS='#' read -ra array <<< "$string"

tx_idx_cbor=$(python3 -c "import cbor2;encoded=cbor2.dumps(${array[1]});print(encoded.hex())")
full_tkn="1abe11ed${tx_idx_cbor}${array[0]}"
tkn="${full_tkn:0:64}"

echo Minting: 1 ${policy_id}.${tkn}
# Prompt user for confirmation
read -p "$(echo -e "\033[1;37\033[1;36m\nPress\033[0m \033[1;32mEnter\033[0m \033[1;36mTo Create The Thread Or Any Other Key To Exit:\n\033[0m")" -n 1 -r
echo -ne '\033[1A\033[2K\r'

# Check if input is empty (user pressed Enter)
if [[ -z $REPLY ]]; then
    echo "Creating the thread..."
else
    echo "Operation cancelled."
    exit;
fi

MINT_ASSET="1 ${policy_id}.${tkn}"

UTXO_VALUE=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file ../tmp/protocol.json \
    --tx-out-inline-datum-file ../data/thread/thread-datum.json \
    --tx-out="${thread_script_address} + 5000000 + ${MINT_ASSET}" | tr -dc '0-9')

buffer_lovelace=0
min_utxo_value=$((${UTXO_VALUE} + ${buffer_lovelace}))
thread_address_out="${thread_script_address} + ${min_utxo_value} + ${MINT_ASSET}"

echo -e "\033[0;36m Gathering Collateral UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${collat_address} \
    --out-file ../tmp/collat_utxo.json
TXNS=$(jq length ../tmp/collat_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${collat_address} \033[0m \n";
   exit;
fi
collat_utxo=$(jq -r 'keys[0]' ../tmp/collat_utxo.json)

genesis_policy_id=$(cat ../../hashes/genesis_contract.hash)
genesis_tx_id=$(jq -r '.genesis_tx_id' ../../config.json)
genesis_tx_idx=$(jq -r '.genesis_tx_idx' ../../config.json)
genesis_tx_idx_cbor=$(python3 -c "import cbor2;encoded=cbor2.dumps(${genesis_tx_idx});print(encoded.hex())")
genesis_prefix="ca11ab1e"
full_genesis_tkn="${genesis_prefix}${genesis_tx_idx_cbor}${genesis_tx_id}"
genesis_tkn="${full_genesis_tkn:0:64}"
mint_genesis_asset="1 ${genesis_policy_id}.${genesis_tkn}"
echo -e "\033[1;36m\nGenesis Token: ${mint_genesis_asset} \033[0m"

echo -e "\033[0;36m Gathering Reference Script UTxO Information  \033[0m"
${cli} query utxo \
    --address ${reference_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
TXNS=$(jq length ../tmp/script_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${reference_script_address} \033[0m \n";
   exit;
fi

TXIN=$(jq -r --arg alltxin "" --arg policy_id "$genesis_policy_id" --arg token_name "$genesis_tkn" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
reference_script_tx_in=${TXIN::-8}
echo Data Reference UTxO: $reference_script_tx_in

minter_ref_utxo=$(${cli} transaction txid --tx-file ../tmp/utxo-thread_minter_contract.plutus.signed)
#
# exit
#
# Add metadata to this build function for nfts with data
echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file ../tmp/tx.draft \
    --change-address ${user_address} \
    --tx-in-collateral="${collat_utxo}" \
    --read-only-tx-in-reference ${reference_script_tx_in} \
    --tx-in ${user_tx_in} \
    --tx-out="${thread_address_out}" \
    --tx-out-inline-datum-file ../data/thread/thread-datum.json \
    --required-signer-hash ${user_pkh} \
    --required-signer-hash ${collat_pkh} \
    --mint="${MINT_ASSET}" \
    --mint-tx-in-reference="${minter_ref_utxo}#1" \
    --mint-plutus-script-v2 \
    --policy-id="${policy_id}" \
    --mint-reference-tx-in-redeemer-file ../data/minter/mint-redeemer.json \
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
    --signing-key-file ../wallets/user-1-wallet/payment.skey \
    --signing-key-file ../wallets/collat-wallet/payment.skey \
    --tx-body-file ../tmp/tx.draft \
    --out-file ../tmp/tx.signed \
    ${network}
#    
# exit
#
echo -e "\033[0;36m Submitting \033[0m"
${cli} transaction submit \
    ${network} \
    --tx-file ../tmp/tx.signed

tx=$(${cli} transaction txid --tx-file ../tmp/tx.signed)
echo "Tx Hash:" $tx