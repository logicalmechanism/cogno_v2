#!/usr/bin/env bash
set -e

# SET UP VARS HERE
source .env

echo cogno minter
cat ../hashes/cogno_minter_contract.hash
${cli} transaction txid --tx-file ./tmp/utxo-cogno_minter_contract.plutus.signed

echo thread minter
cat ../hashes/thread_minter_contract.hash
${cli} transaction txid --tx-file ./tmp/utxo-thread_minter_contract.plutus.signed

echo cogno
cat ../hashes/cogno_contract.hash
${cli} transaction txid --tx-file ./tmp/utxo-cogno_contract.plutus.signed

echo thread
cat ../hashes/thread_contract.hash
${cli} transaction txid --tx-file ./tmp/utxo-thread_contract.plutus.signed