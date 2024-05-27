import { BrowserWallet } from '@meshsdk/core';
import { keepRelevant } from '@meshsdk/core';
import { scriptHashToBech32 } from '@meshsdk/mesh-csl';
import { MeshTxBuilder, } from "@meshsdk/core";
import type { UTxO, Asset } from "@meshsdk/core";
import { MaestroProvider } from '@meshsdk/core';
import type { Unit, Quantity } from '@meshsdk/core';

interface BytesField {
  bytes: string;
}

interface IntField {
  int: bigint;
}

interface ListField {
  list: []
}

interface ConstructorField {
  constructor: number;
  fields: Field[];
}

type Field = BytesField | IntField | ListField | ConstructorField;

interface Datum {
  constructor: number;
  fields: Field[];
}

interface Redeemer {
  constructor: number;
  fields: Field[];
}

interface ThreadData {
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  tokenName: string | null;
  lovelace: number;
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

export const handleThreadCreation = async (
  network: number | null,
  wallet: BrowserWallet, 
  data: ThreadData,): Promise<SuccessMsg> => {
  // create a thread
  // get all the utxos
  const utxos = await wallet.getUtxos();
  console.log('Wallet UTxOs: ', utxos);

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');
  console.log('Change Address: ', changeAddress);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  console.log('Collateral: ', collateralUTxOs);
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'Collateral Not Set'
    };
  }

  // we need to get ada to pay for the required lovelace
  const assetMap = new Map<Unit, Quantity>();
  assetMap.set(
    'lovelace',
    (10000000 + data.lovelace).toString(),
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
  const scriptHash = process.env.NEXT_PUBLIC_THREAD_SCRIPT_HASH!;
  const scriptAddress = scriptHashToBech32(scriptHash, undefined, network!);

  // add the change address and teh collateral
  mesh
    .changeAddress(changeAddress!)
    .txInCollateral(collateralUTxOs[0].input.txHash, collateralUTxOs[0].input.outputIndex);

  // add in the inputs
  selectedUtxos.forEach(item => {
    mesh.txIn(item.input.txHash, item.input.outputIndex)
  });

  // Check if data.tokenName is null
  if (data.tokenName === null) {
    return {
      success: false,
      message: `Cogno Not Set Error`
    };
  }

  // the thread datum
  let threadDatum: Datum = {
    "constructor": 0,
    "fields": [
      {
        "bytes": stringToHex(data.title)
      },
      {
        "bytes": stringToHex(data.content)
      },
      {
        "bytes": stringToHex(data.imageUrl)
      },
      {
        "bytes": stringToHex(data.category)
      },
      {
        "list": []
      },
      {
        "bytes": data.tokenName!
      }
    ]
  };
  console.log('Thread Datum:', threadDatum);

  // create teh asset list for the output using the new token
  if (data.lovelace <= 2_000_000) {
    mesh
    .txOut(scriptAddress!, [])
    .txOutInlineDatumValue(threadDatum, "JSON")
  } else {
    let assets: Asset[] = [];
    let thisAsset = {
      unit: 'lovelace',
      quantity: data.lovelace.toString()
    };
    assets.push(thisAsset);
    mesh
    .txOut(scriptAddress!, assets)
    .txOutInlineDatumValue(threadDatum, "JSON")
  }

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
}

export const handleThreadDeletion = async (): Promise<SuccessMsg> => {
  return {
    success: true,
    message: ''
  };
}

export const handleThreadComment = async (): Promise<SuccessMsg> => {
  return {
    success: true,
    message: ''
  };
}