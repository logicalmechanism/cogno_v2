import React, { useState, useEffect } from 'react';
import { UTxO, BrowserWallet, Asset } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { ThreadModal } from './ThreadModal';
import BlurImage from '../BlurImage';
import { hexToString } from '../utilities';

interface ThreadListProps {
  network: number | null;
  wallet: BrowserWallet;
  threads: UTxO[];
  refreshThread: () => void; // Function to refresh threads
}

const ThreadList: React.FC<ThreadListProps> = ({ network, wallet, threads, refreshThread }) => {
  const [filteredThreads, setFilteredThreads] = useState<UTxO[]>(threads);
  const [selectedThread, setSelectedThread] = useState<UTxO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const itemsPerPage = 25; // Number of items per page
  const maxPageButtons = 3; // Maximum number of page buttons to show at a time

  useEffect(() => {
    setFilteredThreads(threads);
    const threadTokenName = sessionStorage.getItem('threadTokenName');
    const updatedThread = threads.find((thread) => {
      return thread.output.amount.find((asset: Asset) => asset.unit.includes(threadTokenName!));
    });
    setSelectedThread(updatedThread!);
    // is this needed?
    setCurrentPage(1);
  }, [threads]);

  const handleFilterAll = () => {
    setFilteredThreads(threads);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleFilterMyThreads = () => {
    const tokenName = sessionStorage.getItem('cognoTokenName');
    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return parsedDatum.fields[5].bytes === tokenName;
    });
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleFilterByCategory = (category: string) => {
    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return hexToString(parsedDatum.fields[3].bytes) === category;
    });
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleThreadClick = (thread: UTxO) => {
    const tokenName = thread.output.amount.find((asset: Asset) => asset.unit.includes(process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!))!.unit.replace(process.env.NEXT_PUBLIC_THREAD_MINTER_SCRIPT_HASH!, '');
    sessionStorage.setItem('threadTokenName', tokenName);
    setSelectedThread(thread);
  };

  const closeModal = () => {
    setSelectedThread(null);
    sessionStorage.setItem('threadTokenName', 'non existent token');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim() === '') {
      setFilteredThreads(threads);
      setCurrentPage(1);
      return;
    }

    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      const field0 = hexToString(parsedDatum.fields[0].bytes).toLowerCase();
      const field1 = hexToString(parsedDatum.fields[1].bytes).toLowerCase();
      const field5 = parsedDatum.fields[5].bytes.toLowerCase();
      const searchValue = value.toLowerCase();

      return field0.includes(searchValue) || field1.includes(searchValue) || field5.includes(searchValue);
    });

    setFilteredThreads(filtered);
    setCurrentPage(1);
  };

  // Calculate the indices for slicing the filtered threads
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentThreads = filteredThreads.slice().reverse().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage);

  // Determine the range of page numbers to show
  const halfMaxPageButtons = Math.floor(maxPageButtons / 2);
  let startPage = Math.max(1, currentPage - halfMaxPageButtons);
  let endPage = Math.min(totalPages, currentPage + halfMaxPageButtons);

  if (endPage - startPage + 1 < maxPageButtons) {
    if (currentPage <= halfMaxPageButtons) {
      endPage = Math.min(totalPages, endPage + (maxPageButtons - (endPage - startPage + 1)));
    } else {
      startPage = Math.max(1, startPage - (maxPageButtons - (endPage - startPage + 1)));
    }
  }

  return (
    <div className="thread-list-container flex flex-col border rounded w-full mb-24">
      {/* Filter Buttons */}
      <div className="flex justify-start my-1">
        <div className="w-1/6"></div> {/* Empty spacer */}
        <button onClick={handleFilterAll} className="bg-blue-200 hover:bg-sky-400 text-black p-2 mx-1 rounded w-1/6">All Threads</button>
        <div className="w-1/6"></div> {/* Empty spacer */}
        <button onClick={handleFilterMyThreads} className="bg-blue-200 hover:bg-sky-400 text-black p-2 mx-1 rounded w-1/6">My Threads</button>
        <div className="w-1/6"></div> {/* Empty spacer */}
        <select onChange={(e) => { handleFilterByCategory(e.target.value) }} className="bg-blue-200 hover:bg-sky-400 text-black border p-2 mx-1 rounded w-1/6 text-center">
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
        <div className="w-1/6"></div> {/* Empty spacer */}
        <input
          placeholder='Search'
          type="text"
          value={searchInput}
          onChange={handleSearchInputChange}
          className="border rounded text-black p-1"
          autoComplete="off"
        />
        <div className="w-1/6"></div> {/* Empty spacer */}
      </div>

      {/* Thread Titles */}
      <div className="flex flex-col space-y-2 items-center my-1">
        {currentThreads.map((thread, index) => {
          const titleField = hexToString(parseDatumCbor(thread.output.plutusData!).fields[0].bytes);
          const imageField = hexToString(parseDatumCbor(thread.output.plutusData!).fields[2].bytes);
          const threadCreatorString = parseDatumCbor(thread.output.plutusData!).fields[5].bytes.slice(0, 16);
          const threadCreator = threadCreatorString.length === 0 ? "Permanent" : threadCreatorString;
          const threadCategory = hexToString(parseDatumCbor(thread.output.plutusData!).fields[3].bytes);
          const numOfComments = parseDatumCbor(thread.output.plutusData!).fields[4].list.length;

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
                onClick={() => { handleThreadClick(thread) }}
              >
                <div className='flex flex-col'>
                  {titleField}
                  <small className='mt-2'>Posted By {threadCreator} To {threadCategory} With {numOfComments} Comments</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button onClick={handleFirstPage} disabled={currentPage === 1} className="mx-1 px-3 py-1 rounded bg-blue-200 hover:bg-sky-400 text-black disabled:opacity-50">
          First
        </button>
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="mx-1 px-3 py-1 rounded bg-blue-200 hover:bg-sky-400 text-black disabled:opacity-50">
          Previous
        </button>
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
          const page = startPage + index;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 px-3 py-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-blue-200 hover:bg-sky-400 text-black'}`}
            >
              {page}
            </button>
          );
        })}
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="mx-1 px-3 py-1 rounded bg-blue-200 hover:bg-sky-400 text-black disabled:opacity-50">
          Next
        </button>
        <button onClick={handleLastPage} disabled={currentPage === totalPages} className="mx-1 px-3 py-1 rounded bg-blue-200 hover:bg-sky-400 text-black disabled:opacity-50">
          Last
        </button>
      </div>

      {/* Modal */}
      {selectedThread && (
        <ThreadModal network={network} wallet={wallet} thread={selectedThread} onClose={closeModal} refreshThread={refreshThread} />
      )}
    </div>
  );
};

export default ThreadList;
