#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source ../.env

# thread contract
thread_script_path="../../contracts/thread_contract.plutus"
thread_script_address=$(${cli} address build --payment-script-file ${thread_script_path} ${network})

# the thread policy id
thread_policy_id=$(cat ../../hashes/thread_minter_contract.hash)
if [ "$#" -eq 1 ]; then
    thread_token_name="$1"
else
    echo "Error: This script requires exactly one argument."
    exit 1;
fi

# check if the user already has a cogno token
${cli} query utxo \
    --address ${thread_script_address} \
    ${network} \
    --out-file ../tmp/script_utxo.json
exist_check=$(jq -r --arg policy_id "$thread_policy_id" --arg token_name "$thread_token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .key' ../tmp/script_utxo.json)
if [ -z "$exist_check" ]; then
    echo "Thread Does Not Exist For ${thread_token_name}"
    exit;
fi

current_datum=$(jq -r --arg policy_id "$thread_policy_id" --arg token_name "$thread_token_name" 'to_entries[] | select(.value.value[$policy_id][$token_name] == 1) | .value.inlineDatum' ../tmp/script_utxo.json)
image_url=$(echo $current_datum | jq -r '.fields[2].bytes' | xxd -p -r)

echo -e "\033[0;35mToken: ${thread_token_name}\n\033[0m"
echo -e "\033[0;33mCogno: $(echo $current_datum | jq -r '.fields[5].bytes')\n\033[0m"
echo -e "\033[0;38mCategory: $(echo $current_datum | jq -r '.fields[3].bytes' | xxd -p -r)\n\033[0m"
echo -e "\033[0;36mTitle: $(echo $current_datum | jq -r '.fields[0].bytes' | xxd -p -r)\n\033[0m"
echo -e "\033[0;37mContent: $(echo $current_datum | jq -r '.fields[1].bytes' | xxd -p -r)\n\033[0m"
echo -e "\033[0;34mImage: ${image_url}\n\033[0m"
echo -e "\033[0;37m\n----------------------------Comments----------------------------\n\033[0m"
echo $current_datum | jq -r '.fields[4].list | reverse | .[] | .bytes' | while read hex; do 
    decoded=$(echo $hex | xxd -p -r)
    echo -e "$decoded\n-------\n"
done


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
