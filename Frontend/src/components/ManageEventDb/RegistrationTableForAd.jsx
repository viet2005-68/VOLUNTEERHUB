import RegistrationRowSingle from "./RegistrationRowSingle";

export default function RegistrationTableForAd({ registrations, filters, onSelect }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <div className="col-span-5">
          <p className="text-sm font-medium text-gray-600">Volunteer</p>
        </div>
        <div className="col-span-3">
          <p className="text-sm font-medium text-gray-600">User ID</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-600">Registered at</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-600">Status</p>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-200">
        {registrations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No registrations found</div>
        ) : (
          registrations.map((reg) => (
            <RegistrationRowSingle
              key={reg.registrationId}
              reg={reg}
              onSelect={() => onSelect(reg)}
            />
          ))
        )}
      </div>
    </div>
  );
}
