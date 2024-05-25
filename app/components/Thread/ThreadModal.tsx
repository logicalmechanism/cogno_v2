// components/Threads/ThreadModal.tsx

import React, { useState } from 'react';
import { UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import BlurImage from '../BlurImage';
import SuccessText from '../SuccessText';
import Notification from '../Notification';

interface ThreadModalProps {
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

export const ThreadModal: React.FC<ThreadModalProps> = ({ thread, onClose }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');
  const parsedDatum = parseDatumCbor(thread.output.plutusData!);
  const tokenName = sessionStorage.getItem('tokenName');
  const isOwner = tokenName === parsedDatum.fields[5].bytes;

  const handleSubmit = async (e: React.FormEvent) => {};
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-600 p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
        <div className="flex space-x-4">
          <button className="bg-blue-400 text-white px-4 py-2 mx-2 w-1/4 h-10" onClick={onClose}>
            Close
          </button>
          <div className="w-1/4"></div> {/* Empty spacer */}
          <div className="w-1/4"></div> {/* Empty spacer */}
          {isOwner ? (
            <button
              className="bg-red-400 text-white px-4 py-2 mx-2 rounded w-1/4 h-10"
              onClick={() => { }}
            >
              Delete
            </button>
          ) : (<></>)}
        </div>
        <div className="flex space-x-4">
          <div className="flex-grow"></div>
          <h2 className="text-xl font-bold mb-2 text-black mx-2">
            {hexToString(parsedDatum.fields[0].bytes)}
          </h2>
          <div className="flex-grow"></div>
        </div>
        <div className='flex space-x-4'>
          <div className="flex-grow"></div>
          <p className="mb-2 text-black mx-2">
            {hexToString(parsedDatum.fields[1].bytes)}
          </p>
          <div className="flex-grow"></div>
        </div>
        {parsedDatum.fields[2].bytes && (
          <BlurImage imageUrl={hexToString(parsedDatum.fields[2].bytes)} />
        )}
        <div className="flex space-x-4">
          <form onSubmit={handleSubmit} className="thread-form border p-4 rounded">
            {showSuccessLink && <SuccessText txHash={submittedTxHash} />}
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2">Title</label>
              <input
                type="text"
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
              onClick={() => {}}
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
