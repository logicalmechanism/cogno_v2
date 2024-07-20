import React, { useState, useEffect } from 'react';

interface BlurImageProps {
  imageUrl: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ imageUrl }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [loadedImageUrl, setLoadedImageUrl] = useState('/default-420x420.png'); // default placeholder for quicker loading times

  useEffect(() => {
    if (!isBlurred) {
      // Load the high-resolution image when unblurring
      setLoadedImageUrl(imageUrl);
    } else {
      // Revert to the placeholder image when blurring again
      setLoadedImageUrl('/default-420x420.png');
    }
  }, [isBlurred, imageUrl]);

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={loadedImageUrl}
        alt="Invalid Cogno Profile Image"
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
