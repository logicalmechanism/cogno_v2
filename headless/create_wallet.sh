#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

if [[ $# -eq 0 ]] ; then
    echo 'Please Supply A Wallet Folder: wallet/name-wallet'
    exit 1;
fi

folder=${1}

# the wallet should not be over written
if [ ! -d ${folder} ]; then
    mkdir ${folder}
    ${cli} address key-gen --verification-key-file ${folder}/payment.vkey --signing-key-file ${folder}/payment.skey
    ${cli} address build --payment-verification-key-file ${folder}/payment.vkey --out-file ${folder}/payment.addr ${network}
    ${cli} address key-hash --payment-verification-key-file ${folder}/payment.vkey --out-file ${folder}/payment.hash
    echo "${folder} folder created"
    exit;
else
    echo "${folder} folder already exists"
    exit 1;
fi
