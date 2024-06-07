import { useRouter } from "next/router";
import { useWallet } from '@meshsdk/react';
import { useState, useEffect, useCallback } from "react";
import { UTxO, Asset } from '@meshsdk/core';

import { MaestroProvider } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';
// components
import NavBar from '../components/NavBar';
import Notification from '../components/Notification';
import { serializeBech32Address } from '@meshsdk/mesh-csl';
import { Threads } from "../components/Thread";

export interface OutputAmount {
  unit: string;
  quantity: string;
}

const Forum = () => {
  const router = useRouter();

  const { connected, wallet, disconnect } = useWallet();
  const [network, setNetwork] = useState<null | number>(null);
  const [notification, setNotification] = useState<string>('');
  const [cogno, setCogno] = useState<null | UTxO>(null);
  const [threads, setThreads] = useState<UTxO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to clear notification
  const clearNotification = () => setNotification('');

  const findThreads = useCallback(async (): Promise<UTxO[]> => {
    if (network !== null) {
      // this is the thread script hash
      const scriptHash = process.env.NEXT_PUBLIC_THREAD_SCRIPT_HASH!;
      const scriptAddress = scriptHashToBech32(scriptHash, undefined, network);
      // set up maestro for the specific network
      const networkName = network === 0 ? 'Preprod' : 'Mainnet';
      const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

      // try and catch the utxos from the thread list
      try {
        const utxos = await maestro.fetchAddressUTxOs(scriptAddress);

        return utxos;
      } catch (error) {
        // console.error('Error fetching UTxOs: ', error);
        return [];
      }
    } else {
      // console.error('Bad Network');
      return [];
    }
  }, [network]);

  const findCogno = useCallback(async (): Promise<UTxO | null> => {
    if (network !== null) {
      // this is the cogno script hash
      const scriptHash = process.env.NEXT_PUBLIC_COGNO_SCRIPT_HASH!;
      const scriptAddress = scriptHashToBech32(scriptHash, undefined, network);
      // this is the cafebabe policy id
      const policyId = process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!;
      const networkName = network === 0 ? 'Preprod' : 'Mainnet';
      const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });
      try {
        const utxos = await maestro.fetchAddressUTxOs(scriptAddress);
        const walletKeyHashes = sessionStorage.getItem('walletKeyHashes');
        const keyHashes = walletKeyHashes ? JSON.parse(walletKeyHashes) : null;

        const foundUtxo = utxos.find(utxo => {
          const datum = parseDatumCbor(utxo.output.plutusData);
          const walletType = datum.fields[0];
          // find the first occurrence of a cogno that matches the key hashes
          if (walletType.fields[0].bytes === keyHashes.pubKeyHash && walletType.fields[1].bytes === keyHashes.stakeCredential) {
            // make sure this cogno holds the correct token
            return utxo.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId));
          }
          return false;
        });
        if (foundUtxo) {
          const tokenName = foundUtxo.output.amount.find((asset: Asset) => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!)).unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');
          sessionStorage.setItem('cognoTokenName', tokenName);
          return foundUtxo;
        } else {
          return null;
        }
      } catch (error) {
        // console.error('Error fetching UTxOs: ', error);
        return null;
      }
    } else {
      // console.error('Bad Network');
      return null; // Ensure a return value for all code paths
    }
  }, [network]);

  const getNetworkId = useCallback(async () => {
    if (wallet) {
      const _network = await wallet.getNetworkId();
      const changeAddress = await wallet.getChangeAddress();
      sessionStorage.setItem('changeAddress', changeAddress);
      sessionStorage.setItem('walletKeyHashes', JSON.stringify(serializeBech32Address(changeAddress)));
      setNetwork(_network);
    }
  }, [wallet]);

  const refreshCognoAndThreads = async () => {
    setIsLoading(true);
    const _cogno = await findCogno();
    setCogno(_cogno);
    const _threads = await findThreads();
    setThreads(_threads);
    setIsLoading(false);
  };

  const refreshCogno = async () => {
    const _cogno = await findCogno();
    setCogno(_cogno);
  };

  const refreshThreads = async () => {
    const _threads = await findThreads();
    setThreads(_threads);
  };

  useEffect(() => {
    if (network !== null) {
      const fetchCognoAndThreads = async () => {
        setIsLoading(true);
        const _cogno = await findCogno();
        setCogno(_cogno);
        const _threads = await findThreads();
        setThreads(_threads);
        setIsLoading(false);
      };
      fetchCognoAndThreads();
    }
  }, [network]);

  useEffect(() => {
    if (connected) {
      getNetworkId();
    } else {
      setNetwork(null);
    }
  }, [connected, getNetworkId]);

  useEffect(() => {
    const isAgreed = sessionStorage.getItem('isAgreed');
    if (isAgreed !== 'true') {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    // when in production change this to zero
    const networkFlag = parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!);
    if (network === networkFlag) {
      // this needs to display some alert
      const alertMsg = networkFlag === 1 ? 'Pre-Production' : 'Mainnet';
      setNotification(`Network Must Be Set To ${alertMsg}!`);
      disconnect(); // Automatically disconnect
    }
  }, [network, disconnect]);

  return (
    <div>
      <NavBar cogno={cogno} connected={connected} network={network} wallet={wallet} refreshCogno={refreshCogno} />
      {connected ? (
        network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold">Loading Cogno and Thread Data...</p>
              </div>
            ) : (
            <div className="flex flex-col w-full items-center justify-center">
              <div className="w-auto">
                <button
                className="px-4 py-2 my-2 bg-green-200 text-black text-base font-medium rounded-md shadow-sm hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                type="button"
                onClick={refreshCognoAndThreads}
              >
                Refresh Cogno
              </button>
              </div>
              <Threads threads={threads} network={network} wallet={wallet} refreshThreads={refreshThreads}/>
            </div>)
            }
          </div>
        ) : network === parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div>Incorrect Network</div>
        ) : (
          <div>Network Not Recognized</div>
        )
      ) : (
        <div className="flex h-screen items-center justify-center flex-col">
          <h1>Connect Your Wallet To Use The Cogno App</h1>
        </div>
      )}
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </div>
  );
};

export default Forum;
