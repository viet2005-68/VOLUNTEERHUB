import React from "react";
import { useNavigate } from "react-router-dom";

function QuickActionButton({
  label,
  onClick,
  icon,
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
      className={`flex min-h-[124px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[12px] border-2 px-5 py-7 transition-colors ${
        active
          ? "border-deep-forest bg-deep-forest text-pale-canvas"
          : "border-ash-whisper bg-pale-canvas text-deep-forest hover:border-bubblegum-blush hover:bg-ash-whisper"
      }`}
      onClick={handleClick}
    >
      {React.createElement(icon, { size: 26 })}
      <div className="text-sm font-bold leading-[1.05]">{label}</div>
    </div>
  );
}

export default QuickActionButton;
