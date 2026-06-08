import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
function ModalActivity({
  title,
  subtile,
  children,
  viewMore,
  path,
  className = "",
  loading = false,
  isError = false,
}) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    if (/^https?:\/\//i.test(path)) {
      window.location.assign(path);
      return;
    }

    navigate(path);
  };

  return (
    <div
      className={`p-5 pb-3 flex flex-col gap-3 border-2 border-ash-whisper rounded-[20px] bg-pale-canvas h-full shadow-sm relative ${className}`}
    >
      <div className="font-clash-grotesk text-2xl font-bold text-deep-forest">{title}</div>
      <div className="text-sm font-medium text-deep-forest/60">{subtile}</div>
      <div className="flex flex-col gap-4 flex-1 justify-start">
        {children}
      </div>
      {viewMore && path && (
        <div
          className="flex flex-row gap-1 mt-1 cursor-pointer items-center self-end text-sm font-bold text-deep-forest hover:text-foudre-pink transition-colors"
          onClick={handleViewMore}
        >
          <p>View More</p>
          <ArrowRight className="size-4" />
        </div>
      )}
    </div>
  );
}

export default ModalActivity;
