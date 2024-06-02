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
      <div className="flex items-center">
        <div className="flex mx-5">
          <CardanoWallet />
          {connected && network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) && (
            <>
              <button className="hover:bg-sky-400 text-black font-bold py-1 px-2 rounded mx-2 h-8" onClick={toggleProfileModal}>
                My Profile
              </button>
              {connected && cogno ?
                (
                  <div className='text-gray-500 font-bold py-1 px-2 mx-2 h-8'>
                    <p>Cogno Is Set</p>
                  </div>
                ) :
                (
                  <div className='text-gray-500 font-bold py-1 px-2 mx-2 h-8'>
                    <p>Please Create A Cogno Using My Profile</p>
                  </div>
                )
              }
            </>
          )}
        </div>
        <div className="flex-grow"></div>
          <div className='text-gray-700 font-bold py-1 px-2 mx-2 h-8'>
            <Link href='/forum'>cogno.sucks</Link>
          </div>
        <div className="flex">
          <Link href="/about" className="text-sm mx-5 px-4 py-2 leading-none border rounded text-black border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">
            About
          </Link>
        </div>
      </div>
      {isProfileModalOpen && <Profile cogno={cogno} network={network} wallet={wallet} onClose={toggleProfileModal} />}
    </nav>
  );
};

export default NavBar;
