import { FC } from "react";

interface SwitchProps {
  isOn: boolean;
  onToggle: (state: boolean) => void;
}

export const Switch: FC<SwitchProps> = ({ isOn, onToggle }) => {
  return (
    <div className="flex items-center">
      <div
        onClick={() => onToggle(!isOn)}
        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          isOn ? 'green-bg' : 'medium-bg'
        }`}
      >
        <div
          className={`light-bg w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
            isOn ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="ml-3 text-gray-700">{isOn ? 'Edit On' : 'Edit Off'}</span>
    </div>
  );
};
