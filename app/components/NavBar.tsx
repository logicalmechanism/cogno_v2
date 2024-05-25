import Link from 'next/link';
import { useState } from 'react';
import { CardanoWallet } from '../components/CardanoWallet';
import { Profile } from '../components/Profile';
import { BrowserWallet, UTxO } from '@meshsdk/core';

interface NavBarProps {
  cogno: UTxO | null;
  connected: boolean;
  network: number | null;
  wallet: BrowserWallet;
}

const NavBar: React.FC<NavBarProps> = ({ cogno, connected, network, wallet }) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const toggleProfileModal = () => setProfileModalOpen(!isProfileModalOpen);

  return (
    <nav className="bg-indigo-200 text-white py-1">
      <div className="container flex justify-between items-center">
        {/* Left section */}
        <div className="flex items-center">
          <Link href="/about" className="text-sm mx-5 px-4 py-2 leading-none border rounded text-black border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">
            About
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {connected && network === 0 && (
            <button className="hover:bg-blue-400 text-black font-bold py-2 px-4 rounded" onClick={toggleProfileModal}>
              My Profile
            </button>
          )}
          <CardanoWallet />
        </div>
      </div>
      {isProfileModalOpen && <Profile cogno={cogno} network={network} wallet={wallet} onClose={toggleProfileModal} />}
    </nav>
  );
};

export default NavBar;
