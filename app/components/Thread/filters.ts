import { UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString } from '../utilities';


type SetFilteredThreads = (threads: UTxO[]) => void;
type SetCurrentPage = (page: number) => void;
type SetSearchInput = (input: string) => void;

// higher order function of functions for filters
export const createFilterFunctions = (
  setFilteredThreads: SetFilteredThreads,
  setCurrentPage: SetCurrentPage,
  setSearchInput: SetSearchInput,
  threads: UTxO[]
) => {

  // show all threads
  const handleFilterAll = () => {
    setFilteredThreads(threads);
    setCurrentPage(1);
    setSearchInput('');
  };

  // show threads from a specific cogno
  const handleFilterMyThreads = () => {
    const cognoTokenName = sessionStorage.getItem('cognoTokenName');

    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return parsedDatum.fields[5].bytes === cognoTokenName;
    });
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleFilterByCategory = (category: string) => {
    let filtered;
    if (category === "All") {
      filtered = threads
    } else {
      filtered = threads.filter(thread => {
        const parsedDatum = parseDatumCbor(thread.output.plutusData!);
        return hexToString(parsedDatum.fields[3].bytes) === category;
      });
    }
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  return {
    handleFilterAll,
    handleFilterMyThreads,
    handleFilterByCategory
  };
};