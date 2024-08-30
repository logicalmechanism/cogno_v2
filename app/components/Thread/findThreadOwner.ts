import type { UTxO} from "@meshsdk/core";
import { MaestroProvider } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';
import type { OutputAmount } from '../utilities';

export const findCognoFromThreadOwner = async (threadOwner: string, network: number): Promise<UTxO | null> => {
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
    const result = utxos.find(utxo => {
      return utxo.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId+threadOwner));
    });
    return result || null; // Return null if result is undefined
  } catch (error) {
    // something happened during the utxo fetch request
    return null;
  }
};