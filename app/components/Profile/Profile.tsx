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
  refreshCogno: () => void; // Function to refresh cogno
}

export const Profile: FC<ProfileProps> = ({ cogno, network, wallet, onClose, refreshCogno }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="profile-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-400">
        {/* Top right close button */}
        <button
          className="text-5xl absolute top-0 right-0 mt-2 mr-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mt-3 text-center">
          <h3 className="text-3xl font-medium text-gray-900">Cogno Profile</h3>
          <div >
            <Cogno network={network} wallet={wallet} cogno={cogno} refreshCogno={refreshCogno} />
          </div>
        </div>
      </div>
    </div>
  );
};
