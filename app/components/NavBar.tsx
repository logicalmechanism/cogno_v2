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
  refreshCogno: () => void; // Function to update cogno
}

const NavBar: React.FC<NavBarProps> = ({ cogno, connected, network, wallet, refreshCogno }) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const toggleProfileModal = () => setProfileModalOpen(!isProfileModalOpen);

  return (
    <nav className="bg-indigo-200 text-white py-1 w-full">
      <div className="flex items-center">
        <div className="flex mx-5">
          <CardanoWallet />
          {connected && network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) && (
            <>
              <button className="hover:bg-sky-400 dark-text font-bold rounded px-2 ml-2" onClick={toggleProfileModal}>
                Profile
              </button>
              {connected && cogno ?
                (
                  <div className='text-gray-500 font-bold py-1 px-2 mx-2 h-8 hidden md:block'>
                    <p>Cogno Found</p>
                  </div>
                ) :
                (
                  <div className='text-gray-500 font-bold py-1 px-2 mx-2 h-8 hidden md:block'>
                    <p>Cogno Not Found</p>
                  </div>
                )
              }
            </>
          )}
        </div>
        <div className="flex-grow"></div>
        <div className='text-gray-700 font-bold py-1 px-4 mx-2 h-8 hidden md:block'>
          <Link href='/forum'>cogno.forum</Link>
        </div>
        <div className="flex">
          <Link href="/about" className="py-2 px-4 mr-2 leading-none border rounded dark-text border-white hover:border-transparent hover:text-blue-500 hover:bg-white">
            About
          </Link>
        </div>
      </div>
      {isProfileModalOpen && <Profile cogno={cogno} network={network} wallet={wallet} onClose={toggleProfileModal} refreshCogno={refreshCogno}/>}
    </nav>
  );
};

export default NavBar;
