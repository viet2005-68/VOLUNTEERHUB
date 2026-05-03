import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, User, X } from "lucide-react";

function ProfileRequiredModal({ isOpen, onClose, missingFields = [], redirectTo = null }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCompleteProfile = () => {
    // Store redirect URL to come back after completing profile
    if (redirectTo) {
      sessionStorage.setItem("redirectAfterProfile", redirectTo);
    }
    navigate("/complete-profile");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please complete your profile to register for events
            </p>

            {missingFields.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Missing information:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {missingFields.map((field) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                      {formatFieldName(field)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCompleteProfile}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <User className="w-5 h-5" />
              Complete Profile
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format field names
function formatFieldName(field) {
  const fieldNames = {
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    dateOfBirth: "Date of Birth",
    address: "Address",
    bio: "Bio",
  };
  return fieldNames[field] || field;
}

export default ProfileRequiredModal;
