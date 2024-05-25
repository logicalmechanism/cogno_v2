# Cogno V2

The newer, slimmer, and updated version of Congo. Cogno V1 is now [depreciated.](https://github.com/logicalmechanism/cogno) Please visit [cogno.me](https://www.cogno.me) to create a cogno.

```
cogno an abbreviation of cognomen 

Noun

A word or set of words by which a person or thing is known, addressed, or referred to

A familiar, invented given name for a person or thing 

Used instead of the actual name of the person or thing
```

A smart contract ecosystem for UTxO-based cognomens and on-chain threads. Each cogno acts as a wallet identifier and user profile. Each thread is an on-chain message. Together they are a fully decentralized, completly public, social media platform. Ran entirely on the Cardano blockchain.

## Happy Path Testing

Use the complete_build.sh script to build the contracts using the config.

Required wallets for testing.

```bash
./create_wallet.sh wallets/reference-wallet # holds script references
./create_wallet.sh wallets/collat-wallet    # holds the collateral for sc interactions
./create_wallet.sh wallets/starter-wallet   # the genesis starter wallet
./create_wallet.sh wallets/user-1-wallet    # a unique user wallet
./create_wallet.sh wallets/user-2-wallet    # a unique user wallet
```

Enter the script folder and update the path to cli and socket files inside the data sub folder. The .env file will use these values to run the happy path.

Create the script references and mint the genesis token.

- TODO