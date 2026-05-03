import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Confirmation modal for critical status changes
 * Use this for important state transitions that need user confirmation
 */
export default function ConfirmStatusModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  eventTitle,
  loading = false,
}) {
  if (!isOpen) return null;

  const isCritical =
    (currentStatus === "published" && newStatus === "cancelled") ||
    (currentStatus === "published" && newStatus === "archived");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isCritical && (
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Status Change
              </h3>
              <p className="text-sm text-gray-500 mt-1">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to change the status from{" "}
            <span className="font-semibold capitalize">{currentStatus}</span> to{" "}
            <span className="font-semibold capitalize">{newStatus}</span>?
          </p>

          {isCritical && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>Warning:</strong> This action will affect all registered
                volunteers and cannot be easily undone.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isCritical
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Updating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
