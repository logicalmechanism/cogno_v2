import { FC, useState } from "react";
import { BrowserWallet, UTxO } from '@meshsdk/core';
import Cogno from './Cogno';

export interface OutputAmount {
  unit: string;
  quantity: string;
}

interface ProfileProps {
  cogno: UTxO | null;
  network: number | null;
  wallet: BrowserWallet;
  onClose: () => void; // Function to close the modal
}

export const Profile: FC<ProfileProps> = ({ cogno, network, wallet, onClose }) => {
  // const [cogno, setCogno] = useState<null | UTxO>(null);
  const [isSearchStatus, setSearchStatus] = useState(true);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="profile-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        {/* Top right close button */}
        <button
          className="absolute top-0 right-0 mt-2 mr-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          <div >
            <Cogno network={network} wallet={wallet} cogno={cogno} onClose={onClose} />
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
