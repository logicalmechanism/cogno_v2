#!/bin/bash
set -e

# create directories if dont exist
mkdir -p contracts
mkdir -p hashes

# remove old files
rm contracts/* || true
rm hashes/* || true
rm -fr build/ || true

# Build, Apply, Convert
echo -e "\033[1;34m Building Contracts \033[0m"

# remove all traces for production
aiken build --trace-level silent --filter-traces user-defined

# keep the traces for testing
# aiken build --trace-level verbose --filter-traces all

ran=$(jq -r '.random_string' config.json)
ran_cbor=$(python3 -c "import cbor2;hex_string='${ran}';data = bytes.fromhex(hex_string);encoded = cbor2.dumps(data);print(encoded.hex())")

echo -e "\033[1;33m\nBuilding Reference Data Contract \033[0m"
aiken blueprint apply -o plutus.json -v reference.params "${ran_cbor}"
aiken blueprint convert -v reference.params > contracts/reference_contract.plutus
cardano-cli transaction policyid --script-file contracts/reference_contract.plutus > hashes/reference_contract.hash
echo -e "\033[1;33m Reference Data Contract Hash: $(cat hashes/reference_contract.hash) \033[0m"

# reference contract hash
ref_hash=$(cat hashes/reference_contract.hash)
ref_hash_cbor=$(python3 -c "import cbor2;hex_string='${ref_hash}';data=bytes.fromhex(hex_string);encoded=cbor2.dumps(data);print(encoded.hex())")

# genesis tx id#idx
genesis_tx_id=$(jq -r '.genesis_tx_id' config.json)
genesis_tx_idx=$(jq -r '.genesis_tx_idx' config.json)
genesis_tx_id_cbor=$(python3 -c "import cbor2;hex_string='${genesis_tx_id}';data=bytes.fromhex(hex_string);encoded=cbor2.dumps(data);print(encoded.hex())")
genesis_tx_idx_cbor=$(python3 -c "import cbor2;encoded=cbor2.dumps(${genesis_tx_idx});print(encoded.hex())")

echo -e "\033[1;33m\nBuilding Genesis Contract \033[0m"
aiken blueprint apply -o plutus.json -v genesis.params "${genesis_tx_id_cbor}"
aiken blueprint apply -o plutus.json -v genesis.params "${genesis_tx_idx_cbor}"
aiken blueprint apply -o plutus.json -v genesis.params "${ref_hash_cbor}"
aiken blueprint convert -v genesis.params > contracts/genesis_contract.plutus
cardano-cli transaction policyid --script-file contracts/genesis_contract.plutus > hashes/genesis_contract.hash
echo -e "\033[1;33m Genesis Contract Hash: $(cat hashes/genesis_contract.hash) \033[0m"

# the pointer token
genesis_prefix="ca11ab1e"
genesis_pid=$(cat hashes/genesis_contract.hash)
full_genesis_tkn="${genesis_prefix}${genesis_tx_idx_cbor}${genesis_tx_id}"
genesis_tkn="${full_genesis_tkn:0:64}"
echo -e "\033[1;36m\nGenesis Token: 1 ${genesis_pid}.${genesis_tkn} \033[0m"

genesis_pid_cbor=$(python3 -c "import cbor2;hex_string='${genesis_pid}';data=bytes.fromhex(hex_string);encoded=cbor2.dumps(data);print(encoded.hex())")
genesis_tkn_cbor=$(python3 -c "import cbor2;hex_string='${genesis_tkn}';data=bytes.fromhex(hex_string);encoded=cbor2.dumps(data);print(encoded.hex())")

echo -e "\033[1;33m\nBuilding Minter Contract \033[0m"
aiken blueprint apply -o plutus.json -v minter.params "${genesis_pid_cbor}"
aiken blueprint apply -o plutus.json -v minter.params "${genesis_tkn_cbor}"
aiken blueprint apply -o plutus.json -v minter.params "${ref_hash_cbor}"
aiken blueprint convert -v minter.params > contracts/minter_contract.plutus
cardano-cli transaction policyid --script-file contracts/minter_contract.plutus > hashes/minter_contract.hash
echo -e "\033[1;33m Minter Contract Hash: $(cat hashes/minter_contract.hash) \033[0m"

minter_pid=$(cat hashes/minter_contract.hash)

echo -e "\033[1;33m\nBuilding Cogno Contract \033[0m"
aiken blueprint apply -o plutus.json -v cogno.params "${genesis_pid_cbor}"
aiken blueprint apply -o plutus.json -v cogno.params "${genesis_tkn_cbor}"
aiken blueprint apply -o plutus.json -v cogno.params "${ref_hash_cbor}"
aiken blueprint convert -v cogno.params > contracts/cogno_contract.plutus
cardano-cli transaction policyid --script-file contracts/cogno_contract.plutus > hashes/cogno_contract.hash
echo -e "\033[1;33m Cogno Contract Hash: $(cat hashes/cogno_contract.hash) \033[0m"

cogno_vkh=$(cat hashes/cogno_contract.hash)


echo -e "\033[1;33m\nBuilding Thread Contract \033[0m"
aiken blueprint apply -o plutus.json -v thread.params "${genesis_pid_cbor}"
aiken blueprint apply -o plutus.json -v thread.params "${genesis_tkn_cbor}"
aiken blueprint apply -o plutus.json -v thread.params "${ref_hash_cbor}"
aiken blueprint convert -v thread.params > contracts/thread_contract.plutus
cardano-cli transaction policyid --script-file contracts/thread_contract.plutus > hashes/thread_contract.hash
echo -e "\033[1;33m Thread Contract Hash: $(cat hashes/thread_contract.hash) \033[0m"

###############################################################################
############## DATUM AND REDEEMER STUFF #######################################
###############################################################################

jq \
--arg pid "$minter_pid" \
--arg vkh "$cogno_vkh" \
'.fields[0].bytes=$pid |
.fields[1].bytes=$vkh
' \
./scripts/data/reference/reference-datum.json | sponge ./scripts/data/reference/reference-datum.json

# end of build
echo -e "\033[1;32m\nBuilding Complete! \033[0m"