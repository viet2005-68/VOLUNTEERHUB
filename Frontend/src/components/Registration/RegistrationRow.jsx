import { Calendar } from "lucide-react";
import RegistrationStatusBadge from "./RegistrationStatusBadge";
import { formatDateTime } from "../../utils/date";

export default function RegistrationRow({ reg, onSelect }) {
  return (
    <tr className="border-b border-b-gray-600/20 hover:bg-gray-50 max-sm:text-sm">
      <td className="p-4 font-medium">{reg.fullName}</td>
      <td className="p-4">{reg.eventName}</td>
      <td className="p-4 inline-flex gap-2 items-center">
        <span>
          <Calendar className="w-4 h-4 text-blue-400" />
        </span>
        <span>{formatDateTime(reg.registeredAt)}</span>
      </td>
      <td className="p-4">
        <RegistrationStatusBadge status={reg.status} />
      </td>
      <td className="p-4">
        <button className="text-blue-600 hover:underline" onClick={onSelect}>
          View details
        </button>
      </td>
    </tr>
  );
}
