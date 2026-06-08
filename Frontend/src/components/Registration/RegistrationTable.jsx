import RegistrationRow from "./RegistrationRow";

export default function RegistrationTable({ data = [], isFetching, onSelect }) {
  return (
    <div className="relative overflow-x-auto rounded-[20px] border-2 border-ash-whisper bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-ash-whisper/70">
            <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">Volunteer</th>
            <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">Event</th>
            <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">Register Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">Status</th>
            <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">Action</th>
          </tr>
        </thead>

        <tbody
          className={
            isFetching ? "opacity-50 transition-opacity" : "transition-opacity"
          }
        >
          {data.length > 0 ? (
            data.map((reg) => (
              <RegistrationRow
                key={reg.registrationId}
                reg={reg}
                onSelect={() => onSelect(reg)}
              />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-16 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
                No registrations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
