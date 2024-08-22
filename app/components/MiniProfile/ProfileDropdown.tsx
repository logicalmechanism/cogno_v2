import { UTxO, Asset } from '@meshsdk/core';
import React, { useState, useEffect } from 'react';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString } from '../utilities';

interface ProfileDropdownProps {
  cogno: UTxO | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({cogno}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [threadOwnerToken, setThreadOwnerToken] = useState('');
  const [threadOwnerTitle, setThreadOwnerTitle] = useState('');
  const [threadOwnerImage, setThreadOwnerImage] = useState('');
  const [threadOwnerDetails, setThreadOwnerDetails] = useState('');

  console.log('COGNO', cogno);
  

  useEffect(() => {
    if (cogno) {
      const datum = parseDatumCbor(cogno.output.plutusData!);
      const maybeTokenName = cogno.output.amount.find((asset: Asset) => asset.unit.includes(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!))
      if (maybeTokenName) {
        const tokenName = maybeTokenName.unit.replace(process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!, '');
        setThreadOwnerToken(tokenName);
      }
      setThreadOwnerTitle(hexToString(datum.fields[1].fields[0].bytes) || '');
      setThreadOwnerImage(hexToString(datum.fields[1].fields[1].bytes) || '');
      setThreadOwnerDetails(hexToString(datum.fields[1].fields[2].bytes) || '');
    }
  }, [cogno]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-3/4 px-2">
      <button
        onClick={toggleDropdown}
        className={`w-full light-bg dark-text p-4 rounded-lg flex justify-start items-start focus:outline-none ${threadOwnerToken ? 'cursor-pointer' : ''}`}
        disabled={threadOwnerToken ? false : true}
      >
        <span className='dark-text blue-text-hover px-2'>{threadOwnerToken}</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''} ${threadOwnerToken ? 'blue-text-hover' : 'invisible'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className={`mt-2 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-4 light-bg rounded-lg dark-text">
          SOMETHING HERE
        </div>
      </div>
    </div>
  );
};
