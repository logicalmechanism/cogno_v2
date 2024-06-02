import React, { useState } from 'react';
import { UTxO, BrowserWallet } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { ThreadModal } from './ThreadModal';
import BlurImage from '../BlurImage';
import { hexToString } from '../utilities';

interface ThreadListProps {
  network: number | null;
  wallet: BrowserWallet;
  threads: UTxO[];
}

const ThreadList: React.FC<ThreadListProps> = ({ network, wallet, threads }) => {
  const [filteredThreads, setFilteredThreads] = useState<UTxO[]>(threads);
  const [selectedThread, setSelectedThread] = useState<UTxO | null>(null);

  const handleFilterAll = () => {
    setFilteredThreads(threads);
  };

  const handleFilterMyThreads = () => {
    const tokenName = sessionStorage.getItem('tokenName');
    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return parsedDatum.fields[5].bytes === tokenName;
    });
  
    setFilteredThreads(filtered);
  };

  const handleFilterByCategory = (category: string) => {
    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return hexToString(parsedDatum.fields[3].bytes) === category;
    });
    setFilteredThreads(filtered);
  };
  
  const handleThreadClick = (thread: UTxO) => {
    setSelectedThread(thread);
  };

  const closeModal = () => {
    setSelectedThread(null);
  };

  return (
    <div className="thread-list-container flex flex-col my-1 border rounded w-full">
      {/* Filter Buttons */}
      <div className="flex justify-start my-1">
        <button onClick={handleFilterAll} className="bg-blue-200 hover:bg-sky-400 text-black p-2 mx-1 rounded w-1/6">All Threads</button>
        <button onClick={handleFilterMyThreads} className="bg-blue-200 hover:bg-sky-400 text-black  p-2 mx-1 rounded w-1/6">My Threads</button>
        <select onChange={(e) => { handleFilterByCategory(e.target.value) }} className="bg-blue-200 hover:bg-sky-400 text-black  border p-2 mx-1 rounded w-1/6 text-center">
          <option value="General">General</option>
          <option value="Blockchain">Blockchain</option>
          <option value="News">News</option>
          <option value="Sports">Sports</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Video Games">Video Games</option>
          <option value="Music">Music</option>
          <option value="Random">Random</option>
          <option value="Adult">Adult</option>
        </select>
      </div>

      {/* Thread Titles */}
      <div className="flex flex-col space-y-2 items-center my-1">
        {filteredThreads.map((thread, index) => {
          const titleField = hexToString(parseDatumCbor(thread.output.plutusData!).fields[0].bytes);
          const imageField = hexToString(parseDatumCbor(thread.output.plutusData!).fields[2].bytes);
      
          return (
            <div
              key={index}
              className="bg-gray-400 py-2 text-black rounded cursor-pointer hover:bg-gray-100 w-11/12 text-center flex h-auto"
            >
              {imageField !== '' && (
                <div className='w-1/6 flex justify-center max-w-full max-h-16'>
                  <BlurImage imageUrl={imageField} />
                </div>
              )}
              <div
                className={imageField !== '' ? 'w-5/6 flex items-center justify-center' : 'w-full flex items-center justify-center'} 
                onClick={() => {handleThreadClick(thread)}}
              >
                {titleField}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedThread && (
        <ThreadModal network={network} wallet={wallet} thread={selectedThread} onClose={closeModal} />
      )}
    </div>
  );
};

export default ThreadList;
