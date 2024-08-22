import type { UTxO} from "@meshsdk/core";
import { MaestroProvider } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';

export function hexToString(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const hexCode = parseInt(hex.substring(i, i + 2), 16);
    str += String.fromCharCode(hexCode);
  }
  return str;
}

export function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}


export interface OutputAmount {
  unit: string;
  quantity: string;
}

export interface BytesField {
  bytes: string;
}

export interface IntField {
  int: bigint;
}

export interface ListField {
  list: BytesField[]
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

export interface SuccessMsg {
  success: boolean;
  message: string;
}

export const findCogno = async (tokenName: string, network: number): Promise<UTxO | null> => {
  // this is the cogno script hash
  const scriptHash = process.env.NEXT_PUBLIC_COGNO_SCRIPT_HASH!;
  // the cogno contract is not staked
  const scriptAddress = scriptHashToBech32(scriptHash, undefined, network);
    
  // this is the cafebabe policy id
  const policyId = process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!;
  
  // set up maestro for the specific network
  const networkName = network === 0 ? 'Preprod' : 'Mainnet';
  const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });
  
  // get all the cogno utxos then search for the users cogno. If nothing is found then return null.
  try {
    // get all the utxos
    const utxos = await maestro.fetchAddressUTxOs(scriptAddress);
    
    // find the utxo that holds the thread owner token
    return utxos.find(utxo => {
      return utxo.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId+tokenName));
    });
  } catch (error) {
    // something happened during the utxo fetch request
    return null;
  }
};