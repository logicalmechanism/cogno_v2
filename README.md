# Cogno

Welcome to Congo, a fully on-chain social media platform. 

*Cogno V1 is now [depreciated](https://github.com/logicalmechanism/cogno_v1).*

Cogno is a collection of smart contracts for UTxO-based cognomens and on-chain threads. Each Cogno acts as a user profile. Each thread is an on-chain message, functioning as a public chat room, discussion forum, news and article aggregator, image board, and permanent storage for textual posts. Altogether, they form a fully decentralized, completely public social media platform, running entirely on the Cardano blockchain.

The Cogno ecosystem is entirely open-source and available online at [www.cogno.forum](www.cogno.forum), locally via yarn, or in a headless mode using a fully synced Cardano node. The system is designed to never be controlled by anyone, shut down, censored, or turned off. It lives forever on the Cardano blockchain. Moderation and curation happen at the user level, so each user defines who and what they want to see on their Cogno display, allowing users to block harmful users and threads. Cogno is free to use, with the only payment being the transaction fee required by the Cardano blockchain.

Cogno, as a social media platform, is unique in that content creators who produce popular content that garners interaction via comments will be paid for their content through the minimum required ADA on the thread UTxO. If the content creator chooses to do so, they may remove their thread and reward themselves with the additional ADA placed onto the UTxO from other users commenting on the thread. Once a thread has been spent, it is removed from the live platform and only exists as old-chain history. Cogno does not display old history and only shows the current UTxO set.

### Why Cogno?

```
Cogno si an abbreviation of Cognomen 

Noun

A word or set of words by which a person or thing is known, addressed, or referred to

A familiar, invented given name for a person or thing 

Used instead of the actual name of the person or thing
```

## Building

Use the `complete_build.sh` script in the parent directory to build your own version of the contracts using the data from `config.json`. The config file requires information from the headless scripts, namely the starter wallet UTxO and a random string. Using Cogno locally or headless does not require compiling the contracts. This is only for users wishing to spin up their own versions of Cogno.

Use the `complete_build.sh` script in the parent directory to build your own version of the contracts using the data from `config.json`. The config file requires information from the headless scripts, namely the starter wallet UTxO and a random string. Using Cogno locally or in headless mode does not require compiling the contracts. This is only for users wishing to spin up their own versions of Cogno.

## Headless Interaction

Use the `headless` folder to interact with the dapp using the cardano-cli and a full node.

## CIP30 Frontend Interaction

Use the `app` folder to interact with the dapp using a CIP30 web wallet.
