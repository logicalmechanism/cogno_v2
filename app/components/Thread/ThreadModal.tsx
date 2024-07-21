import React, { useState, useEffect, useRef } from 'react';
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
import type {BytesField, Datum} from './transaction'

interface ThreadModalProps {
  network: number | null;
  wallet: BrowserWallet;
  thread: UTxO;
  onClose: () => void;
  refreshThread: () => void; // Function to refresh threads
}

export const ThreadModal: React.FC<ThreadModalProps> = ({network, wallet, thread, onClose, refreshThread }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');
  const [parsedDatum, setParsedDatum] = useState<Datum>(parseDatumCbor(thread.output.plutusData!));
  const commentsRef = useRef<HTMLDivElement>(null);

  const handleScrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setParsedDatum(parseDatumCbor(thread.output.plutusData!));
  }, [thread]);


  const tokenName = sessionStorage.getItem('cognoTokenName');
  const isOwner = tokenName === (parsedDatum.fields[5] as BytesField).bytes;
  const hasImage = (parsedDatum.fields[2] as BytesField).bytes;
  const hasContent = (parsedDatum.fields[1] as BytesField).bytes;

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
      sessionStorage.setItem('threadTokenName', 'non existent token');
      onClose();
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

  const handleBackToTop = () => {
    if (modalRef.current) {
      modalRef.current.scrollTo(0, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-45 flex items-center justify-center z-50">
      <div className="light-bg p-6 rounded max-w-7xl w-full relative  max-h-[80vh] overflow-y-auto border-4 medium-border" ref={modalRef}>
        {notification && <Notification message={notification} onDismiss={clearNotification} />}
        {/* delete and close button */}
        <div className="flex space-x-4">
          {isOwner ? (
            <button
              className="red-bg red-bg-hover dark-text px-4 py-2 mx-2 rounded w-1/4 h-10"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Thread
            </button>
          ) : (<></>)}
          <div className="w-1/4"></div> {/* Empty spacer */}
          <div className="w-1/4"></div> {/* Empty spacer */}
          <button
            className="text-5xl absolute top-0 right-1 mt-2 mr-4 w-1/4 dark-text"
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
          <h2 className="text-3xl font-bold dark-text m-4">
            {hexToString((parsedDatum.fields[0] as BytesField).bytes)}
          </h2>
          <div className="flex-grow"></div>
        </div>
        {/* content */}
        <div className='flex space-x-4'>
          {/* Blur Image */}
          {hasImage && (
            <div className={`${hasContent ? 'w-1/3' : 'w-full'}`}>
              <div className='flex justify-center'>
                <BlurImage imageUrl={hexToString(hasImage)} />
              </div>
            </div>
          )}
          {hasContent && (
            <div className={`${hasImage ? 'w-2/3' : 'w-full'} flex-grow overflow-auto max-h-96`}>
              <p className="dark-text overflow-auto">
                {hexToString(hasContent)}
              </p>
            </div>
          )}
        </div>
        {/* Comments here*/}
        <div ref={commentsRef}></div>
        <Comments thread={thread} network={network} wallet={wallet} refreshThread={refreshThread}/>
        <div className='items-center flex'>
          <div className="flex-grow"></div>
          <button
            onClick={handleBackToTop}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Back to Top
          </button>
          <div className="flex-grow"></div>
          <button
            onClick={handleScrollToComments}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Make A Comment
          </button>
          <div className="flex-grow"></div>
          <button
            onClick={onClose}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Close Thread
          </button>
          <div className="flex-grow"></div>
        </div>
      </div>
    </div>
  );
};
