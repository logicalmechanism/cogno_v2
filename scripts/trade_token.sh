#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

rm ./tmp/tx.signed || true

# get params
${cli} query protocol-parameters ${network} --out-file ./tmp/protocol.json

# Sender Address
sender_path="wallets/fraction-estate-wallet/"
sender_address=$(cat ${sender_path}payment.addr)

# Receiver Address
# receiver_address=$(cat ${sender_path}payment.addr)
receiver_address="addr_test1qrvnxkaylr4upwxfxctpxpcumj0fl6fdujdc72j8sgpraa9l4gu9er4t0w7udjvt2pqngddn6q4h8h3uv38p8p9cq82qav4lmp"

# ENTER ASSET HERE
policy_id=$(cat ../hashes/fet_minter_contract.hash)
prefix_333="0014df10"
fet_name="4672616374696f6e2045737461746520546f6b656e"
token_name="${prefix_333}${fet_name}"
amount=694201234567891
# This is what is being sent to the receiver address
asset="${amount} ${policy_id}.${token_name}"

min_utxo=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file tmp/protocol.json \
    --tx-out="${receiver_address} + 5000000 + ${asset}" | tr -dc '0-9')

tokens_to_be_traded="${receiver_address} + ${min_utxo} + ${asset}"
echo -e "\nSending This Token:\n" ${tokens_to_be_traded}

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
    --change-address ${sender_address} \
    --tx-in ${seller_tx_in} \
    --tx-out="${tokens_to_be_traded}" \
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