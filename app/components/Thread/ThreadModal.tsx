// components/Threads/ThreadModal.tsx

import React from 'react';
import { UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import BlurImage from '../BlurImage';

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
  const parsedDatum = parseDatumCbor(thread.output.plutusData!);
  const tokenName = sessionStorage.getItem('tokenName');
  const isOwner = tokenName === parsedDatum.fields[5].bytes;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-600 p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
        <button className="absolute top-0 right-0 m-2 text-xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2 text-black">
          {hexToString(parsedDatum.fields[0].bytes)}
        </h2>
        <p className="mb-4 text-black">
          {hexToString(parsedDatum.fields[1].bytes)}
        </p>
        {parsedDatum.fields[2].bytes && (
          <BlurImage imageUrl={hexToString(parsedDatum.fields[2].bytes)} />
        )}
        <div className="flex justify-end space-x-2">
          {isOwner ? (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => { }}
            >
              Delete Thread
            </button>
          ) : (<></>)}
        </div>
        <div className="mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {}}
          >
            Add Comment
          </button>
          <h3 className="text-lg font-bold">Comments</h3>
          {/* Placeholder for comments */}
        </div>
      </div>
    </div>
  );
};
