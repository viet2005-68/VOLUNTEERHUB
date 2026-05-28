import { MessageSquare } from "lucide-react";
import RegistrationStatusBadge from "../Registration/RegistrationStatusBadge";

export default function RegistrationRowSingle({ reg, onSelect, onMessage }) {
  const canMessage =
    reg.registrationStatus === "APPROVED" || reg.registrationStatus === "COMPLETED";

  return (
    <div className="grid grid-cols-12 gap-4 border-b-2 border-ash-whisper px-6 py-5 transition-colors last:border-b-0 hover:bg-ash-whisper/30">
      {/* Volunteer info */}
      <div className="col-span-5 flex items-center gap-3">
        <img
          src={reg.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=volunteer"}
          alt="avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-base font-bold leading-[1.2] text-deep-forest">
            {reg.fullName || "Unknown"}
          </p>
          <p className="text-sm font-medium leading-[1.2] text-deep-forest/60">
            {reg.email || ""}
          </p>
        </div>
      </div>

      {/* User ID */}
      <div className="col-span-3 flex items-center">
        <code className="rounded-[10px] bg-ash-whisper px-3 py-2 text-xs font-bold leading-[1.2] text-deep-forest/70">
          {reg.userId}
        </code>
      </div>

      {/* Registered at */}
      <div className="col-span-2 flex items-center text-sm font-medium leading-[1.2] text-deep-forest/70">
        {new Date(reg.registeredAt).toLocaleString()}
      </div>

      {/* Status */}
      <div className="col-span-2 flex flex-wrap items-center justify-end gap-2">
        <RegistrationStatusBadge status={reg.registrationStatus} />
        <button
          className="rounded-[10px] bg-deep-forest px-3 py-2 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink"
          onClick={() => onSelect(reg)}
        >
          View
        </button>
        {canMessage && onMessage && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[10px] border border-deep-forest/15 px-3 py-2 text-sm font-bold leading-[0.85] text-deep-forest transition-colors hover:bg-ash-whisper"
            onClick={onMessage}
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        )}
      </div>
    </div>
  );
}
