import React, { useState } from "react";
import Card from "../Card.jsx/Card";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LogIn, Trash, Calendar, MapPin, Building2, X } from "lucide-react";
import { useUnregisterFromEvent } from "../../hook/useRegistration";

function UpcomingCard({
  title,
  organization,
  date,
  status,
  location,
  thumbnail = "https://tse1.mm.bing.net/th/id/OIP.lTwHCqIOO3-hgviQYUXMjQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
  event,
  registration,
}) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const unregisterMutation = useUnregisterFromEvent();

  const eventId = event?.id || registration?.eventId;

  const bgColor =
    status.toLowerCase() === "confirm"
      ? "bg-black text-white"
      : "bg-white text-black";

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
          {/* THUMBNAIL + TITLE */}
          <div className="flex flex-row flex-1 gap-3">
            <img
              src={thumbnail}
              alt={title}
              className="w-20 h-20 object-cover rounded-2xl sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer"
            />
            {/* DESKTOP INFO */}
            <div className="hidden sm:flex flex-col justify-center gap-1 cursor-pointer flex-1">
              <div className="font-semibold text-[18px]">{title}</div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Building2 size={16} className="flex-shrink-0" />
                <span>{organization}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={16} className="flex-shrink-0" />
                <span>{location}</span>
              </div>
            </div>

            {/* MOBILE TITLE + CHEVRON */}
            <div className="flex flex-col justify-center sm:hidden flex-1">
              <div className="flex justify-between items-center w-full gap-2">
                <p className="font-semibold text-[16px] break-words flex-1 cursor-pointer">
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

          {/* STATUS + BUTTON */}
          <div className="flex flex-col gap-2 items-center md:self-center max-sm:flex-row max-sm:justify-around max-sm:mt-2">
            <div
              className={`px-2 py-1 rounded-full border border-gray-300 ${bgColor} text-center min-w-[80px]`}
            >
              {status}
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-black text-white px-3 py-1 rounded-md flex w-[80px] flex-row gap-1 items-center hover:scale-105 active:scale-95 duration-200 transition-all"
            >
              <span>Checkin</span> <LogIn className="w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={unregisterMutation.isPending}
              className="bg-red-500 text-white px-3 py-1 rounded-md w-[80px] flex flex-row gap-1 items-center hover:scale-105 active:scale-95 duration-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{unregisterMutation.isPending ? "..." : "Cancel"}</span>{" "}
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN INFO */}
        {open && (
          <div className="sm:hidden px-3 pt-2 pb-3 text-gray-600 text-sm border-t border-gray-100 mt-2 space-y-1">
            <p>
              <b>Organization:</b> {organization}
            </p>
            <p>
              <b>Date:</b> {date}
            </p>
            <p>
              <b>Location:</b> {location}
            </p>
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

export default UpcomingCard;
