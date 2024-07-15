#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

mkdir -p ./tmp
${cli} query protocol-parameters ${network} --out-file ./tmp/protocol.json

# Addresses
reference_address=$(cat ./wallets/reference-wallet/payment.addr)

# perma lock the script references to the reference contract
reference_script_path="../contracts/reference_contract.plutus"
script_reference_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})

# address to send the leftover ada too
change_address=$(jq -r '.change_address' ../config.json)


echo -e "\033[0;35m\nGathering UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${reference_address} \
    --out-file ./tmp/reference_utxo.json

TXNS=$(jq length ./tmp/reference_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${reference_address} \033[0m \n";
   exit;
fi
alltxin=""
TXIN=$(jq -r --arg alltxin "" 'to_entries[] | select(.value.value | length < 2) | .key | . + $alltxin + " --tx-in"' ./tmp/reference_utxo.json)
ref_tx_in=${TXIN::-8}
changeAmount=$(jq '[.. | objects | .lovelace] | add' ./tmp/reference_utxo.json)

counter=0
# Loop through each file in the directory
echo -e "\033[0;33m\nStart Building Tx Chain \033[0m"
for contract in $(ls "../contracts"/* | sort -V)
do
    echo -e "\033[1;37m --------------------------------------------------------------------------------\033[0m"
    echo -e "\033[1;35m\n${contract}\033[0m" 
    file_name=$(basename "$contract")
    # Increment the counter
    ((counter++)) || true
    
    # get the required lovelace
    min_utxo=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file ./tmp/protocol.json \
    --tx-out-reference-script-file ${contract} \
    --tx-out="${script_reference_address} + 1000000" | tr -dc '0-9')
    # build the utxo
    script_reference_utxo="${script_reference_address} + ${min_utxo}"
    echo -e "\033[0;32m\nCreating ${file_name} Script:\n" ${script_reference_utxo} " \033[0m"


    ${cli} transaction build-raw \
    --babbage-era \
    --protocol-params-file ./tmp/protocol.json \
    --out-file ./tmp/tx.draft \
    --tx-in ${ref_tx_in} \
    --tx-out="${reference_address} + ${changeAmount}" \
    --tx-out="${script_reference_utxo}" \
    --tx-out-reference-script-file ${contract} \
    --fee 900000

    FEE=$(${cli} transaction calculate-min-fee \
        --tx-body-file ./tmp/tx.draft \
        --protocol-params-file ./tmp/protocol.json \
        --witness-count 1)
    echo -e "\033[0;35mFEE: ${FEE} \033[0m"
    fee=$(echo $FEE | rev | cut -c 9- | rev)

    changeAmount=$((${changeAmount} - ${min_utxo} - ${fee}))

    ${cli} transaction build-raw \
        --babbage-era \
        --protocol-params-file ./tmp/protocol.json \
        --out-file ./tmp/tx.draft \
        --tx-in ${ref_tx_in} \
        --tx-out="${reference_address} + ${changeAmount}" \
        --tx-out="${script_reference_utxo}" \
        --tx-out-reference-script-file ${contract} \
        --fee ${fee}

    ${cli} transaction sign \
        --signing-key-file ./wallets/reference-wallet/payment.skey \
        --tx-body-file ./tmp/tx.draft \
        --out-file ./tmp/utxo-${file_name}.signed \
        ${network}

    tx_id=$(${cli} transaction txid --tx-body-file ./tmp/tx.draft)
    ref_tx_in=${tx_id}#0
    echo 
    echo -e "\033[0;36m$file_name: $tx_id#1 \033[0m"

done

${cli} transaction build-raw \
    --babbage-era \
    --protocol-params-file ./tmp/protocol.json \
    --out-file ./tmp/tx.draft \
    --tx-in ${ref_tx_in} \
    --tx-out="${change_address} + ${changeAmount}" \
    --fee 900000

FEE=$(${cli} transaction calculate-min-fee \
    --tx-body-file ./tmp/tx.draft \
    --protocol-params-file ./tmp/protocol.json \
    --witness-count 1)
echo -e "\033[0;35mFEE: ${FEE} \033[0m"
fee=$(echo $FEE | rev | cut -c 9- | rev)

changeAmount=$((${changeAmount} - ${fee}))

${cli} transaction build-raw \
    --babbage-era \
    --protocol-params-file ./tmp/protocol.json \
    --out-file ./tmp/tx.draft \
    --tx-in ${ref_tx_in} \
    --tx-out="${change_address} + ${changeAmount}" \
    --fee ${fee}

${cli} transaction sign \
    --signing-key-file ./wallets/reference-wallet/payment.skey \
    --tx-body-file ./tmp/tx.draft \
    --out-file ./tmp/change-tx.signed \
    ${network}

echo -e "\033[1;37m --------------------------------------------------------------------------------\033[0m"
# now submit them in that order
for contract in $(ls "../contracts"/* | sort -V)
do
    file_name=$(basename "${contract}")
    echo -e "\nSubmitting ${file_name}"
    # Perform operations on each file
    ${cli} transaction submit \
        ${network} \
        --tx-file ./tmp/utxo-${file_name}.signed
done

${cli} transaction submit \
    ${network} \
    --tx-file ./tmp/change-tx.signed

echo -e "\033[0;32m\nDone!\033[0m"