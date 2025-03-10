import React from 'react';
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

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 w-full my-2">
      {/* Placeholder for ThreadForm component */}
        <div className='w-full lg:w-1/4 light-bg h-full rounded'>
          <ThreadForm network={network} wallet={wallet} refreshThread={refreshThreads}/>
        </div>
        {/* Placeholder for ThreadList component */}
        <div className='w-full lg:w-3/4'>
          <ThreadList network={network} wallet={wallet} threads={threads} refreshThread={refreshThreads}/>
        </div>
      <button
        onClick={handleBackToTop}
        className="fixed bottom-4 right-4 blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
      >
        Back to Top
      </button>
    </div>
  );
};
