import React, { useState } from 'react';

interface BlurImageProps {
  imageUrl: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl }) => {
  const [isBlurred, setIsBlurred] = useState(true);

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  return (
    <div className="relative max-w-full max-h-full">
      <img
        src={imageUrl}
        alt="Invalid Cogno Profile Image"
        className={`transition duration-500 ${isBlurred ? 'blur-md' : 'blur-none'}`}
        onClick={toggleBlur}
      />
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl cursor-pointer" onClick={toggleBlur}>
          Click To Unblur
        </div>
      )}
    </div>
  );
};

export default BlurImage;
