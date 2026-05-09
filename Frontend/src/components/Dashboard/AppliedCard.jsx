import { FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Calendar, MapPin, Building2, X } from "lucide-react";
import Card from "../Card/Card";
import React, { useState } from "react";
import { useUnregisterFromEvent } from "../../hook/useRegistration";

function AppliedCard({
  title,
  organization,
  date,
  location,
  status,
  notes,
  thumbnail = "https://tse1.mm.bing.net/th/id/OIP.lTwHCqIOO3-hgviQYUXMjQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
  event,
  registration,
}) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const unregisterMutation = useUnregisterFromEvent();

  const eventId = event?.id || registration?.eventId;

  const statusBg = () => {
    if (status?.toLowerCase() === "pending") return "bg-white";
    else if (status?.toLowerCase() === "approved") return "bg-green-500/50";
    else return "bg-white";
  };

  const handleUnregister = async () => {
    if (!eventId) {
      console.error("No event ID found");
      return;
    }

    try {
      await unregisterMutation.mutateAsync(eventId);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to unregister:", error);
    }
  };

  return (
    <div className="relative">
      <Card>
        <div className="flex flex-row justify-between px-3 py-2 max-sm:flex-col max-sm:gap-2">
          {/* HEADER */}
          <div className="flex flex-row gap-4 flex-1">
            <img
              src={thumbnail}
              className="w-24 h-24 object-cover rounded-xl sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer"
              alt="thumbnail"
            />

            {/* DESKTOP CONTENT */}
            <div className="hidden sm:flex flex-col flex-1 gap-1 cursor-pointer">
              <div className="font-semibold text-[18px]">{title}</div>
              <div className="flex items-center gap-2 text-gray-600 text-[15px]">
                <Building2 size={16} className="flex-shrink-0" />
                <span>{organization}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-[15px]">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-[15px]">
                <MapPin size={16} className="flex-shrink-0" />
                <span>{location}</span>
              </div>
            </div>

            {/* MOBILE TITLE + ARROW */}
            <div className="flex flex-col flex-1 sm:hidden">
              <div className="flex justify-between items-start w-full gap-2">
                <p className="font-semibold text-[16px] leading-tight break-words pr-2 flex-1 cursor-pointer">
                  {title}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                  }}
                  className="text-gray-500 flex-shrink-0 p-2 -m-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {open ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* STATUS + CANCEL BUTTON */}
          <div className="flex flex-col gap-2 items-center md:self-center max-sm:flex-row max-sm:justify-between max-sm:mt-2">
            <div
              className={`inline-flex items-center ${statusBg()} px-2 py-1 rounded-full border border-gray-600/20 text-[14px]`}
            >
              <span className="text-yellow-500">
                <FiClock size={14} />
              </span>
              <span className="ml-1 font-medium">{status}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={unregisterMutation.isPending}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <X size={16} />
              <span>
                {unregisterMutation.isPending ? "Canceling..." : "Cancel"}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN CONTENT */}
        {open && (
          <div className="sm:hidden px-2 pt-2 pb-3 text-gray-600 text-[14px] border-t border-gray-100 mt-2 space-y-1">
            <p>
              <b>Organization:</b> {organization}
            </p>
            <p>
              <b>Date:</b> {date}
            </p>
            <p>
              <b>Location:</b> {location}
            </p>
            {notes && (
              <p>
                <b>Notes:</b> {notes}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Cancel Registration
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your registration for{" "}
              <span className="font-semibold">{title}</span>? This action cannot
              be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={unregisterMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Registration
              </button>
              <button
                onClick={handleUnregister}
                disabled={unregisterMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unregisterMutation.isPending ? "Canceling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppliedCard;
