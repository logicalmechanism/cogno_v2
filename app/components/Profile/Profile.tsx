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
    <div className="fixed inset-0 overflow-y-auto z-50" id="profile-modal">
      <div className="relative top-20 mx-auto p-5 border rounded-md light-bg lg:max-w-screen-lg w-full">
        {/* Top right close button */}
        <button
          className="text-5xl absolute top-0 right-0 mt-2 mr-2 dark-text"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mt-3 text-center">
          <h3 className="text-3xl font-medium dark-text">Cogno Profile</h3>
          <div >
            <Cogno network={network} wallet={wallet} cogno={cogno} refreshCogno={refreshCogno} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};
