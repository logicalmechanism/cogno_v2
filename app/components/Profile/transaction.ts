import { BrowserWallet } from '@meshsdk/core';
import { keepRelevant } from '@meshsdk/core';
import { scriptHashToBech32 } from '@meshsdk/mesh-csl';
import { MeshTxBuilder, } from "@meshsdk/core";
import type { UTxO, Asset } from "@meshsdk/core";
import { MaestroProvider } from '@meshsdk/core';
import type { Unit, Quantity } from '@meshsdk/core';

interface CognoData {
  title: string;
  image: string;
  details: string;
}

interface BytesField {
  bytes: string;
}

interface IntField {
  int: bigint;
}

interface ConstructorField {
  constructor: number;
  fields: Field[];
}

type Field = BytesField | IntField | ConstructorField;

interface Datum {
  constructor: number;
  fields: Field[];
}

interface Redeemer {
  constructor: number;
  fields: Field[];
}


interface SuccessMsg {
  success: boolean;
  message: string;
}

function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export const handleCognoTransaction = async (network: number | null,
  wallet: BrowserWallet, cogno: UTxO | null, data: CognoData, removeFlag: boolean): Promise<SuccessMsg> => {
  // get all the utxos
  const utxos = await wallet.getUtxos();
  console.log('Wallet UTxOs: ', utxos);

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');
  console.log('Change Address: ', changeAddress);

  const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);
  console.log('Wallet Key Hashes:', walletKeyHashes);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  console.log('Collateral: ', collateralUTxOs);
  if (collateralUTxOs.length === 0) {
    // console.error('Collateral Not Set');
    return {
      success: false,
      message: 'Collateral Not Set'
    };
  }

  // we need to get ada to pay for the required lovelace
  const assetMap = new Map<Unit, Quantity>();
  // set this to 10 ada
  assetMap.set(
    'lovelace',
    '10000000'
  );

  // keepRelevant should account for 
  const selectedUtxos = keepRelevant(assetMap, utxos);
  console.log('Selected Wallet UTxOs: ', selectedUtxos)

  // this is where the actual sc interaction will be
  const networkName = network === 0 ? 'Preprod' : 'Mainnet';
  const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });
  const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
  });
  // script address for cogno
  const scriptHash = process.env.NEXT_PUBLIC_COGNO_SCRIPT_HASH!;
  const scriptAddress = scriptHashToBech32(scriptHash, undefined, network!);
  //
  // build out the tx depending on if the cogno exists
  //

  // add the change address and teh collateral
  mesh
    .changeAddress(changeAddress!)
    .txInCollateral(collateralUTxOs[0].input.txHash, collateralUTxOs[0].input.outputIndex);

  // add in the inputs
  selectedUtxos.forEach(item => {
    mesh.txIn(item.input.txHash, item.input.outputIndex)
  });

  // if updating/remove do one thing, else we need to create it
  if (cogno) {
    //
    // A cogno exists so we can update it or remove it from the contract
    //
    if (removeFlag) {
      // remove cogno logic
      console.log('Remove cogno:', cogno);

      // this token name
      const thisUnit = cogno.output.amount.find(asset => asset.unit.includes(process.env.NEXT_PUBLIC_MINTER_POLICY_ID!));
      console.log('unit:', thisUnit)
      const tokenName = thisUnit?.unit.replace(process.env.NEXT_PUBLIC_MINTER_POLICY_ID!, '');
      console.log('Token Name:', tokenName);

      // burn redeemer
      let burnRedeemer: Redeemer = {
        "constructor": 1,
        "fields": []
      };
      console.log('Burn Redeemer: ', burnRedeemer);

      // remove redeemer
      let removeRedeemer: Redeemer = {
        "constructor": 0,
        "fields": []
      };
      console.log('Remove Redeemer: ', removeRedeemer);

      mesh
        .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_REF_HASH!, 0)
        .spendingPlutusScriptV2()
        .txIn(cogno.input.txHash!, cogno.input.outputIndex!)
        .txInInlineDatumPresent()
        .txInRedeemerValue(removeRedeemer, undefined, 'JSON')
        .spendingTxInReference(process.env.NEXT_PUBLIC_COGNO_REF_HASH!, 1)
        .mintPlutusScriptV2()
        .mint("-1", process.env.NEXT_PUBLIC_MINTER_POLICY_ID!, tokenName!)
        .mintRedeemerValue(burnRedeemer, undefined, 'JSON')
        .mintTxInReference(process.env.NEXT_PUBLIC_MINTER_REF_HASH!, 1)
        .requiredSignerHash(walletKeyHashes.pubKeyHash)


    } else {
      // Update cogno logic
      console.log('Updating cogno:', cogno);

      // this token name
      const thisUnit = cogno.output.amount.find(asset => asset.unit.includes(process.env.NEXT_PUBLIC_MINTER_POLICY_ID!));
      console.log('unit:', thisUnit)
      const tokenName = thisUnit?.unit.replace(process.env.NEXT_PUBLIC_MINTER_POLICY_ID!, '');
      console.log('Token Name:', tokenName);

      // create teh asset list for the output using the new token
      let assets: Asset[] = [];
      let thisAsset = {
        unit: process.env.NEXT_PUBLIC_MINTER_POLICY_ID! + tokenName,
        quantity: "1",
      };
      assets.push(thisAsset);

      // update redeemer
      let updateRedeemer: Redeemer = {
        "constructor": 1,
        "fields": []
      };
      console.log('Update Redeemer: ', updateRedeemer);

      // the cogno datum
      let cognoDatum: Datum = {
        "constructor": 0,
        "fields": [
          {
            "constructor": 0,
            "fields": [
              {
                "bytes": walletKeyHashes.pubKeyHash
              },
              {
                "bytes": walletKeyHashes.stakeCredential
              }
            ]
          },
          {
            "constructor": 0,
            "fields": [
              {
                "bytes": stringToHex(data.title)
              },
              {
                "bytes": stringToHex(data.image)
              },
              {
                "bytes": stringToHex(data.details)
              }
            ]
          }
        ]
      };
      console.log('Cogno Datum:', cognoDatum);

      mesh
        .spendingPlutusScriptV2()
        .txIn(cogno.input.txHash!, cogno.input.outputIndex!)
        .txInInlineDatumPresent()
        .txInRedeemerValue(updateRedeemer, undefined, 'JSON')
        .spendingTxInReference(process.env.NEXT_PUBLIC_COGNO_REF_HASH!, 1)
        .txOut(scriptAddress!, assets)
        .txOutInlineDatumValue(cognoDatum, "JSON")
        .requiredSignerHash(walletKeyHashes.pubKeyHash);

    }
  } else {
    //
    // Create a new cogno
    //
    console.log('Creating cogno!');

    // create the token name for the mint
    const tokenName = ('cafebabe' + selectedUtxos[0].input.outputIndex.toString(16).padStart(2, '0') + selectedUtxos[0].input.txHash).substring(0, 64);
    console.log('Token Name:', tokenName);

    // create teh asset list for the output using the new token
    let assets: Asset[] = [];
    let thisAsset = {
      unit: process.env.NEXT_PUBLIC_MINTER_POLICY_ID! + tokenName,
      quantity: "1",
    };
    assets.push(thisAsset);

    // mint redeemer
    let mintRedeemer: Redeemer = {
      "constructor": 0,
      "fields": []
    };
    console.log('Mint Redeemer: ', mintRedeemer);

    // the cogno datum
    let cognoDatum: Datum = {
      "constructor": 0,
      "fields": [
        {
          "constructor": 0,
          "fields": [
            {
              "bytes": walletKeyHashes.pubKeyHash
            },
            {
              "bytes": walletKeyHashes.stakeCredential
            }
          ]
        },
        {
          "constructor": 0,
          "fields": [
            {
              "bytes": stringToHex(data.title)
            },
            {
              "bytes": stringToHex(data.image)
            },
            {
              "bytes": stringToHex(data.details)
            }
          ]
        }
      ]
    };
    console.log('Cogno Datum:', cognoDatum);

    // add in the output and the minting requirements
    mesh
      .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_REF_HASH!, 0)
      .txOut(scriptAddress!, assets)
      .txOutInlineDatumValue(cognoDatum, "JSON")
      .mintPlutusScriptV2()
      .mint("1", process.env.NEXT_PUBLIC_MINTER_POLICY_ID!, tokenName)
      .mintRedeemerValue(mintRedeemer, undefined, 'JSON')
      .mintTxInReference(process.env.NEXT_PUBLIC_MINTER_REF_HASH!, 1)
      .requiredSignerHash(walletKeyHashes.pubKeyHash)
  } // end if create cogno

  // use awaits here as a test
  try {
    await mesh.complete();
  } catch (error) {
    console.error('Maestro Error: ', error);
    return {
      success: false,
      message: `Maestro Error: ${error}`
    };
  }

  let unsignedTx;
  try {
    // Complete the signing process
    unsignedTx = mesh.completeSigning();
    console.log('Unsigned Tx: ', unsignedTx);
  } catch (error) {
    console.error('Complete Signing Error: ', error);
    return {
      success: false,
      message: `Complete Signing Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
    console.log('Signed Tx: ', signedTx);
  } catch (error) {
    console.error('Transaction Sign Error: ', error);
    return {
      success: false,
      message: `Transaction Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
    console.log('Tx Hash: ', txHash);
  } catch (error) {
    console.error('Transaction Submission Error: ', error);
    return {
      success: false,
      message: `Transaction Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
};
