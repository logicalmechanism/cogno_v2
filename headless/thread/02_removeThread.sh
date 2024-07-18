#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# get params
${cli} query protocol-parameters ${network} --out-file ../tmp/protocol.json

#
user_address=$(cat ../wallets/user-1-wallet/payment.addr)
user_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/user-1-wallet/payment.vkey)

# reference data contract
reference_script_path="../../contracts/reference_contract.plutus"
reference_script_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})

# cogno contract
cogno_script_path="../../contracts/cogno_contract.plutus"
cogno_script_address=$(${cli} address build --payment-script-file ${cogno_script_path} ${network})

# thread contract
thread_script_path="../../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})

# collat
collat_address=$(cat ../wallets/collat-wallet/payment.addr)
collat_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/collat-wallet/payment.vkey)

# the policy id
cogno_policy_id=$(cat ../../hashes/cogno_minter_contract.hash)
thread_policy_id=$(cat ../../hashes/thread_minter_contract.hash)
cogno_token_name=$(cat ../data/cogno/token.name)
thread_token_name=$(cat ../data/thread/token.name)

echo $cogno_token_name

echo -e "\033[0;36m Gathering User UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${user_address} \
    --out-file ../tmp/user_utxo.json

TXNS=$(jq length ../tmp/user_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${user_address} \033[0m \n";
   exit;
fi
alltxin=""
TXIN=$(jq -r --arg alltxin "" 'keys[] | . + $alltxin + " --tx-in"' ../tmp/user_utxo.json)
user_tx_in=${TXIN::-8}

BURN_ASSET="-1 ${thread_policy_id}.${thread_token_name}"

echo Burning: ${BURN_ASSET}

#
# exit
#

# get script utxo
echo -e "\033[0;36m Gathering Thread UTxO Information  \033[0m"
${cli} query utxo \
    --address ${thread_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
TXNS=$(jq length ../tmp/script_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${thread_script_address} \033[0m \n";
.   exit;
fi
alltxin=""
TXIN=$(jq -r --arg alltxin "" --arg token_name "$cogno_token_name" 'to_entries[] | select(.value.inlineDatum.fields[5].bytes==$token_name) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
thread_tx_in=${TXIN::-8}

echo Thread UTxO: ${thread_tx_in}

echo -e "\033[0;36m Gathering Cogno UTxO Information  \033[0m"
${cli} query utxo \
    --address ${cogno_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
TXNS=$(jq length ../tmp/script_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${cogno_script_address} \033[0m \n";
.   exit;
fi
alltxin=""
TXIN=$(jq -r --arg alltxin "" --arg policy_id "$cogno_policy_id" --arg token_name "$cogno_token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
cogno_tx_in=${TXIN::-8}

echo Cogno UTxO: ${cogno_tx_in}

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
alltxin=""
TXIN=$(jq -r --arg alltxin "" --arg policy_id "$genesis_policy_id" --arg token_name "$genesis_tkn" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
reference_script_tx_in=${TXIN::-8}

echo Data Reference UTxO: $reference_script_tx_in

thread_ref_utxo=$(${cli} transaction txid --tx-file ../tmp/utxo-thread_contract.plutus.signed )
minter_ref_utxo=$(${cli} transaction txid --tx-file ../tmp/utxo-thread_minter_contract.plutus.signed )

# Add metadata to this build function for nfts with data
echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file ../tmp/tx.draft \
    --change-address ${user_address} \
    --tx-in-collateral="${collat_utxo}" \
    --read-only-tx-in-reference ${reference_script_tx_in} \
    --read-only-tx-in-reference ${cogno_tx_in} \
    --tx-in ${user_tx_in} \
    --tx-in ${thread_tx_in} \
    --spending-tx-in-reference="${thread_ref_utxo}#1" \
    --spending-plutus-script-v2 \
    --spending-reference-tx-in-inline-datum-present \
    --spending-reference-tx-in-redeemer-file ../data/thread/remove-redeemer.json \
    --required-signer-hash ${user_pkh} \
    --required-signer-hash ${collat_pkh} \
    --mint="${BURN_ASSET}" \
    --mint-tx-in-reference="${minter_ref_utxo}#1" \
    --mint-plutus-script-v2 \
    --policy-id="${thread_policy_id}" \
    --mint-reference-tx-in-redeemer-file ../data/minter/burn-redeemer.json \
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