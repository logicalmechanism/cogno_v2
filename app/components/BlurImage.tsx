import React, { useState, useEffect, useCallback } from 'react';

interface BlurImageProps {
  imageUrl: string;
}

const parseImageUrl = (url: string): string => {
  if (url.startsWith('ar://')) {
    return `https://arweave.net/${url.slice(5)}`;
  } else if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  // Add more URL parsing logic here if needed
  return url;
};

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [loadedImageUrl, setLoadedImageUrl] = useState('/default-420x420.png'); // default placeholder for quicker loading times
  const [isLoading, setIsLoading] = useState(false); // show a loading text when the image being lazy loaded

  useEffect(() => {
    setIsLoading(true);

    const finalUrl = parseImageUrl(imageUrl);

    if (!isBlurred) {
      // Load the image when unblurring
      setLoadedImageUrl(finalUrl);
    } else {
      // Revert to the placeholder image when blurring again
      setLoadedImageUrl('/default-420x420.png');
    }
  }, [isBlurred, imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const toggleBlur = useCallback(() => {
    setIsBlurred(prev => !prev);
  }, []);

  return (
    <div className="relative max-w-full max-h-full overflow-hidden">
      <img
        src={loadedImageUrl}
        alt="Invalid Image"
        className={`transition duration-500 max-w-full max-h-full object-cover ${isBlurred ? 'blur-2xl' : 'blur-none'}`}
        onClick={toggleBlur}
        onLoad={handleImageLoad}
        loading='lazy'
      />

      {/* If the image is loading then show the loading text */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center dark-bg bg-opacity-50 light-text">
          Loading...
        </div>
      )}

      {/* if blurred and not loading then show the click to unblur text */}
      {isBlurred && !isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center dark-bg bg-opacity-50 light-text cursor-pointer" 
          onClick={toggleBlur}
          role="button"
          aria-label="Click to unblur the image"
        >
          Click To Unblur
        </div>
      )}
    </div>
  );
};

export default BlurImage;
