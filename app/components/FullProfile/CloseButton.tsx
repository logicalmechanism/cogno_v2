import { FC } from "react";

interface CloseButtonProps {
  onClose: () => void; // Function to close the modal
}

export const CloseButton: FC<CloseButtonProps> = ({ onClose }) => {
  return (
    <div>
      <button
        className="text-5xl dark-text"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};
