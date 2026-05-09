import { Calendar } from "lucide-react";

export default function RegistrationRowSingle({ reg, onSelect }) {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
      {/* Volunteer info */}
      <div className="col-span-5 flex items-center gap-3">
        <img
          src={reg.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=volunteer"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {reg.fullName || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">{reg.email || ""}</p>
        </div>
      </div>

      {/* User ID */}
      <div className="col-span-3 flex items-center">
        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {reg.userId}
        </code>
      </div>

      {/* Registered at */}
      <div className="col-span-2 flex items-center text-sm text-gray-700">
        {new Date(reg.registeredAt).toLocaleString()}
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center justify-between">
        <RegistrationStatusBadge status={reg.registrationStatus} />
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() => onSelect(reg)}
        >
          View
        </button>
      </div>
    </div>
  );
}
