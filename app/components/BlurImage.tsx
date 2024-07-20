import React, { useState } from 'react';

interface BlurImageProps {
  imageUrl: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [loadedImageUrl, setLoadedImageUrl] = useState('/default-420x420.png'); // default placeholder for quicker loading times

  const toggleBlur = () => {
    if (isBlurred) {
      // Load the high-resolution image when unblurring
      setLoadedImageUrl(imageUrl);
    }
    setIsBlurred(!isBlurred);
  };

  return (
    <div className="relative max-w-full max-h-96 overflow-hidden">
      <img
        src={loadedImageUrl}
        alt="Invalid Cogno Profile Image"
        className={`transition duration-500 ${isBlurred ? 'blur-2xl' : 'blur-none'} w-full h-full`}
        onClick={toggleBlur}
        loading='lazy'
      />
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center dark-bg bg-opacity-50 light-text cursor-pointer" onClick={toggleBlur}>
          Click To Unblur
        </div>
      )}
    </div>
  );
};

export default BlurImage;
