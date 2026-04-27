import React from "react";
import { useNavigate } from "react-router-dom";

function QuickActionButton({
  label,
  onClick,
  icon: Icon,
  active,
  navigate: navigateTo,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition hover:scale-100 gap-3 border-1 border-gray-600/20 shadow-xs ${
        active
          ? "text-indigo-300 bg-gray-800 hover:bg-gray-800/10 hover:text-indigo-600"
          : "text-black"
      }`}
      onClick={handleClick}
    >
      <Icon size={24} />
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
}

export default QuickActionButton;
