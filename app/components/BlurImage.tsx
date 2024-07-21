import React, { useState, useEffect } from 'react';

interface BlurImageProps {
  imageUrl: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [loadedImageUrl, setLoadedImageUrl] = useState('/default-420x420.png'); // default placeholder for quicker loading times

  useEffect(() => {
    let finalUrl = imageUrl;
    // catch the prefixes then do proper parsing
    if (imageUrl.startsWith('ar://')) {
      finalUrl = `https://arweave.net/${imageUrl.slice(5)}`;
    } else if (imageUrl.startsWith('ipfs://')) {
      finalUrl = `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
    } // other image url types can go here

    if (!isBlurred) {
      // Load the image when unblurring
      setLoadedImageUrl(finalUrl);
    } else {
      // Revert to the placeholder image when blurring again
      setLoadedImageUrl('/default-420x420.png');
    }
  }, [isBlurred, imageUrl]);

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  return (
    <div className="relative max-w-full max-h-full overflow-hidden">
      <img
        src={loadedImageUrl}
        alt="Invalid Image"
        className={`transition duration-500 max-w-full max-h-full object-cover ${isBlurred ? 'blur-2xl' : 'blur-none'}`}
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
