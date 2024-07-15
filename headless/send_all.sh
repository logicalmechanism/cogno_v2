#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

rm ./tmp/tx.signed || true

# get params
${cli} query protocol-parameters ${network} --out-file ./tmp/protocol.json

# Sender Address
sender_path="wallets/reference-wallet/"
sender_address=$(cat ${sender_path}payment.addr)

# Receiver Address
# receiver_address=$(cat ${sender_path}payment.addr)
receiver_address=$(jq -r '.change_address' ../config.json)
#
# exit
#
echo -e "\033[0;36m Gathering UTxO Information  \033[0m"
${cli} query utxo \
    ${network} \
    --address ${sender_address} \
    --out-file tmp/sender_utxo.json

TXNS=$(jq length tmp/sender_utxo.json)
if [ "${TXNS}" -eq "0" ]; then
   echo -e "\n \033[0;31m NO UTxOs Found At ${sender_address} \033[0m \n";
   exit;
fi
alltxin=""
TXIN=$(jq -r --arg alltxin "" 'keys[] | . + $alltxin + " --tx-in"' tmp/sender_utxo.json)
seller_tx_in=${TXIN::-8}

echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file ./tmp/tx.draft \
    --change-address ${receiver_address} \
    --tx-in ${seller_tx_in} \
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
    --signing-key-file ${sender_path}payment.skey \
    --tx-body-file ./tmp/tx.draft \
    --out-file ./tmp/tx.signed \
    ${network}
#
# exit
#
echo -e "\033[0;36m Submitting \033[0m"
${cli} transaction submit \
    ${network} \
    --tx-file ./tmp/tx.signed

tx=$(${cli} transaction txid --tx-file ./tmp/tx.signed)
echo "Tx Hash:" $tx