import { UTxO } from '@meshsdk/core';

export const handleFilterAll = (
    threads: UTxO[],
    setFilteredThreads: (threads: UTxO[]) => void,
    setCurrentPage: (page: number) => void,
    setSearchInput: (input: string) => void
) => {
    setFilteredThreads(threads);
    setCurrentPage(1);
    setSearchInput('');
  };