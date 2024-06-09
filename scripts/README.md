# Headless Interaction Scripts

## Wallet Setup

We need a collateral, reference, starter, and a user wallet.

```bash
mkdir -p wallets
./create_wallet.sh wallets/reference-wallet
./create_wallet.sh wallets/collat-wallet
./create_wallet.sh wallets/user-1-wallet
./create_wallet.sh wallets/starter-wallet
```

## Data Setup

The path to the cli and the node socket must be defined in `path_to_cli.sh` and `path_to_socket.sh` inside the `data` folder. The genesis UTxO information from the starter wallet needs to be placed inside the `config.json` file.

## Using The Scripts

First, create the script reference UTxOs with `00_createScriptReferences.sh`. Once the script references are on-chain run the `01_genesisMint.sh` script it mint the genesis token into the data reference contract.

Next, go to the `cogno` folder and create a valid cogno with `01_createCogno.sh`. The cogno may be removed with `02_removeCogno.sh` and updated with `03_updateCogno.sh`. Updating requires manually updating the `cogno-datum.json` file inside the `data/cogno` folder.

Finally, go to the `thread` folder and start creating a thread with the `01_createThread.sh` script. That script uses the `thread.json` file to autofill the thread datum. A comment can be added to the thread by using the `03_commentThread.sh` script. That script uses the `comment.txt` file to autofill the comment value in the thread datum. It locates the thread by finding the UTxO with a specific cogno token.