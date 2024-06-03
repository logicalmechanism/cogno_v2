// components/Threads/ThreadModal.tsx

import React, { useState } from 'react';
import { UTxO } from '@meshsdk/core';
import { BrowserWallet } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import BlurImage from '../BlurImage';
import SuccessText from '../SuccessText';
import {Comments} from './Comments';
import { handleThreadDeletion } from './transaction';
import { hexToString } from '../utilities';
import { MaestroProvider } from '@meshsdk/core';
import Notification from '../Notification';

interface ThreadModalProps {
  network: number | null;
  wallet: BrowserWallet;
  thread: UTxO;
  onClose: () => void;
  refreshThread: () => void; // Function to refresh threads
}

export const ThreadModal: React.FC<ThreadModalProps> = ({network, wallet, thread, onClose, refreshThread }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');
  const parsedDatum = parseDatumCbor(thread.output.plutusData!);
  const tokenName = sessionStorage.getItem('tokenName');
  const isOwner = tokenName === parsedDatum.fields[5].bytes;

  const checkTransaction = (network: number, message: string) => {
    const networkName = network === 0 ? 'Preprod' : 'Mainnet';
    const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

    const maxRetries = 250;

    maestro.onTxConfirmed(message, async () => {
      refreshThread();
      setNotification('Transaction Is On-Chain');
      // reset all the values
      setIsSubmitting(false);
      setSubmittedTxHash('');
      setShowSuccessLink(false);
    }, maxRetries);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    const result = await handleThreadDeletion(network, wallet, thread);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);

    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      checkTransaction(network!, result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
        {notification && <Notification message={notification} onDismiss={clearNotification} />}
        {/* delete and close button */}
        <div className="flex space-x-4">
          {isOwner ? (
            <button
              className="bg-red-200 hover:bg-rose-400 text-black px-4 py-2 mx-2 rounded w-1/4 h-10"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Thread
            </button>
          ) : (<></>)}
          <div className="w-1/4"></div> {/* Empty spacer */}
          <div className="w-1/4"></div> {/* Empty spacer */}
          <button
            className="text-5xl absolute top-0 right-1 mt-2 mr-4 w-1/4 text-black hover:text-gray-900"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className='flex flex-col text-center items-center'>
          {showSuccessLink && <SuccessText txHash={submittedTxHash} />}
        </div>
        {/* title */}
        <div className="flex space-x-4">
          <div className="flex-grow"></div>
          <h2 className="text-xl font-bold mb-2 text-black mx-2">
            {hexToString(parsedDatum.fields[0].bytes)}
          </h2>
          <div className="flex-grow"></div>
        </div>
        {/* content */}
        <div className='flex space-x-4'>
          {/* Blur Image */}
          <div className='w-1/3'>
            <div className='flex justify-center'>
              {parsedDatum.fields[2].bytes && (
                <BlurImage imageUrl={hexToString(parsedDatum.fields[2].bytes)} />
              )}
            </div>
          </div>
          <div className='w-2/3 flex-grow overflow-auto max-h-96'>
            <p className="text-black overflow-auto">
              {hexToString(parsedDatum.fields[1].bytes)}
            </p>
          </div>
        </div>
        {/* Comments here*/}
        <Comments thread={thread} network={network} wallet={wallet} refreshThread={refreshThread}/>
      </div>
    </div>
  );
};
