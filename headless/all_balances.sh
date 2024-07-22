#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

# get current parameters
mkdir -p ./tmp
${cli} query protocol-parameters ${network} --out-file ./tmp/protocol.json
${cli} query tip ${network} | jq
${cli} query tx-mempool info ${network} | jq

# reference data contract
reference_script_path="../contracts/reference_contract.plutus"
reference_script_address=$(${cli} address build --payment-script-file ${reference_script_path} ${network})
echo -e "\033[1;35m Reference Data Contract Address: \033[0m" 
echo -e "\n \033[1;35m ${reference_script_address} \033[0m \n";
${cli} query utxo --address ${reference_script_address} ${network}
${cli} query utxo --address ${reference_script_address} ${network} --out-file ./tmp/current_reference.utxo

# cogno contract
cogno_script_path="../contracts/cogno_contract.plutus"
cogno_script_address=$(${cli} address build --payment-script-file ${cogno_script_path} ${network})
echo -e "\033[1;35m Cogno Contract Address: \033[0m" 
echo -e "\n \033[1;35m ${cogno_script_address} \033[0m \n";
${cli} query utxo --address ${cogno_script_address} ${network}
${cli} query utxo --address ${cogno_script_address} ${network} --out-file ./tmp/current_cogno.utxo

# thread contract
thread_script_path="../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})
echo -e "\033[1;35m Thread Contract Address: \033[0m" 
echo -e "\n \033[1;35m ${thread_script_address} \033[0m \n";
${cli} query utxo --address ${thread_script_address} ${network}
${cli} query utxo --address ${thread_script_address} ${network} --out-file ./tmp/current_thread.utxo

# Loop through each -wallet folder
for wallet_folder in wallets/*-wallet; do
    # Check if payment.addr file exists in the folder
    if [ -f "${wallet_folder}/payment.addr" ]; then
        addr=$(cat ${wallet_folder}/payment.addr)
        echo -e "\033[1;37m\n--------------------------------------------------------------------------------\n\033[0m"
        echo -e "\033[1;34m $wallet_folder\033[0m\n\n\033[1;32m $addr\033[0m"
        echo -e "\033[1;33m"
        # Run the cardano-cli command with the reference address and testnet magic
        ${cli} query utxo --address ${addr} ${network}
        ${cli} query utxo --address ${addr} ${network} --out-file ./tmp/"${addr}.json"

        baseLovelace=$(jq '[.. | objects | .lovelace] | add' ./tmp/"${addr}.json")
        echo -e "\033[0m"

        echo -e "\033[1;36m"
        ada=$(echo "scale = 6;${baseLovelace} / 1000000" | bc -l)
        echo -e "TOTAL ADA:" ${ada}
        echo -e "\033[0m"
    fi
done
