import { UTxO } from '@meshsdk/core';
import React, { useState, useEffect } from 'react';
import { findCogno } from '../utilities';
interface ModerationProps {
  title: string;
  isEditing: boolean;
  setCogno?: (value: UTxO) => void;
  network?: number | null,
}

export const Moderation: React.FC<ModerationProps> = ({title, isEditing, setCogno, network}) => {
  const [thisList, setThisList] = useState<string[]>([]);

  useEffect(() => {
    const storedList = JSON.parse(sessionStorage.getItem(title) || '[]');

    setThisList(storedList)
  }, []);

  const handleRemove = (listName: string, item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updatedList = (prevList: string[]) => prevList.filter((i) => i !== item);
    setList((prevList) => {
      const result = updatedList(prevList);
      sessionStorage.setItem(listName, JSON.stringify(result));
      return result;
    });
  };

  const handleItemClick = async (item: string) => {
    if (setCogno && network !== null && network !== undefined) {
      // Assuming item is the UTxO ID or can be used to fetch the UTxO
      const _cogno = await findCogno(item, network)/* Logic to retrieve or create the UTxO object based on the item */;
      if (_cogno) {
        setCogno(_cogno);
      }
    }
  };

  // how to render out each moderation list
  const renderList = (
    list: string[],
    listName: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <div className="rounded p-2 items-center flex flex-col">
      {list.length === 0 ? (
        <p className="dark-text">No items in this list.</p>
      ) : (
        list.map((item, index) => (
          <div key={index} className="w-full flex justify-between items-center mb-1">
            <span
              className="dark-text text-nowrap text-ellipsis overflow-hidden cursor-pointer blue-text-hover light-bg p-2"
              onClick={() => handleItemClick(item)}
            >
              {item}
            </span>
            <button
              type='button'
              onClick={() => handleRemove(listName, item, setList)}
              disabled={!isEditing}
              className={`red-bg ${isEditing ? 'red-bg-hover' : 'cursor-not-allowed'} dark-text font-bold py-1 px-2 ml-2 rounded`}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      {renderList(thisList, title, setThisList)}
    </div>
  );
};
