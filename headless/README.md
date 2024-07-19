# Headless Interaction Scripts

## Wallet Setup

If you are starting your own version of Cogno, you will need a collateral, reference, starter, and user wallet.

```bash
mkdir -p wallets
./create_wallet.sh wallets/reference-wallet
./create_wallet.sh wallets/collat-wallet
./create_wallet.sh wallets/user-1-wallet
./create_wallet.sh wallets/starter-wallet
```

Otherwise, just create a user and collateral wallet, as these are the only wallets required to use the Cogno and thread headless scripts.

```bash
mkdir -p wallets
./create_wallet.sh wallets/user-1-wallet
./create_wallet.sh wallets/collat-wallet
```

Be sure to fund the wallets with an appropriate amount of ADA for your use case. Typically, the starter and collateral wallets need 5 ADA, the reference wallet needs 100 ADA, and the user wallet requires as much ADA as you need to use Cogno. Balances of the scripts and wallets can be viewed by running the all_balances.sh script.

## Required Data Setup

The path to the CLI and the node socket must be defined in `path_to_cli.sh` and `path_to_socket.sh` inside the `data` folder. If the `cardano-cli` is on the path, then that file does not have to change, but you will have to change the path to the socket file. This must be the path that points to the socket of a fully synced live node.

## Starting Your Own Version

With the UTxO information from the starter-wallet, place that UTxO data into the config file under the genesis tx id and idx sections. An example config is given below for the pre-production testnet.

```json
{
  "__comment1__": "Genesis UTxO From Starter Wallet",
  "genesis_tx_id": "2a6e67e02b35262ec02af024997a3ce48de37e650bcd42848daad9c3f33c096a",
  "genesis_tx_idx": 0,
  "__comment2__": "Random String For Data Reference",
  "random_string": "acab",
  "__comment3__": "Change address for reference and genesis",
  "change_address": "addr_test1qrvnxkaylr4upwxfxctpxpcumj0fl6fdujdc72j8sgpraa9l4gu9er4t0w7udjvt2pqngddn6q4h8h3uv38p8p9cq82qav4lmp"
}
```

The change address is the location where the leftover ADA will be sent after setting up the reference scripts and genesis mint. With the config set up properly, run the `complete_build.sh` script in the parent directory. This will compile the scripts and prepare the datums required to make Cogno work.

Inside the `headless` folder, use the `00_createScriptReferences.sh` script to create the script reference UTxOs. This will use the `reference-wallet` to generate UTxOs that hold the compiled smart contract references. Once the script references are on-chain, run the `01_genesisMint.sh` script. This will mint the genesis token into the data reference contract. This script requires the `starter-wallet` to hold the genesis UTxO that will mint the pointer token for the reference data.

At this point, your own version of Cogno should be set up and ready to use. Read the Cogno and Thread Management sections for information on the next steps.

## Using the Official Version

The repo comes prepared and ready to go for the headless mode to work with the existing and official Cogno forum. No compiling is required for this use case. Just be sure to follow the Required Data Setup section and fund your wallets appropriately.

### Cogno Management

Go to the `cogno` folder and create a valid Cogno with `01_createCogno.sh` using the `user-1-wallet`. The Cogno may be removed with `02_removeCogno.sh` and updated with `03_updateCogno.sh`. Updating to new data is as simple as updating the `cogno.json` file inside the `cogno` folder. The update script will use this data to automatically produce the required datum for the transaction. You can display your Cogno profile by running `displayCogno.sh` and can view anyone else's Cogno profile by providing their cafebabe token as shown below.

```bash
./displayCogno.sh cafebabe00c7cd71c12695a7b10c2e8a1182e277d3db845ed01c46a3f98c49d3
```

If `feh` is on the path and a profile image exists, then the display function will attempt to show the profile image in a new window.

### Thread Management

Go to the `thread` folder and create a valid thread with the `01_createThread.sh` script. That script uses the `thread.json` file to autofill the thread datum. Both the remove script and the comment script require a thread token to be passed as a variable, allowing any thread to be deleted (owned by your Cogno) and any thread to be commented on by simply providing the correct thread token. The `03_commentThread.sh` script uses the `comment.txt` file to autofill the comment value in the thread datum. Deleting a thread and commenting on a thread are shown in the examples below.

```bash
./02_removeThread 1abe11ed008317c5eee3755d5c00ce8256e4d2ff27da2cd91fac5b447c28dcbf
```

```bash
./03_commentThread 1abe11ed008317c5eee3755d5c00ce8256e4d2ff27da2cd91fac5b447c28dcbf
```

To view all threads, use the `displayThreads.sh` script. It will print 10 thread tokens and titles at a time in lexicographical order. Another ten can be printed by hitting enter. When a specific thread is found, use the `displayThread.sh` script to display the thread content and comments. An example is shown below.


```bash
./displayThread.sh 1abe11ed008317c5eee3755d5c00ce8256e4d2ff27da2cd91fac5b447c28dcbf
```
