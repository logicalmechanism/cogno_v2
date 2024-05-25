#!/bin/bash
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

# thread contract
thread_script_path="../../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})

#
collat_address=$(cat ../wallets/collat-wallet/payment.addr)
collat_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/collat-wallet/payment.vkey)

# the policy id
token_name=$(cat ../data/cogno/token.name)

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

cp ../data/thread/thread-datum.json ../data/thread/updated-thread-datum.json

python3 -c "import sys, json; sys.path.append('../py/'); from create_comment import update_datum; update_datum('comment.txt', '../data/thread/updated-thread-datum.json','../data/thread/comment-redeemer.json');"

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
TXIN=$(jq -r --arg alltxin "" --arg token_name "$token_name" 'to_entries[] | select(.inlineDatum.fields[5].bytes=$token_name) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
thread_tx_in=${TXIN::-8}

echo Thread UTxO: ${thread_tx_in}

current_lovelace=$(jq -r --arg token_name "$token_name" 'to_entries[] | select(.inlineDatum.fields[5].bytes=$token_name) | .value.value.lovelace' ../tmp/script_utxo.json)

echo Current Lovelace On Thread : ${current_lovelace}

UTXO_VALUE=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file ../tmp/protocol.json \
    --tx-out-inline-datum-file ../data/thread/updated-thread-datum.json \
    --tx-out="${thread_script_address} + 5000000" | tr -dc '0-9')

difference=$((${current_lovelace} - ${UTXO_VALUE}))
if [ "$difference" -ge "0" ]; then
    echo "Minimum ADA Remains Constant"
    min_utxo=${current_lovelace}
else
    echo "Minimum ADA Increasing"
    min_utxo=${UTXO_VALUE}
fi

thread_address_out="${thread_script_address} + ${min_utxo}"

echo "Thread OUTPUT:" ${thread_address_out}

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

thread_ref_utxo=$(${cli} transaction txid --tx-file ../tmp/utxo-thread_contract.plutus.signed )

# Add metadata to this build function for nfts with data
echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file ../tmp/tx.draft \
    --change-address ${user_address} \
    --tx-in-collateral="${collat_utxo}" \
    --tx-in ${user_tx_in} \
    --tx-in ${thread_tx_in} \
    --spending-tx-in-reference="${thread_ref_utxo}#1" \
    --spending-plutus-script-v2 \
    --spending-reference-tx-in-inline-datum-present \
    --spending-reference-tx-in-redeemer-file ../data/thread/comment-redeemer.json \
    --tx-out="${thread_address_out}" \
    --tx-out-inline-datum-file ../data/thread/updated-thread-datum.json \
    --required-signer-hash ${user_pkh} \
    --required-signer-hash ${collat_pkh} \
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

cp ../data/thread/updated-thread-datum.json ../data/thread/thread-datum.json