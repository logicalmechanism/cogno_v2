#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# display a cogno by the token name else use the data token name from creation
if [ "$#" -eq 1 ]; then
    token_name="$1"
elif [ "$#" -eq 0 ]; then
    # If no arguments are provided, read token_name from file
    if [ -f "../data/cogno/token.name" ]; then
        token_name=$(cat "../data/cogno/token.name")
    else
        echo "Error: File '../data/cogno/token.name' not found."
        exit 1
    fi
else
    echo "Error: This script requires exactly one argument."
    exit 1
fi

# cogno contract
cogno_script_path="../../contracts/cogno_contract.plutus"
cogno_script_address=$(${cli} address build --payment-script-file ${cogno_script_path} ${network})

# the policy id
policy_id=$(cat ../../hashes/cogno_minter_contract.hash)

# check if the user already has a cogno token
${cli} query utxo \
    --address ${cogno_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
exist_check=$(jq -r --arg policy_id "$policy_id" --arg token_name "$token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key' ../tmp/script_utxo.json)
if [ -z "$exist_check" ]; then
    echo "Cogno Does Not Exist For ${token_name}"
    exit;
fi

# get the datum and deconstruct
current_datum=$(jq -r --arg policy_id "$policy_id" --arg token_name "$token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .value.inlineDatum' ../tmp/script_utxo.json)

image_url=$(echo $current_datum | jq -r '.fields[1].fields[1].bytes' | xxd -p -r)

echo -e "\033[0;35mToken: ${token_name}\n\033[0m"
echo -e "\033[0;36mName: $(echo $current_datum | jq -r '.fields[1].fields[0].bytes' | xxd -p -r)\n\033[0m"
echo -e "\033[0;34mImage: ${image_url}\n\033[0m"
echo -e "\033[0;37mDetails: $(echo $current_datum | jq -r '.fields[1].fields[2].bytes' | xxd -p -r)\033[0m"

#if feh is on path and an image exists then display the image with feh
if ! command -v feh &> /dev/null
then
    echo "Please Install feh to directly view profile image."
    exit;
fi

if [ -z "$image_url" ]; then
    exit;
fi

temp_image=$(mktemp /tmp/image.XXXXXX)
curl -s ${image_url} > $temp_image
feh "$temp_image"