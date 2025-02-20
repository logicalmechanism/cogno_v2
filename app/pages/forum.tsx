import { useRouter } from "next/router";
import { useWallet } from '@meshsdk/react';
import { useState, useEffect, useCallback } from "react";
import { UTxO, Asset } from '@meshsdk/core';
import { MaestroProvider } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';
import { serializeBech32Address } from '@meshsdk/mesh-csl';
import { OutputAmount } from "@/components/utilities";
// components
import NavBar from '../components/NavBar';
import Notification from '../components/Notification';
import { Threads } from "../components/Thread";
import {BytesField } from '../components/utilities';



const Forum = () => {
  const router = useRouter();

  const { connected, wallet, disconnect } = useWallet();
  const [network, setNetwork] = useState<null | number>(null);
  const [notification, setNotification] = useState<string>('');
  const [cogno, setCogno] = useState<null | UTxO>(null);
  const [threads, setThreads] = useState<UTxO[]>([]);
  const [isLoadingData, setisLoadingData] = useState(false);

  // Function to clear notification
  const clearNotification = () => setNotification('');

  const findThreads = useCallback(async (): Promise<UTxO[]> => {
    if (network !== null) {
      // this is the thread script hash
      const scriptHash = process.env.NEXT_PUBLIC_THREAD_SCRIPT_HASH!;
      // the thread contract is not staked
      const scriptAddress = scriptHashToBech32(scriptHash, undefined, network);
      // set up maestro for the specific network
      const networkName = network === 0 ? 'Preprod' : 'Mainnet';
      const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

      // try and catch the utxos from the thread list
      try {
        const utxos = await maestro.fetchAddressUTxOs(scriptAddress);
        return utxos;
      } catch (error) {
        return [];
      }
    } else {
      return [];
    }
  }, [network]);

  const findCogno = useCallback(async (): Promise<UTxO | null> => {
    if (network !== null) {
      // initialize it to invalid token name
      sessionStorage.setItem('cognoTokenName', "non existent token");
      sessionStorage.setItem('blockThreadList', JSON.stringify([]));
      sessionStorage.setItem('blockUserList', JSON.stringify([]));
      sessionStorage.setItem('friendList', JSON.stringify([]));

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
        const utxos = await maestro.fetchAddressUTxOs(scriptAddress);
        // this is set when the wallet successfully connects
        const walletKeyHashes = sessionStorage.getItem('walletKeyHashes');
        const keyHashes = walletKeyHashes ? JSON.parse(walletKeyHashes) : null;

        // find the utxo that has the datum wallet type that equals the wallet key hashes
        const foundUtxo = utxos.find(utxo => {
          // this is the cogno datum type
          const datum = parseDatumCbor(utxo.output.plutusData!);
          // this is the asset wallet type
          const walletType = datum.fields[0];
          // find the first occurrence of a cogno wallet type that matches the key hashes
          if (walletType.fields[0].bytes === keyHashes.pubKeyHash && walletType.fields[1].bytes === keyHashes.stakeCredential) {
            // a valid cogno holds the cafebabe token else its a fake
            return utxo.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId));
          }
          // nothing is found
          return false;
        });

        // if we did find the cogno utxo then lets get the cogno token name as its the pointer to locate a cogno easily
        if (foundUtxo) {
          const tokenName = foundUtxo.output.amount.find((asset: Asset) => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!))!.unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');
          // set the cognoTokenName field to the found token name then return the found utxo as the cogno
          sessionStorage.setItem('cognoTokenName', tokenName);
          const datum = parseDatumCbor(foundUtxo.output.plutusData!);
          const moderation = datum.fields[2]
          // set the friend list, block user and thread list
          sessionStorage.setItem('friendList', JSON.stringify(moderation.fields[0].list.map((item: BytesField) => item.bytes)));
          sessionStorage.setItem('blockUserList', JSON.stringify(moderation.fields[1].list.map((item: BytesField) => item.bytes)));
          sessionStorage.setItem('blockThreadList', JSON.stringify(moderation.fields[2].list.map((item: BytesField) => item.bytes)));
          return foundUtxo;
        } else {
          return null;
        }
      } catch (error) {
        // something happened during the utxo fetch request
        return null;
      }
    } else {
      // bad network
      return null;
    }
  }, [network]);

  const getNetworkId = useCallback(async () => {
    if (wallet) {
      setisLoadingData(true);
      // get the network and change address from the connected wallet
      const _network = await wallet.getNetworkId();
      const changeAddress = await wallet.getChangeAddress();
      // the change address and public key hashes are set in the session
      sessionStorage.setItem('changeAddress', changeAddress);
      sessionStorage.setItem('walletKeyHashes', JSON.stringify(serializeBech32Address(changeAddress)));
      setNetwork(_network);
      setisLoadingData(false);
    }
  }, [wallet]);

  const refreshCognoAndThreads = async () => {
    // allows the threads and cognos to manually be updated
    setisLoadingData(true);
    const _cogno = await findCogno();
    setCogno(_cogno);
    const _threads = await findThreads();
    setThreads(_threads);
    setisLoadingData(false);
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
        refreshCognoAndThreads()
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
    // this makes sure that a user clicked agreed to the terms and conditions at the index page
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
      const alertMsg = networkFlag === 1 ? 'pre-production' : 'mainnet';
      setNotification(`network must be set to ${alertMsg}`);
      disconnect(); // Automatically disconnect
    }
  }, [network, disconnect]);

  return (
    <div className="flex flex-col lg:w-full min-w-max">
      <NavBar cogno={cogno} connected={connected} network={network} wallet={wallet} refreshCogno={refreshCogno} refreshCognoAndThreads={refreshCognoAndThreads}/>
      {connected ? (
        network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div>
            {isLoadingData ? (
              <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold light-text">Loading Cogno and Thread Data...</p>
              </div>
            ) : (
              <div className="flex flex-col w-full items-center justify-center">
                <Threads threads={threads} network={network} wallet={wallet} refreshThreads={refreshThreads} />
              </div>)
            }
          </div>
        ) : network === parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg font-semibold light-text">Incorrect Network</p>
          </div>
        ) : (
          <div className="text-lg light-text font-semibold ">Network Not Recognized</div>
        )
      ) : (
        <div className="flex h-screen items-center justify-center flex-col light-text text-lg font-semibold ">
          <h1>Connect Your Wallet To Use The Forum</h1>
        </div>
      )}
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </div>
  );
};

export default Forum;
