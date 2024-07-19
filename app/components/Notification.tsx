import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  duration?: number; // in milliseconds
  onDismiss: () => void; // Function to call on dismiss
}

const Notification: React.FC<NotificationProps> = ({ message, duration = 2718, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => {
      clearTimeout(timer); // Cleanup the timeout if the component unmounts early
      if (show) {
        onDismiss(); // Ensure cleanup and state reset if the component unmounts prematurely
      }
    }
  }, [message, duration, onDismiss, show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-16 right-4 red-bg dark-text py-4 px-4 rounded">
      {message}
    </div>
  );
};

export default Notification;
