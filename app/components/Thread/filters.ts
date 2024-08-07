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

  // filter by the selected category, all is everything
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

  // show threads from the my friend list
  const handleFilterMyFriends = () => {
    const storedFriendList = JSON.parse(sessionStorage.getItem('friendList') || '[]');
    const filtered = threads.filter(thread => {
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      return storedFriendList.some((friend: string) => friend === parsedDatum.fields[5].bytes);
    });
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  // show all threads but ordered by most comments
  const handleFilterTopThreads = () => {
    console.log('filter top threasd');
    
    const filtered = [...threads].sort((a, b) => {
      const parsedDatumA = parseDatumCbor(a.output.plutusData!);
      const parsedDatumB = parseDatumCbor(b.output.plutusData!);
      
      const lengthA = parsedDatumA.fields[4].list.length;
      const lengthB = parsedDatumB.fields[4].list.length;
  
      // Sort in descending order (largest lengths first)
      return lengthA - lengthB;
    });
    setFilteredThreads(filtered);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleFilterBySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // return to all if search is now empty string
    if (value.trim() === '') {
      setFilteredThreads(threads);
      setCurrentPage(1);
      return;
    }

    const filtered = threads.filter(thread => {
      // field 3 is category which already has a filtered
      // field 4 is the comment list which wont be filtered
      //
      // get the parsed thread datum
      const parsedDatum = parseDatumCbor(thread.output.plutusData!);
      // title
      const field0 = hexToString(parsedDatum.fields[0].bytes).toLowerCase();
      // content
      const field1 = hexToString(parsedDatum.fields[1].bytes).toLowerCase();
      // image url
      const field2 = hexToString(parsedDatum.fields[2].bytes).toLowerCase();
      // cogno tkn
      const field5 = parsedDatum.fields[5].bytes.toLowerCase();
      // make everything lowercase
      const searchValue = value.toLowerCase();
      console.log(field2, searchValue);
      //
      // find it somewhere
      return field0.includes(searchValue) || 
             field1.includes(searchValue) || 
             field2.includes(searchValue) || 
             field5.includes(searchValue);
    });

    setFilteredThreads(filtered);
    setCurrentPage(1);
  };

  return {
    handleFilterMyThreads,
    handleFilterByCategory,
    handleFilterMyFriends,
    handleFilterTopThreads,
    handleFilterBySearch,
  };
};