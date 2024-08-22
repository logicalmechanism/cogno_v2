import React, { useState } from 'react';

interface ProfileDropdownProps {
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-1/3 px-2">
      <button
        onClick={toggleDropdown}
        className="w-full blue-bg dark-text p-4 rounded-lg flex justify-between items-start focus:outline-none"
      >
        <span>TEXT HERE</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
