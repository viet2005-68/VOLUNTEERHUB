import RegistrationRow from "./RegistrationRow";

export default function RegistrationTable({ data = [], isFetching, onSelect }) {
  return (
    <div className="bg-white rounded-xl">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr className="border-b border-b-gray-600/20 text-base">
            <th className="p-4 text-left">Volunteer</th>
            <th className="p-4 text-left">Event</th>
            <th className="p-4 text-left">Register Date</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Action</th>
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
              <td colSpan="5" className="p-8 text-center text-gray-500">
                No registrations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
