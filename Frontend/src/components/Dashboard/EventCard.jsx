import React from "react";

function EventCard({ label, value, icon, growth }) {
  return (
    <div className="text-2xl font-bold  text-black h-full">
      <div className="h-full flex justify-between rounded-2xl p-4 border-1 bg-white w-[100%] border-gray-600/20">
        <div className="">
          <div className="text-lg max-sm:text-sm font-normal text-foreground text-gray-900/40 overflow-ellipsis">
            {label}
          </div>
          <div className="flex items-center gap-2">
            <div className="max-sm:text-2xl">{value}</div>
            {growth && (
              <span className="text-sm font-medium text-green-500">
                {growth}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center-safe">
          <div className="w-[2/5]">{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
