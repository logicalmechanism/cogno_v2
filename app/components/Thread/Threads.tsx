import React, { useState } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { ThreadForm } from './ThreadForm';
import ThreadList from './ThreadList';

interface ThreadsProps {
  threads: UTxO[];
  network: number | null;
  wallet: BrowserWallet;
  refreshThreads: () => void; // Function to refresh threads
}

export const Threads: React.FC<ThreadsProps> = ({ threads, network, wallet, refreshThreads }) => {
  return (
    <div className="container flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 w-full">
      {/* Placeholder for ThreadForm component */}
      <div className='w-full lg:w-1/4 bg-gray-400'>
        <ThreadForm network={network} wallet={wallet} refreshThread={refreshThreads}/>
      </div>
      {/* Placeholder for ThreadList component */}
      <div className='w-full lg:w-3/4'>
        <ThreadList network={network} wallet={wallet} threads={threads} refreshThread={refreshThreads}/>
      </div>
    </div>
  );
};
