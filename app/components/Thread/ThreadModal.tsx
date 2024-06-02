// components/Threads/ThreadModal.tsx

import React, { useState } from 'react';
import { UTxO } from '@meshsdk/core';
import { BrowserWallet } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import BlurImage from '../BlurImage';
import SuccessText from '../SuccessText';
import Notification from '../Notification';
import { handleThreadDeletion } from './transaction';

interface ThreadModalProps {
  network: number | null;
  wallet: BrowserWallet;
  thread: UTxO;
  onClose: () => void;
}

function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexCode = parseInt(hex.substring(i, i + 2), 16);
    str += String.fromCharCode(hexCode);
  }
  return str;
}

export const ThreadModal: React.FC<ThreadModalProps> = ({network, wallet, thread, onClose }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');
  const parsedDatum = parseDatumCbor(thread.output.plutusData!);
  const tokenName = sessionStorage.getItem('tokenName');
  const isOwner = tokenName === parsedDatum.fields[5].bytes;

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
      
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
        {/* Comment form */}
        <div className="flex space-x-4">
          <form onSubmit={handleSubmit} className="thread-form border p-4 rounded">
            
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">Comment</label>
              <input
                type="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border p-2 rounded w-full text-black"
                required
                autoComplete="off"
                maxLength={300}
              />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => { }}
            >
              Add Comment
            </button>
            {notification && <Notification message={notification} onDismiss={clearNotification} />}
          </form>
        </div>
        <div>
          <h3 className="text-lg font-bold">Comments</h3>
          {/* Placeholder for comments */}
        </div>
      </div>
    </div>
  );
};
