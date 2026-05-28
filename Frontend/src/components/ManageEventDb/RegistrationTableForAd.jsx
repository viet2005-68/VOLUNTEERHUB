import RegistrationRowSingle from "./RegistrationRowSingle";

export default function RegistrationTableForAd({ registrations, filters, onSelect, onMessage }) {
  return (
    <div className="min-w-[760px] bg-white">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 bg-ash-whisper/70 px-6 py-4">
        <div className="col-span-5">
          <p className="text-sm font-bold leading-[1.2] text-deep-forest">Volunteer</p>
        </div>
        <div className="col-span-3">
          <p className="text-sm font-bold leading-[1.2] text-deep-forest">User ID</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-bold leading-[1.2] text-deep-forest">Registered at</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-bold leading-[1.2] text-deep-forest">Status / Actions</p>
        </div>
      </div>

      {/* Body */}
      <div>
        {registrations.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
            No registrations found
          </div>
        ) : (
          registrations.map((reg) => (
            <RegistrationRowSingle
              key={reg.registrationId}
              reg={reg}
              onSelect={() => onSelect(reg)}
              onMessage={onMessage ? () => onMessage(reg) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
