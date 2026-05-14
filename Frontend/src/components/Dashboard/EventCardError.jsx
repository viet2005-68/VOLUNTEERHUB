import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const EventCardError = ({ message, onRetry }) => {
  return (
    <div className="bg-ash-whisper p-4 rounded-2xl border border-foudre-pink/20 w-full flex items-center gap-3 text-deep-forest">
      {/* Icon cảnh báo */}
      <div className="p-2 bg-pale-canvas rounded-full text-foudre-pink shrink-0">
        <FiAlertCircle size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foudre-pink font-bold truncate">
          {message || "Error try again"}
        </p>

        <button
          onClick={onRetry}
          className="mt-1 text-xs flex items-center gap-1 text-deep-forest font-bold hover:text-foudre-pink transition-all"
        >
          <FiRefreshCw size={10} /> Thử lại
        </button>
      </div>
    </div>
  );
};

export default EventCardError;
