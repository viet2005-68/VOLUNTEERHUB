import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";

function ProfileCompletionBanner({ missingFields, onDismiss }) {
  const navigate = useNavigate();

  if (!missingFields || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Your profile is incomplete
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Please complete the following fields: {missingFields.join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/complete-profile")}
              className="px-4 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap"
            >
              Complete Now
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletionBanner;
