import React, { useState, useEffect, useCallback } from 'react';

interface BlurImageProps {
  imageUrl: string;
  // the width and height of the image
  width?: number;
  height?: number;
}

const parseImageUrl = (url: string): string => {
  // Support for Arweave and IPFS for now
  if (url.startsWith('ar://')) {
    return `https://arweave.net/${url.slice(5)}`;
  } else if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  // Add more URL parsing logic here if needed
  return url;
};

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl, width = 420, height = 420 }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [loadedImageUrl, setLoadedImageUrl] = useState('/default-420x420.png'); // default placeholder for quicker loading times
  const [isLoadingImage, setisLoadingImage] = useState(false); // show a loading text when the image being lazy loaded


  useEffect(() => {
    const finalUrl = parseImageUrl(imageUrl);
    if (!isBlurred) {
      setisLoadingImage(true);
      // Load the image when unblurring
      setLoadedImageUrl(finalUrl);
    } else {
      // Revert to the placeholder image when blurring again
      setLoadedImageUrl('/default-420x420.png');
    }
  }, [isBlurred, imageUrl]);

  const handleImageLoad = () => {
    setisLoadingImage(false);
  };

  const handleImageError = () => {
    setisLoadingImage(false);
    setLoadedImageUrl('/error-420x420.png');
  };

  const toggleBlur = useCallback(() => {
    setIsBlurred(prev => !prev);
  }, []);

  return (
    <div 
      className="relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={loadedImageUrl}
          alt="Invalid Image"
          className={`transition duration-500 max-w-full max-h-full object-contain ${isBlurred ? 'blur-2xl' : 'blur-none'}`}
          onClick={toggleBlur}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading='lazy'
        />
      </div>

      {/* If the image is loading then show the loading text */}
      {isLoadingImage && (
        <div className="absolute inset-0 flex items-center justify-center dark-bg bg-opacity-50 light-text">
          Loading...
        </div>
      )}

      {/* if blurred and not loading then show the click to unblur text */}
      {isBlurred && !isLoadingImage && (
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
