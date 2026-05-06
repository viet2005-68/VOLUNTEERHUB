import React from "react";
import { useAuthStore } from "../../store/authStore";
import { Ban, Mail, LogOut } from "lucide-react";
import storage from "../../utils/storage";

function BanUser() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    // Clear all auth data
    clearAuth();
    storage.clearToken();
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("user");

    // Redirect to landing page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Ban className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Account Suspended
        </h1>

        {/* Message */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-800 text-sm leading-relaxed">
            Your account has been suspended by the administrator. You no longer
            have access to the VolunteerHub platform.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-600" />
            Need Help?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            If you believe this is a mistake or would like to appeal this
            decision, please contact our support team:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[60px]">
                Email:
              </span>
              <a
                href="mailto:support@volunteerhub.com"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                support@volunteerhub.com
              </a>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[60px]">
                Phone:
              </span>
              <a
                href="tel:+1234567890"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
            Common reasons for account suspension:
          </h4>
          <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
            <li>Violation of community guidelines</li>
            <li>Inappropriate behavior or harassment</li>
            <li>Fraudulent activity or misuse of platform</li>
            <li>Multiple policy violations</li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Thank you for your understanding.
        </p>
      </div>
    </div>
  );
}

export default BanUser;
