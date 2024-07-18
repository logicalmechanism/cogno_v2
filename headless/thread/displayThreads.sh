#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# thread contract
thread_script_path="../../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})

thread_policy_id=$(cat ../../hashes/thread_minter_contract.hash)

# check if the user already has a cogno token
${cli} query utxo \
    --address ${thread_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json

python3 -c "import sys, json; sys.path.append('../py/'); from thread import display; display('../tmp/script_utxo.json', '${thread_policy_id}');"
