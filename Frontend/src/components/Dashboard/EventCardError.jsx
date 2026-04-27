import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const EventCardError = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 p-4 rounded-xl border border-red-200 w-full flex items-center gap-3">
      {/* Icon cảnh báo */}
      <div className="p-2 bg-white rounded-full text-red-500 shadow-sm shrink-0">
        <FiAlertCircle size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-red-600 font-medium truncate">
          {message || "Error try again"}
        </p>

        <button
          onClick={onRetry}
          className="mt-1 text-xs flex items-center gap-1 text-red-700 font-bold hover:underline transition-all"
        >
          <FiRefreshCw size={10} /> Thử lại
        </button>
      </div>
    </div>
  );
};

export default EventCardError;
