#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# get params
${cli} query protocol-parameters ${network} --out-file ../tmp/protocol.json

# user
user_address=$(cat ../wallets/user-1-wallet/payment.addr)
user_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/user-1-wallet/payment.vkey)

# reference data contract
reference_script_path="../../contracts/reference_contract.plutus"
reference_script_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})

# cogno contract
cogno_script_path="../../contracts/cogno_contract.plutus"
cogno_script_address=$(${cli} address build --payment-script-file ${cogno_script_path} ${network})

# collateral
collat_address=$(cat ../wallets/collat-wallet/payment.addr)
collat_pkh=$(${cli} address key-hash --payment-verification-key-file ../wallets/collat-wallet/payment.vkey)

# the policy id
policy_id=$(cat ../../hashes/cogno_minter_contract.hash)
token_name=$(cat ../data/cogno/token.name)

# check if the user already has a cogno token
echo -e "\033[0;36m Gathering Cogno UTxO Information  \033[0m"
${cli} query utxo \
    --address ${cogno_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
exist_check=$(jq -r --arg pkh "$user_pkh" 'to_entries[] | select(.value.inlineDatum.fields[0].fields[0].bytes==$pkh) | .key' ../tmp/script_utxo.json)
if [ -z "$exist_check" ]; then
    echo "Cogno Does Not Exist For ${user_pkh}"
    exit;
fi

current_datum=$(jq -r --arg pkh "$user_pkh" 'to_entries[] | select(.value.inlineDatum.fields[0].fields[0].bytes==$pkh) | .value.inlineDatum' ../tmp/script_utxo.json)
python3 -c "import sys, json; sys.path.append('../py/'); from cogno import update_datum; update_datum(${current_datum}, 'cogno.json', '../data/cogno/cogno-datum.json');"

TXIN=$(jq -r --arg alltxin "" --arg policy_id "$policy_id" --arg token_name "$token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key | . + $alltxin + " --tx-in"' ../tmp/script_utxo.json)
cogno_tx_in=${TXIN::-8}

echo Cogno UTxO: ${cogno_tx_in}

echo Updating: 1 ${policy_id}.${token_name}

# Prompt user for confirmation
read -p "$(echo -e "\033[1;37\033[1;36m\nPress\033[0m \033[1;32mEnter\033[0m \033[1;36mTo Update Your Cogno Or Any Other Key To Exit:\n\033[0m")" -n 1 -r
echo -ne '\033[1A\033[2K\r'

# Check if input is empty (user pressed Enter)
if [[ -z $REPLY ]]; then
    echo "Updating your Cogno..."
else
    echo "Operation cancelled."
    exit;
fi

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
TXIN=$(jq -r --arg alltxin "" 'keys[] | . + $alltxin + " --tx-in"' ../tmp/user_utxo.json)
user_tx_in=${TXIN::-8}

UTXO_VALUE=$(${cli} transaction calculate-min-required-utxo \
    --babbage-era \
    --protocol-params-file ../tmp/protocol.json \
    --tx-out-inline-datum-file ../data/cogno/cogno-datum.json \
    --tx-out="${cogno_script_address} + 5000000 + 1 ${policy_id}.${token_name}" | tr -dc '0-9')
cogno_address_out="${cogno_script_address} + ${UTXO_VALUE} + 1 ${policy_id}.${token_name}"

#
# exit
#

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

cogno_ref_utxo=$(${cli} transaction txid --tx-file ../tmp/utxo-cogno_contract.plutus.signed)

# Add metadata to this build function for nfts with data
echo -e "\033[0;36m Building Tx \033[0m"
FEE=$(${cli} transaction build \
    --babbage-era \
    --out-file ../tmp/tx.draft \
    --change-address ${user_address} \
    --tx-in-collateral="${collat_utxo}" \
    --tx-in ${user_tx_in} \
    --tx-in ${cogno_tx_in} \
    --spending-tx-in-reference="${cogno_ref_utxo}#1" \
    --spending-plutus-script-v2 \
    --spending-reference-tx-in-inline-datum-present \
    --spending-reference-tx-in-redeemer-file ../data/cogno/update-redeemer.json \
    --tx-out="${cogno_address_out}" \
    --tx-out-inline-datum-file ../data/cogno/cogno-datum.json \
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
