import { useEffect, useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import { MenuItem } from './MenuItem'; // Adjust according to actual import paths
import { WalletBalance } from './WalletBalance'; // Adjust according to actual import paths

// Define TypeScript interface for the component props
interface CardanoWalletProps {
  label?: string;
  onConnected?: () => void; // Updated to be a more specific function type
  isDark?: boolean;
}

export const CardanoWallet: React.FC<CardanoWalletProps> = ({
  label = 'Connect',
  onConnected,
  isDark = false,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const wallets = useWalletList();
  const [hideMenuList, setHideMenuList] = useState<boolean>(true);
  const { connect, connecting, connected, disconnect, name } = useWallet();

  useEffect(() => {
    if (connected && onConnected) {
      onConnected();
    }
  }, [connected, onConnected]);

  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  const bgClass = isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black';

  return (
    <div className="w-fit relative" onMouseEnter={() => setHideMenuList(false)} onMouseLeave={() => setHideMenuList(true)}>
  <button
    type="button"
    className={`flex items-center justify-center w-30 px-4 py-1 ${bgClass}`}
    onClick={() => setHideMenuList(!hideMenuList)}
  >
    <WalletBalance
      name={name}
      connected={connected}
      connecting={connecting}
      label={label}
    />
  </button>
  <div
    className={`absolute transform -translate-x-1/2 text-center -mx-5 w-60 ${bgClass} ${hideMenuList ? 'hidden' : ''}`}
  >
    {!connected && wallets.length > 0 ? (
      <>
        {wallets.map((wallet, index) => (
          <MenuItem
            key={index}
            icon={wallet.icon}
            label={wallet.name}
            action={() => {
              connect(wallet.name);
              setHideMenuList(!hideMenuList);
            }}
            active={name === wallet.name}
          />
        ))}
      </>
    ) : wallets.length === 0 ? (
      <span>No Wallet Found</span>
    ) : (
      <>
        <MenuItem
          active={false}
          label="Disconnect"
          action={disconnect}
          icon={undefined}
        />
      </>
    )}
  </div>
</div>

  );
};
