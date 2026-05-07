import React, { useState, useEffect } from "react";
import Card from "../Card.jsx/Card";
import { formatDateTime } from "../../utils/date";
import { BsFillPeopleFill } from "react-icons/bs";
import { useAuth } from "../../hook/useAuth";
import {
  useRegisterForEvent,
  useCheckUserParticipation,
} from "../../hook/useRegistration";
import { useProfileGuard } from "../../hook/useProfileGuard";
import ProfileRequiredModal from "../Modal/ProfileRequiredModal";

function RegistrationCard({
  id,
  duration,
  minAge,
  registrationDeadline,
  registrationStatus,
  durationCancel,
  onAction,
  registedVolunteer = 10,
  totalSpots = 10,
  userRegistrationStatus, // Received from parent
  isCheckingStatus, /// Received from parent
}) {
  const { user, hasRole } = useAuth();

  const registerMutation = useRegisterForEvent();
  const { checkProfile, showModal, closeModal, missingFields } =
    useProfileGuard();

  const width = (registedVolunteer / totalSpots) * 100;

  // Check if registration deadline has passed
  const isDeadlinePassed =
    registrationDeadline && new Date(registrationDeadline) < new Date();

  const handleRegister = () => {
    // Check profile before registering
    checkProfile(() => {
      registerMutation.mutate(id);
    });
  };

  // Determine button text and state based on registration status
  const getButtonConfig = () => {
    if (isCheckingStatus) {
      return {
        text: "Checking...",
        disabled: true,
        className: "bg-gray-500/80 cursor-not-allowed",
      };
    }

    // User has not registered yet (404 or no data)
    if (!userRegistrationStatus) {
      if (isDeadlinePassed) {
        return {
          text: "Registration Closed",
          disabled: true,
          className: "bg-gray-500/80 cursor-not-allowed",
        };
      }
      if (registedVolunteer >= totalSpots) {
        return {
          text: "Event Full",
          disabled: true,
          className: "bg-gray-500/80 cursor-not-allowed",
        };
      }
      if (registerMutation.isPending) {
        return {
          text: "Joining...",
          disabled: true,
          className: "bg-purple-500/80 cursor-not-allowed",
        };
      }
      return {
        text: "Join",
        disabled: false,
        className:
          "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 cursor-pointer hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500",
      };
    }

    // User status-based configurations
    switch (userRegistrationStatus) {
      case "PENDING":
        return {
          text: "Pending Approval",
          disabled: true,
          className: "bg-yellow-400 cursor-not-allowed",
        };
      case "APPROVED":
        return {
          text: "✓ You're Participating",
          disabled: true,
          className: "bg-green-500/80 cursor-not-allowed",
        };
      case "COMPLETED":
        return {
          text: "✓ Event Completed",
          disabled: true,
          className: "bg-blue-500/80 cursor-not-allowed",
        };
      case "REJECTED":
        return {
          text: "Registration Rejected",
          disabled: true,
          className: "bg-red-500/80 cursor-not-allowed",
        };
      default:
        return {
          text: "Join",
          disabled: false,
          className:
            "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 cursor-pointer hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card>
      <div className="flex flex-col text-sm/6 text-black gap-1">
        <div className="flex gap-1 flex-col">
          <p>Register for Event</p>
          <div className="flex flex-row items-center gap-5">
            <div className="bg-gray-600/20 h-2 w-full relative rounded-full">
              <div
                className="bg-red-400 h-2 absolute top-0 left-0 rounded-full transition-all duration-300"
                style={{ width: `${width}%` }}
              ></div>
            </div>
            <p className="inline-flex items-center text-sm text-center gap-1">
              <span>
                <BsFillPeopleFill />
              </span>
              <span className="text-gray-600">
                {registedVolunteer}/{totalSpots}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <p>Duration:</p>
          <p>{duration}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Min age: </p>
          <p>{minAge || 16}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Deadline:</p>
          <p className="max-md:hidden">
            {formatDateTime(registrationDeadline)}
          </p>
          <p className="max-md:block hidden">
            {formatDateTime(registrationDeadline, { withTime: false })}
          </p>
        </div>
        <div className="text-gray-600 text-sm/3">
          Cancellations must be made at least {durationCancel} hours in advance.
        </div>
        {hasRole("USER") && user && (
          <button
            onClick={handleRegister}
            disabled={buttonConfig.disabled}
            className={`border-none rounded-xl md:mt-8 text-white px-4 mt-1 py-1 text-center font-lobster tracking-widest hover:scale-105 transition-all duration-300 ease-in-out active:scale-95 disabled:hover:scale-100 ${buttonConfig.className}`}
          >
            {buttonConfig.text}
          </button>
        )}
      </div>

      {/* Profile Required Modal */}
      <ProfileRequiredModal
        isOpen={showModal}
        onClose={closeModal}
        missingFields={missingFields}
        redirectTo={window.location.pathname}
      />
    </Card>
  );
}

export default RegistrationCard;
