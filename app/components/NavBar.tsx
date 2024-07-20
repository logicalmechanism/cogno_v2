import Link from 'next/link';
import { useState } from 'react';
import { CardanoWallet } from '../components/CardanoWallet';
import { Profile } from '../components/Profile';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { useRouter } from 'next/router';

interface NavBarProps {
  cogno: UTxO | null;
  connected: boolean;
  network: number | null;
  wallet: BrowserWallet;
  refreshCogno: () => void; // Function to update cogno
}

const NavBar: React.FC<NavBarProps> = ({ cogno, connected, network, wallet, refreshCogno }) => {
  const router = useRouter();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const toggleProfileModal = () => setProfileModalOpen(!isProfileModalOpen);


  const navigateToAbout = () => {
    router.push('/about');
  }

  return (
    <nav className="light-bg py-1 w-full">
      <div className="flex items-center">
        <div className="flex mx-5">
          <CardanoWallet />
          {connected && network !== parseInt(process.env.NEXT_PUBLIC_NETWORK_FLAG!) && (
            <>
              <button className="blue-bg blue-bg-hover dark-text font-bold rounded py-2 px-5 ml-2" onClick={toggleProfileModal}>
                Profile
              </button>
              {connected && cogno ?
                (
                  <div className='medium-text font-bold py-2 px-4 mx-2 h-8 hidden md:block'>
                    <p>Cogno Found</p>
                  </div>
                ) :
                (
                  <div className='medium-text font-bold py-2 px-4 mx-2 h-8 hidden md:block'>
                    <p>Cogno Not Found</p>
                  </div>
                )
              }
            </>
          )}
        </div>
        <div className="flex-grow"></div>
        <div className='dark-text blue-text-hover font-bold py-1 px-4 mx-2 h-8 hidden md:block'>
          <Link href='/forum'>cogno.forum - pre-alpha</Link>
        </div>
        <div className="flex">
          <Link href="/about" className="py-2 px-4 mr-2 rounded dark-text font-bold blue-bg blue-bg-hover">
            About
          </Link>
        </div>
      </div>
      {isProfileModalOpen && <Profile cogno={cogno} network={network} wallet={wallet} onClose={toggleProfileModal} refreshCogno={refreshCogno}/>}
    </nav>
  );
};

export default NavBar;
