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
  return (
    <div
      className={`p-5 pb-2 flex flex-col gap-2 border border-gray-600/20 rounded-xl bg-white h-full shadow-md relative ${className}`}
    >
      <div className="text-2xl font-bold">{title}</div>
      <div className="text-sm text-gray-500">{subtile}</div>
      <div className="flex flex-col gap-5 flex-1 justify-start">
        {children}
      </div>
      {viewMore && path && (
        <div
          className="flex flex-row gap-1 mt-1 cursor-pointer items-center self-end hover:text-blue-500 text-sm"
          onClick={() => navigate(path)}
        >
          <p>View More</p>
          <ArrowRight className="size-4" />
        </div>
      )}
    </div>
  );
}

export default ModalActivity;
