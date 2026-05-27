import { Calendar } from "lucide-react";
import RegistrationStatusBadge from "./RegistrationStatusBadge";
import { formatDateTime } from "../../utils/date";

export default function RegistrationRow({ reg, onSelect }) {
  return (
    <tr className="border-b-2 border-ash-whisper text-sm font-medium text-deep-forest transition-colors hover:bg-ash-whisper/30">
      <td className="px-6 py-5 font-bold">{reg.fullName}</td>
      <td className="px-6 py-5 font-medium">{reg.eventName}</td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 font-bold">
          <Calendar className="h-4 w-4 text-foudre-pink" />
          <span>{formatDateTime(reg.registeredAt)}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <RegistrationStatusBadge status={reg.status} />
      </td>
      <td className="px-6 py-5">
        <button className="rounded-[10px] bg-deep-forest px-4 py-3 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink" onClick={onSelect}>
          View details
        </button>
      </td>
    </tr>
  );
}
