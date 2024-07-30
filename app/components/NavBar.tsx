import Link from 'next/link';
import { useState, useCallback } from 'react';
import { CardanoWallet } from '../components/CardanoWallet';
import { Profile } from '../components/Profile';
import { BrowserWallet, UTxO } from '@meshsdk/core';

interface NavBarProps {
  cogno: UTxO | null;
  connected: boolean;
  network: number | null;
  wallet: BrowserWallet;
  refreshCogno: () => void; // Function to update cogno
}

const networkFlag: number = parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG || '-1')

const NavBar: React.FC<NavBarProps> = ({ cogno, connected, network, wallet, refreshCogno }) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const toggleProfileModal = useCallback(() => setProfileModalOpen(prev => !prev), []);


  return (
    <nav className="light-bg py-1 w-full">
      <div className="flex items-center">
        <div className="flex mx-5">
          {/* Custom Cardano Wallet Connector */}
          <CardanoWallet />

          {/* If connected and on correct network then should profile and cogno finder */}
          {connected && network !== networkFlag && (
            <>
              <button
                className="blue-bg blue-bg-hover dark-text font-bold rounded py-2 px-5 ml-2"
                onClick={toggleProfileModal}
              >
                Profile
              </button>
              <div className='medium-text font-bold py-2 px-4 mx-2 h-8 hidden md:block'>
                <p>{cogno ? 'Cogno Found' : 'Cogno Not Found'}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-grow"></div>

        {/* Links */}
        <div className='dark-text blue-text-hover font-bold py-1 px-4 mx-2 h-8 hidden md:block'>
          <Link href='/forum'>cogno.forum - alpha</Link>
        </div>
        <div className="flex">
          <Link href="/about" className="py-2 px-4 mr-2 rounded dark-text font-bold blue-bg blue-bg-hover">
            About
          </Link>
        </div>
      </div>

      {/* Profile modal */}
      {isProfileModalOpen && (
        <Profile 
          cogno={cogno} 
          network={network}
          wallet={wallet} 
          onClose={toggleProfileModal} 
          refreshCogno={refreshCogno}
        />
      )}
    </nav>
  );
};

export default NavBar;
