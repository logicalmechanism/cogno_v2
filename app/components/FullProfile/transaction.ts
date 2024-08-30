import { BrowserWallet, UTxO, Asset, Unit, Quantity, keepRelevant, MaestroProvider, MeshTxBuilder } from '@meshsdk/core';
import { scriptHashToBech32,  } from '@meshsdk/mesh-csl';
import { stringToHex, SuccessMsg, Redeemer, Datum, BytesField } from '../utilities';

interface CognoData {
  title: string;
  image: string;
  details: string;
}

export const handleCreateCogno = async (
  network: number | null,
  wallet: BrowserWallet,
  data: CognoData): Promise<SuccessMsg> => {
  // get all the utxos
  const utxos = await wallet.getUtxos();

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');

  const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
    };
  }

  // we need to get ada to pay for the required lovelace
  const assetMap = new Map<Unit, Quantity>();
  // set this to 10 ada for now
  assetMap.set(
    'lovelace',
    '10000000'
  );

  // keepRelevant should account for 
  const selectedUtxos = keepRelevant(assetMap, utxos);

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

  // create the token name for the mint
  const tokenName = ('cafebabe' + selectedUtxos[0].input.outputIndex.toString(16).padStart(2, '0') + selectedUtxos[0].input.txHash).substring(0, 64);

  // create teh asset list for the output using the new token
  let assets: Asset[] = [];
  let thisAsset = {
    unit: process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH! + tokenName,
    quantity: "1",
  };
  assets.push(thisAsset);

  // mint redeemer
  let mintRedeemer: Redeemer = {
    "constructor": 0,
    "fields": []
  };

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
      },
      {
        "constructor": 0,
        "fields": [
          {
            "list": []
          },
          {
            "list": []
          },
          {
            "list": []
          }
        ]
      }
    ]
  };

  // add in the output and the minting requirements
  mesh
    .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_DATA_UTXO!, 0)
    .txOut(scriptAddress!, assets)
    .txOutInlineDatumValue(cognoDatum, "JSON")
    .mintPlutusScriptV2()
    .mint("1", process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, tokenName)
    .mintRedeemerValue(mintRedeemer, 'JSON', undefined)
    .mintTxInReference(process.env.NEXT_PUBLIC_COGNO_MINTER_REF_UTXO!, 1)
    .requiredSignerHash(walletKeyHashes.pubKeyHash)
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

    // use awaits here as a test
  try {
    await mesh.complete();
  } catch (error) {
    return {
      success: false,
      message: `Maestro Error: ${error}`
    };
    }

  let unsignedTx;
  try {
    // Complete the signing process
    unsignedTx = mesh.completeSigning();
  } catch (error) {
    return {
      success: false,
      message: `Complete Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
  } catch (error) {
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
  } catch (error) {
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
};


export const handleDeleteCogno = async (
  network: number | null,
  wallet: BrowserWallet, 
  cogno: UTxO | null): Promise<SuccessMsg> => {
  // get all the utxos
  const utxos = await wallet.getUtxos();

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');

  const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
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

  // this is where the actual sc interaction will be
  const networkName = network === 0 ? 'Preprod' : 'Mainnet';
  const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });
  const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
  });

  // add the change address and teh collateral
  mesh
    .changeAddress(changeAddress!)
    .txInCollateral(collateralUTxOs[0].input.txHash, collateralUTxOs[0].input.outputIndex);

  // add in the inputs
  selectedUtxos.forEach(item => {
    mesh.txIn(item.input.txHash, item.input.outputIndex)
  });

  // this token name
  const thisUnit = cogno!.output.amount.find(asset => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!));
  const tokenName = thisUnit?.unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');

  // burn redeemer
  let burnRedeemer: Redeemer = {
    "constructor": 1,
    "fields": []
  };

  // remove redeemer
  let removeRedeemer: Redeemer = {
    "constructor": 0,
    "fields": []
  };

  mesh
    .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_DATA_UTXO!, 0)
    .spendingPlutusScriptV2()
    .txIn(cogno!.input.txHash!, cogno!.input.outputIndex!)
    .txInInlineDatumPresent()
    .txInRedeemerValue(removeRedeemer, 'JSON', undefined)
    .spendingTxInReference(process.env.NEXT_PUBLIC_COGNO_REF_UTXO!, 1)
    .mintPlutusScriptV2()
    .mint("-1", process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, tokenName!)
    .mintRedeemerValue(burnRedeemer, 'JSON', undefined)
    .mintTxInReference(process.env.NEXT_PUBLIC_COGNO_MINTER_REF_UTXO!, 1)
    .requiredSignerHash(walletKeyHashes.pubKeyHash)
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

  // use awaits here as a test
  try {
    await mesh.complete();
  } catch (error) {
    return {
      success: false,
      message: `Maestro Error: ${error}`
    };
  }

  let unsignedTx;
  try {
    // Complete the signing process
    unsignedTx = mesh.completeSigning();
  } catch (error) {
    console.error('Complete Error: ', error);
    return {
      success: false,
      message: `Complete Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
  } catch (error) {
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
  } catch (error) {
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
};


export const handleUpdateCogno = async (
  network: number | null,
  wallet: BrowserWallet,
  cogno: UTxO | null, 
  data: CognoData): Promise<SuccessMsg> => {
  // get all the utxos
  const utxos = await wallet.getUtxos();

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');

  const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
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
  // add the change address and teh collateral
  mesh
    .changeAddress(changeAddress!)
    .txInCollateral(collateralUTxOs[0].input.txHash, collateralUTxOs[0].input.outputIndex);

  // add in the inputs
  selectedUtxos.forEach(item => {
    mesh.txIn(item.input.txHash, item.input.outputIndex)
  });

  // this token name
  const thisUnit = cogno!.output.amount.find(asset => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!));
  const tokenName = thisUnit?.unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');

  // create teh asset list for the output using the new token
  let assets: Asset[] = [];
  let thisAsset = {
    unit: process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH! + tokenName,
    quantity: "1",
  };
  assets.push(thisAsset);

  // update redeemer
  let updateRedeemer: Redeemer = {
    "constructor": 1,
    "fields": []
  };

  const storedFriendList = JSON.parse(sessionStorage.getItem('friendList') || '[]');
  const storedBlockedUserList = JSON.parse(sessionStorage.getItem('blockUserList') || '[]');
  const storedBlockedThreadList = JSON.parse(sessionStorage.getItem('blockThreadList') || '[]');

      

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
      },
      {
        "constructor": 0,
        "fields": [
          {
            "list": storedFriendList.map((element: string): BytesField => ({"bytes": element}))
          },
          {
            "list": storedBlockedUserList.map((element: string): BytesField => ({"bytes": element}))
          },
          {
            "list": storedBlockedThreadList.map((element: string): BytesField => ({"bytes": element}))
          }
        ]
      }
    ]
  };

  mesh
    .spendingPlutusScriptV2()
    .txIn(cogno!.input.txHash!, cogno!.input.outputIndex!)
    .txInInlineDatumPresent()
    .txInRedeemerValue(updateRedeemer, 'JSON', undefined)
    .spendingTxInReference(process.env.NEXT_PUBLIC_COGNO_REF_UTXO!, 1)
    .txOut(scriptAddress!, assets)
    .txOutInlineDatumValue(cognoDatum, "JSON")
    .requiredSignerHash(walletKeyHashes.pubKeyHash)
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

  // complete tx
  try {
    await mesh.complete();
  } catch (error) {
    console.error('mesh.complete Error: ', error);
    return {
      success: false,
      message: `Maestro Error: ${error}`
    };
  }

  let unsignedTx;
  try {
    // Complete the signing process
    unsignedTx = mesh.completeSigning();
  } catch (error) {
    console.error('mesh.completeSigning Error: ', error);
    return {
      success: false,
      message: `Complete Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
  } catch (error) {
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
  } catch (error) {
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
};
