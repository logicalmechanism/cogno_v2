import React, { useState } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { ThreadForm } from './ThreadForm';
import ThreadList from './ThreadList';

interface ThreadsProps {
  threads: UTxO[];
  network: number | null;
  wallet: BrowserWallet;
}

export const Threads: React.FC<ThreadsProps> = ({ threads, network, wallet }) => {
  return (
    <div className="container flex space-x-4">
      {/* Placeholder for ThreadForm component */}
      <div className='w-1/3 bg-gray-400'>
        <ThreadForm network={network} wallet={wallet}/>
      </div>
      {/* Placeholder for ThreadList component */}
      <div className='w-2/3'>
        <ThreadList threads={threads}/>
      </div>
    </div>
  );
};
