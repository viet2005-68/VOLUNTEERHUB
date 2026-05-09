import React from "react";

function Badge({ title, description, icon, active }) {
  const isEarn = active ? "Earned" : "Not Earned";

  const bgEarn = active ? "bg-yellow-300/40" : "grayscale";
  return (
    <div
      className={`p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-5 border-1 border-gray-600/20 ${bgEarn} w-full`}
    >
      <div className="w-1/2 lg:mt-5">
        <img src={icon} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-lg max-sm:text-sm font-semibold overflow-ellipsis line-clamp-1 text-center">
          {title}
        </div>
        <div className="text-sm text-gray-500 overflow-ellipsis line-clamp-1 text-center">
          {description}
        </div>
      </div>
      <div
        className={`${
          active ? "bg-black text-white" : "text-black bg-gray-600/20"
        }  px-2 py-1 rounded-full`}
      >
        {isEarn}
      </div>
    </div>
  );
}

export default Badge;
