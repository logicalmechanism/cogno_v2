import { BrowserWallet } from '@meshsdk/core';
import { keepRelevant } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';
import { MeshTxBuilder, } from "@meshsdk/core";
import type { UTxO, Asset } from "@meshsdk/core";
import { MaestroProvider } from '@meshsdk/core';
import type { Unit, Quantity } from '@meshsdk/core';

import type { OutputAmount } from '../utilities';

export interface BytesField {
  bytes: string;
}

export interface IntField {
  int: bigint;
}

export interface ListField {
  list: object[]
}

export interface ConstructorField {
  constructor: number;
  fields: Field[];
}

export type Field = BytesField | IntField | ListField | ConstructorField;

export interface Datum {
  constructor: number;
  fields: Field[];
}

export interface Redeemer {
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
  data: ThreadData,
): Promise<SuccessMsg> => {
  // create a thread
  // get all the utxos
  const utxos = await wallet.getUtxos();
  // console.log('Wallet UTxOs: ', utxos);

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');
  // console.log('Change Address: ', changeAddress);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  // console.log('Collateral: ', collateralUTxOs);
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
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
  // console.log('Selected Wallet UTxOs: ', selectedUtxos)

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
    .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_DATA_UTXO!, 0)
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

  // create the token name for the mint
  const tokenName = ('1abe11ed' + selectedUtxos[0].input.outputIndex.toString(16).padStart(2, '0') + selectedUtxos[0].input.txHash).substring(0, 64);
  // console.log('Token Name:', tokenName);

  // mint redeemer
  let mintRedeemer: Redeemer = {
    "constructor": 0,
    "fields": []
  };
  // console.log('Mint Redeemer: ', mintRedeemer);

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
  // console.log('Thread Datum:', threadDatum);

  // create teh asset list for the output using the new token
  let assets: Asset[] = [];
  let thatAsset = {
    unit: process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH! + tokenName,
    quantity: '1',
    }
  assets.push(thatAsset);
  if (data.lovelace <= 2_000_000) {
    mesh
      .txOut(scriptAddress!, assets)
      .txOutInlineDatumValue(threadDatum, "JSON")
  } else {
    let thisAsset = {
      unit: 'lovelace',
      quantity: data.lovelace.toString()
    };
    assets.push(thisAsset);
    mesh
      .txOut(scriptAddress!, assets)
      .txOutInlineDatumValue(threadDatum, "JSON")
  }

  // console.log('Assets: ', assets);

  mesh
    .mintPlutusScriptV2()
    .mint("1", process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!, tokenName)
    .mintRedeemerValue(mintRedeemer, 'JSON', undefined)
    .mintTxInReference(process.env.NEXT_PUBLIC_THREAD_MINTER_REF_UTXO!, 1)
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

  // use awaits here as a test
  try {
    await mesh.complete();
  } catch (error) {
    // console.error('Maestro Error: ', error);
    return {
      success: false,
      message: `Maestro Error: ${error}`
    };
  }

  let unsignedTx;
  try {
    // Complete the signing process
    unsignedTx = mesh.completeSigning();
    // console.log('Unsigned Tx: ', unsignedTx);
  } catch (error) {
    // console.error('Complete Error: ', error);
    return {
      success: false,
      message: `Complete Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
    // console.log('Signed Tx: ', signedTx);
  } catch (error) {
    // console.error('Sign Error: ', error);
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
    // console.log('Tx Hash: ', txHash);
  } catch (error) {
    // console.error('Submission Error: ', error);
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
}

export const handleThreadDeletion = async (
  network: number | null,
  wallet: BrowserWallet,
  thread: UTxO,
): Promise<SuccessMsg> => {
  // delete a thread
  const utxos = await wallet.getUtxos();
  // console.log('Wallet UTxOs: ', utxos);

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');
  // console.log('Change Address: ', changeAddress);

  const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);
  // console.log('Wallet Key Hashes:', walletKeyHashes);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  // console.log('Collateral: ', collateralUTxOs);
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
    };
  }

  // we need to get ada to pay for the required lovelace
  const assetMap = new Map<Unit, Quantity>();
  assetMap.set(
    'lovelace',
    '10000000',
  );

  // keepRelevant should account for 
  const selectedUtxos = keepRelevant(assetMap, utxos);
  // console.log('Selected Wallet UTxOs: ', selectedUtxos)

  // this is where the actual sc interaction will be
  const networkName = network === 0 ? 'Preprod' : 'Mainnet';
  const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });
  const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
  });
  // the cogno token name
  const cognoTokenName = sessionStorage.getItem('cognoTokenName');
  // console.log('Cogno Token Name:', cognoTokenName);


  // script address for cogno
  const cognoScriptHash = process.env.NEXT_PUBLIC_COGNO_SCRIPT_HASH!;
  const cognoScriptAddress = scriptHashToBech32(cognoScriptHash, undefined, network!);

  const cognoScriptUtxos = await maestro.fetchAddressUTxOs(cognoScriptAddress);

  const cogno = cognoScriptUtxos.find(utxo => {
    // console.log('UTxO:', utxo.output.amount);
    // find the first occurrence of a cogno that matches the key hashes

    if (utxo.output.amount.some((asset: OutputAmount) => asset.unit.includes(cognoTokenName!))) {
      // make sure this cogno holds the correct token
      return utxo
    }
    return false;
  });

  // console.log('found cogno utxo', cogno)

  // delete redeemer
  let deleteRedeemer: Redeemer = {
    "constructor": 0,
    "fields": []
  };
  // console.log('Delete Redeemer: ', deleteRedeemer);

  // burn redeemer
  let burnRedeemer: Redeemer = {
    "constructor": 1,
    "fields": []
  };
  // console.log('Burn Redeemer: ', burnRedeemer);

  // this token name
  const thisUnit = thread.output.amount.find(asset => asset.unit.includes(process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!));
  // console.log('unit:', thisUnit)
  const threadTokenName = thisUnit?.unit.replace(process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!, '');
  // console.log('Thread Token Name:', threadTokenName);

  mesh
    .changeAddress(changeAddress!)
    .txInCollateral(collateralUTxOs[0].input.txHash, collateralUTxOs[0].input.outputIndex);

  // add in the inputs
  selectedUtxos.forEach(item => {
    mesh.txIn(item.input.txHash, item.input.outputIndex)
  });
  // console.log('reference', process.env.NEXT_PUBLIC_REFERENCE_DATA_UTXO!, 0)
  // add the change address and teh collateral
  mesh
    .readOnlyTxInReference(process.env.NEXT_PUBLIC_REFERENCE_DATA_UTXO!, 0)
    .readOnlyTxInReference(cogno!.input.txHash!, cogno!.input.outputIndex!)
    .spendingPlutusScriptV2()
    .txIn(thread.input.txHash!, thread.input.outputIndex!)
    .txInInlineDatumPresent()
    .txInRedeemerValue(deleteRedeemer, 'JSON', undefined)
    .spendingTxInReference(process.env.NEXT_PUBLIC_THREAD_REF_UTXO!, 1)
    .requiredSignerHash(walletKeyHashes.pubKeyHash)
    .mintPlutusScriptV2()
    .mint("-1", process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!, threadTokenName!)
    .mintRedeemerValue(burnRedeemer, 'JSON', undefined)
    .mintTxInReference(process.env.NEXT_PUBLIC_THREAD_MINTER_REF_UTXO!, 1)
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

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
    // console.log('Unsigned Tx: ', unsignedTx);
  } catch (error) {
    // console.error('Complete Error: ', error);
    return {
      success: false,
      message: `Complete Error: ${error}`
    };
  }

  // Prompt wallet to sign it
  let signedTx;
  try {
    signedTx = await wallet.signTx(unsignedTx, true);
    // console.log('Signed Tx: ', signedTx);
  } catch (error) {
    // console.error('Sign Error: ', error);
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
    // console.log('Tx Hash: ', txHash);
  } catch (error) {
    // console.error('Submission Error: ', error);
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
}

export const handleCommentCreation = async (
  network: number | null,
  wallet: BrowserWallet,
  thread: UTxO,
  comment: string,
): Promise<SuccessMsg> => {
  // create a comment
  // get all the utxos
  const utxos = await wallet.getUtxos();
  // console.log('Wallet UTxOs: ', utxos);

  // the change address is from the login
  const changeAddress = sessionStorage.getItem('changeAddress');
  // console.log('Change Address: ', changeAddress);

  // const walletKeyHashes = JSON.parse(sessionStorage.getItem('walletKeyHashes')!);
  // console.log('Wallet Key Hashes:', walletKeyHashes);

  // if the collateral is not set then we need to inform the user
  const collateralUTxOs = await wallet.getCollateral();
  // console.log('Collateral: ', collateralUTxOs);
  if (collateralUTxOs.length === 0) {
    return {
      success: false,
      message: 'collateral not set'
    };
  }

  // we need to get ada to pay for the required lovelace
  const assetMap = new Map<Unit, Quantity>();
  assetMap.set(
    'lovelace',
    '10000000',
  );

  // the lovelace on the thread
  const lovelace = thread.output.amount.find((asset: OutputAmount) => asset.unit.includes('lovelace'));
  // console.log(lovelace)

  // keepRelevant should account for 
  const selectedUtxos = keepRelevant(assetMap, utxos, lovelace?.quantity);
  // console.log('Selected Wallet UTxOs: ', selectedUtxos)

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

  // the thread datum
  const currentComments: object[] = parseDatumCbor(thread.output.plutusData!).fields[4].list;
  // console.log(comment);
  // console.log(stringToHex(comment));
  
  currentComments.unshift(
    {
      "bytes": stringToHex(comment)
    }
  );
  let threadDatum: Datum = {
    "constructor": 0,
    "fields": [
      {
        "bytes": parseDatumCbor(thread.output.plutusData!).fields[0].bytes
      },
      {
        "bytes": parseDatumCbor(thread.output.plutusData!).fields[1].bytes
      },
      {
        "bytes": parseDatumCbor(thread.output.plutusData!).fields[2].bytes
      },
      {
        "bytes": parseDatumCbor(thread.output.plutusData!).fields[3].bytes
      },
      {
        "list": currentComments
      },
      {
        "bytes": parseDatumCbor(thread.output.plutusData!).fields[5].bytes
      }
    ]
  };
  // console.log('Thread Datum:', threadDatum);

  // comment redeemer
  let commentRedeemer: Redeemer = {
    "constructor": 1,
    "fields": [
      {
        'bytes': stringToHex(comment)
      }
    ]
  };
  // console.log('Comment Redeemer: ', commentRedeemer);

  
  let assets: Asset[] = [];
  // this needs to be taken into account for buffer amounts.
  const threadTokenName = sessionStorage.getItem('threadTokenName');
  let thatAsset = {
    unit: process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH! + threadTokenName,
    quantity: '1',
    }
  assets.push(thatAsset);

  mesh
    .spendingPlutusScriptV2()
    .txIn(thread.input.txHash!, thread.input.outputIndex!)
    .txInInlineDatumPresent()
    .txInRedeemerValue(commentRedeemer, 'JSON', undefined)
    .spendingTxInReference(process.env.NEXT_PUBLIC_THREAD_REF_UTXO!, 1)
    .txOut(scriptAddress!, assets)
    .txOutInlineDatumValue(threadDatum, "JSON")
    .setNetwork(network === 0 ? 'preprod' : 'mainnet');

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
    // console.log('Unsigned Tx: ', unsignedTx);
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
    // console.log('Signed Tx: ', signedTx);
  } catch (error) {
    console.error('Sign Error: ', error);
    return {
      success: false,
      message: `Sign Error: ${error}`
    };
  }

  // Submit the signed transaction
  let txHash;
  try {
    txHash = await wallet.submitTx(signedTx);
    // console.log('Tx Hash: ', txHash);
  } catch (error) {
    console.error('Submission Error: ', error);
    return {
      success: false,
      message: `Submission Error: ${error}`
    };
  }

  return {
    success: true,
    message: txHash
  };
}