import { useRouter } from "next/router";
import { useWallet } from '@meshsdk/react';
import { useState, useEffect, useCallback } from "react";
import { UTxO, Asset } from '@meshsdk/core';
import { MaestroProvider } from '@meshsdk/core';
import { scriptHashToBech32, parseDatumCbor } from '@meshsdk/mesh-csl';
import { serializeBech32Address } from '@meshsdk/mesh-csl';
// components
import NavBar from '../components/NavBar';
import Notification from '../components/Notification';
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
          const datum = parseDatumCbor(utxo.output.plutusData);
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
          const tokenName = foundUtxo.output.amount.find((asset: Asset) => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!)).unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');
          // set the cognoTokenName field to the found token name then return the found utxo as the cogno
          sessionStorage.setItem('cognoTokenName', tokenName);
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
      // get the network and change address from the connected wallet
      const _network = await wallet.getNetworkId();
      const changeAddress = await wallet.getChangeAddress();
      // the change address and public key hashes are set in the session
      sessionStorage.setItem('changeAddress', changeAddress);
      sessionStorage.setItem('walletKeyHashes', JSON.stringify(serializeBech32Address(changeAddress)));
      setNetwork(_network);
    }
  }, [wallet]);

  const refreshCognoAndThreads = async () => {
    // allows the threads and cognos to manually be updated
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
      const alertMsg = networkFlag === 1 ? 'Pre-Production' : 'Mainnet';
      setNotification(`Network Must Be Set To ${alertMsg}!`);
      const timer = setTimeout(() => {
        disconnect(); // Automatically disconnect
      }, 2718);

      return () => {
        clearTimeout(timer); // Cleanup the timeout if the component unmounts early
      }
    }
  }, [network, disconnect]);

  return (
    <div className="flex flex-col lg:w-full min-w-max">
      <NavBar cogno={cogno} connected={connected} network={network} wallet={wallet} refreshCogno={refreshCogno} />
      {connected ? (
        network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold light-text">Loading Cogno and Thread Data...</p>
              </div>
            ) : (
              <div className="flex flex-col w-full items-center justify-center">
                <div className="w-auto">
                  <button
                    className="px-4 py-2 my-2 green-bg dark-text text-base font-medium rounded green-bg-hover"
                    type="button"
                    onClick={refreshCognoAndThreads}
                  >
                    Refresh Cogno
                  </button>
                </div>
                <Threads threads={threads} network={network} wallet={wallet} refreshThreads={refreshThreads} />
              </div>)
            }
          </div>
        ) : network === parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg font-semibold light-text">Incorrect Network</p>
          </div>
        ) : (
          <div className="light-text">Network Not Recognized</div>
        )
      ) : (
        <div className="flex h-screen items-center justify-center flex-col light-text">
          <h1>Connect Your Wallet To Use The Forum</h1>
        </div>
      )}
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </div>
  );
};

export default Forum;
