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
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[10px] border-2 p-5 transition-colors ${
        active
          ? "border-deep-forest bg-deep-forest text-pale-canvas"
          : "border-ash-whisper bg-pale-canvas text-deep-forest hover:border-bubblegum-blush hover:bg-ash-whisper"
      }`}
      onClick={handleClick}
    >
      <Icon size={24} />
      <div className="mt-1 text-sm font-bold leading-[0.85]">{label}</div>
    </div>
  );
}

export default QuickActionButton;
