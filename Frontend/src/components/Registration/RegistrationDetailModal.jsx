import { useState, useEffect } from "react";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useReviewRegistration } from "../../hook/useRegistration";

export default function RegistrationDetailModal({ registration, onClose }) {
  const [note, setNote] = useState("");
  const reviewMutation = useReviewRegistration();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const status = registration.registrationStatus || "UNKNOWN";
  const isPending = status === "PENDING";

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "Chưa có";
    if (typeof address !== "object") return address;

    return (
      [address.street, address.district, address.province]
        .filter(Boolean)
        .join(", ") || "Chưa có"
    );
  };

  const getInitial = () =>
    registration.fullName?.trim()?.charAt(0)?.toUpperCase() || "V";

  const statusClass =
    {
      PENDING: "bg-amber-100 text-amber-800 border-amber-200",
      APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      COMPLETED: "bg-deep-forest text-pale-canvas border-deep-forest",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
    }[status] || "bg-deep-forest/10 text-deep-forest border-deep-forest/15";

  const handleReject = () => {
    reviewMutation.mutate(
      {
        eventId: registration.eventId,
        participantId: registration.userId,
        status: "REJECTED",
        note: note.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleApprove = () => {
    reviewMutation.mutate(
      {
        eventId: registration.eventId,
        participantId: registration.userId,
        status: "APPROVED",
        note: note.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const InfoItem = ({ icon, label, value, className = "" }) => (
    <div
      className={`flex min-w-0 gap-3 rounded-lg border border-deep-forest/10 bg-white/80 p-3 ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-deep-forest/10 text-deep-forest">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase leading-[1] text-deep-forest/55">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold leading-[1.25] text-deep-forest">
          {value || (
            <span className="font-medium italic text-deep-forest/45">
              Chưa có
            </span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-forest/65 p-0 font-clash-grotesk backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-deep-forest/15 bg-pale-canvas shadow-2xl sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-2xl">
        <div className="relative border-b border-deep-forest/10 bg-gradient-to-br from-pale-canvas to-deep-forest/5 px-5 py-5 sm:px-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-deep-forest/65 transition hover:bg-deep-forest hover:text-pale-canvas"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            {registration.avatarUrl ? (
              <img
                src={registration.avatarUrl}
                alt={registration.fullName || "User"}
                className="h-16 w-16 shrink-0 rounded-full border-2 border-deep-forest/15 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-deep-forest/15 bg-deep-forest text-2xl font-bold text-pale-canvas shadow-sm">
                {getInitial()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-beni text-5xl uppercase leading-[0.75] text-deep-forest sm:text-6xl">
                  Registration Details
                </h3>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase leading-none ${statusClass}`}
                >
                  {status}
                </span>
              </div>
              <p className="mt-2 truncate text-lg font-bold text-deep-forest">
                {registration.fullName || "Unknown volunteer"}
              </p>
              <p className="truncate text-sm font-medium text-deep-forest/65">
                {registration.email || "No email provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-deep-forest/10 bg-white/80 p-4">
              <p className="text-xs font-bold uppercase leading-[1] text-deep-forest/55">
                Event
              </p>
              <p className="mt-2 text-base font-bold leading-[1.25] text-deep-forest">
                {registration.eventName || "Unknown Event"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<ClipboardList className="h-5 w-5" />}
                label="Registration ID"
                value={`#${registration.registrationId || "N/A"}`}
              />
              <InfoItem
                icon={<CalendarClock className="h-5 w-5" />}
                label="Registered At"
                value={formatDate(registration.registeredAt)}
              />
              <InfoItem
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={registration.email}
              />
              <InfoItem
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                value={registration.phoneNumber}
              />
              <InfoItem
                icon={<MapPin className="h-5 w-5" />}
                label="Address"
                value={formatAddress(registration.address)}
                className="sm:col-span-2"
              />
            </div>

            {registration.skills && (
              <div className="rounded-lg border border-deep-forest/10 bg-white/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-deep-forest">
                  <BadgeCheck className="h-5 w-5" />
                  <p className="text-sm font-bold uppercase leading-[1]">
                    Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {registration.skills.length > 0 ? (
                    registration.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-deep-forest/15 bg-deep-forest/5 px-3 py-1 text-sm font-bold text-deep-forest"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm italic text-deep-forest/45">
                      No skills listed
                    </span>
                  )}
                </div>
              </div>
            )}

            {registration.bio && (
              <div className="rounded-lg border border-deep-forest/10 bg-white/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-deep-forest">
                  <UserRound className="h-5 w-5" />
                  <p className="text-sm font-bold uppercase leading-[1]">Bio</p>
                </div>
                <p className="text-sm font-medium leading-[1.45] text-deep-forest/75">
                  {registration.bio}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-deep-forest/10 bg-white/80 p-4">
              <div className="mb-3 flex items-center gap-2 text-deep-forest">
                <StickyNote className="h-5 w-5" />
                <p className="text-sm font-bold uppercase leading-[1]">Note</p>
              </div>
              <div className="rounded-lg bg-deep-forest/5 px-4 py-3 text-sm font-medium leading-[1.45] text-deep-forest/75">
                {registration.note || (
                  <span className="italic text-deep-forest/45">Chưa có</span>
                )}
              </div>
            </div>

            {isPending && (
              <div className="rounded-lg border border-deep-forest/10 bg-white/80 p-4">
                <label
                  htmlFor="review-note"
                  className="text-sm font-bold uppercase leading-[1] text-deep-forest"
                >
                  Review Note
                </label>
                <textarea
                  id="review-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter note for approval or rejection..."
                  rows={3}
                  className="mt-3 w-full resize-none rounded-lg border border-deep-forest/15 bg-pale-canvas px-4 py-3 text-sm font-medium text-deep-forest placeholder:text-deep-forest/40 transition focus:border-deep-forest focus:outline-none focus:ring-2 focus:ring-deep-forest/15"
                  disabled={reviewMutation.isPending}
                />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-deep-forest/10 bg-white/85 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 sm:pb-4">
          {isPending ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr]">
              <button
                className="rounded-lg border border-deep-forest/20 px-5 py-3 text-base font-bold text-deep-forest transition hover:bg-deep-forest/5 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onClose}
                disabled={reviewMutation.isPending}
              >
                Close
              </button>
              <button
                onClick={handleReject}
                disabled={reviewMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-base font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-5 w-5" />
                {reviewMutation.isPending ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                disabled={reviewMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-deep-forest px-5 py-3 text-base font-bold text-pale-canvas transition hover:bg-deep-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                {reviewMutation.isPending ? "Processing..." : "Accept"}
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                className="w-full rounded-lg bg-deep-forest px-6 py-3 text-base font-bold text-pale-canvas transition hover:bg-deep-forest/90 sm:w-auto"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
