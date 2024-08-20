import { FC, ReactNode, ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  onClick:  () => void;
  children: ReactNode;
}

export const ActionButton: FC<ActionButtonProps> = ({ isSubmitting, onClick, children, ...props }) => {
  return (
    <div>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};