import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import EventHero from "../../components/EventPages/EventHero";
import EventOverview from "../../components/EventPages/EventOverview";
import Tabs from "../../components/Tabs.jsx/Tabs";
import RegistrationCard from "../../components/EventPages/RegistrationCard";
import OrganizationCard from "../../components/EventPages/OrganizationCard";
import FeedPage from "../Post/FeedPage";
import VolunteerList from "../../components/EventPages/VoluteerList";

import { calculateDuration, formatDateTime } from "../../utils/date";
import {
  useCheckUserParticipation,
  useRegisterForEvent,
  useConstUserApprovedList,
} from "../../hook/useRegistration";
import { useEventDetail } from "../../hook/useEvent";
import { useAuth } from "../../hook/useAuth";
import { useProfileGuard } from "../../hook/useProfileGuard";
import ProfileRequiredModal from "../../components/Modal/ProfileRequiredModal";

export default function EventLayout() {
  const { id, tab } = useParams();

  const { user } = useAuth();

  // Check user's participation status
  const { data: participationData, isLoading: isCheckingStatus } =
    useCheckUserParticipation(id);
  const userRegistrationStatus = participationData;

  // Check if user is approved OR has MANAGER/ADMIN role

  const { mutate: registerForEvent, isLoading: isRegistering } =
    useRegisterForEvent();

  const { checkProfile, showModal, closeModal, missingFields } =
    useProfileGuard();

  // Get active tab from URL params, default to overview
  const activeTab = tab || "overview";

  const {
    data: eventData,
    isLoading: isEventLoading,
    isError: isEventError,
    error: eventError,
    refetch,
  } = useEventDetail(id);
  console.log("Event data:", eventData);
  console.log("Is owner:", eventData?.ownerId === user?.id);
  const [displayCount, setDisplayCount] = useState(5);
  const isApproved =
    userRegistrationStatus === "APPROVED" ||
    userRegistrationStatus === "COMPLETED" ||
    (user?.role === "MANAGER" && eventData?.ownerId === user?.id) ||
    user?.role === "ADMIN";
  // Fetch approved users for the event
  const { data: approvedUsers, isLoading: isLoadingUsers } =
    useConstUserApprovedList(id);
  const allUsers = approvedUsers || [];
  const displayedUsers = allUsers.slice(0, displayCount);
  const hasMoreUsers = allUsers.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  if (isEventLoading) {
    return <div className="p-5">Loading...</div>;
  }

  if (isEventError && eventError?.response?.status === 404) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center px-6 py-10">
          <div className="text-6xl font-bold text-gray-200">404</div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Event is not available
          </h2>
          <p className="mt-2 text-gray-600">
            This event is not available or does not exist.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/opportunities"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Another event
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEventError) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Có lỗi khi tải sự kiện</p>
          <p className="mt-1 text-gray-600">
            {eventError?.response?.data?.message ||
              eventError?.message ||
              "Vui lòng thử lại sau."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const headerItems = [
    { key: "overview", label: "Overview", to: `/opportunities/overview/${id}` },
    {
      key: "discussion",
      label: "Discussion",
      to: `/opportunities/discussion/${id}`,
    },
    { key: "members", label: "Members", to: `/opportunities/members/${id}` },
  ];

  const handleRegistration = () => {
    // Check profile before registering
    checkProfile(() => {
      registerForEvent(id);
    });
  };

  const getButtonConfig = () => {
    const now = new Date();
    const deadline = new Date(eventData.registrationDeadline);

    if (now > deadline) {
      return {
        text: "Registration Closed",
        className: "bg-gray-400 cursor-not-allowed",
        disabled: true,
      };
    }

    switch (userRegistrationStatus) {
      case "PENDING":
        return {
          text: "Pending Approval",
          className: "bg-yellow-500 hover:bg-yellow-600",
          disabled: true,
        };
      case "APPROVED":
        return {
          text: "✓ You're Participating",
          className: "bg-green-500 hover:bg-green-600",
          disabled: true,
        };
      case "COMPLETED":
        return {
          text: "✓ Event Completed",
          className: "bg-blue-500 hover:bg-blue-600",
          disabled: true,
        };
      case "REJECTED":
        return {
          text: "✗ Registration Rejected",
          className: "bg-red-500 hover:bg-red-600",
          disabled: true,
        };
      default:
        return {
          text: "Join",
          className: "bg-white hover:via-fuchsia-600 hover:to-pink-600",
          disabled: false,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <EventOverview
            description={eventData.description}
            location={
              eventData.address
                ? `${eventData.address.street}, ${eventData.address.district}, ${eventData.address.province}`
                : ""
            }
            startTime={eventData.startTime}
            endTime={eventData.endTime}
            capacity={eventData.capacity}
            registered={eventData.participantCount}
            availableSlots={eventData.capacity - eventData.registrationCount}
          />
        );
      case "discussion":
        if (!isApproved) {
          return (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-lg font-semibold">Access Restricted</p>
                <p className="mt-2">
                  You must join the event and wait for approval to access
                  discussions.
                </p>
              </div>
            </div>
          );
        }
        return <FeedPage />;
      case "members":
        if (!isApproved) {
          return (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-lg font-semibold">Access Restricted</p>
                <p className="mt-2">
                  You must join the event and wait for approval to see the
                  volunteer list.
                </p>
              </div>
            </div>
          );
        }
        return (
          <VolunteerList
            userList={displayedUsers}
            loadMore={handleLoadMore}
            end={!hasMoreUsers}
          />
        );
      default:
        return (
          <EventOverview
            description={eventData.description}
            location={
              eventData.address
                ? `${eventData.address.street}, ${eventData.address.district}, ${eventData.address.province}`
                : ""
            }
            startTime={eventData.startTime}
            endTime={eventData.endTime}
            capacity={eventData.capacity}
            registered={eventData.registrationCount}
            availableSlots={eventData.capacity - eventData.registrationCount}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-pale-canvas text-deep-forest max-sm:gap-0">
      <main className="col-span-8 p-6 max-sm:col-span-12 max-sm:p-0">
        <div className="flex flex-col w-full">
          <EventHero
            id={id}
            imgURL={eventData?.imageUrl}
            organizerName={eventData.owner.fullName || "Unknown Organizer"}
            eventName={eventData.name}
          />

          {/* Mobile Registration Status */}
          <div className="sm:hidden bg-white p-4 rounded-lg mb-4 px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {calculateDuration(eventData?.startTime, eventData?.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {eventData?.participantCount || 0}/{eventData?.capacity || 10}
                </span>
              </div>
            </div>

            <div className="mb-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Deadline: {formatDateTime(eventData?.registrationDeadline)}
                </span>
              </div>
              {eventData?.minAge && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Min Age: {eventData.minAge}+</span>
                </div>
              )}
            </div>

            <button
              onClick={handleRegistration}
              disabled={
                buttonConfig.disabled || isRegistering || isCheckingStatus
              }
              className={`w-full py-1 rounded-lg text-white font-semibold transition-all duration-200 ${buttonConfig.className}`}
            >
              {isCheckingStatus
                ? "Checking..."
                : isRegistering
                ? "Registering..."
                : buttonConfig.text}
            </button>
          </div>

          {/* tab links */}
          <div className="mb-6 w-full max-sm:px-4">
            <Tabs
              items={headerItems}
              defaultKey={activeTab}
              asLink
              variant="header"
            />
          </div>

          {/* Dynamic content based on active tab */}
          {renderTabContent()}
        </div>
      </main>

      <aside className="col-span-4 flex flex-col gap-4 bg-ash-whisper/35 p-6 max-sm:hidden">
        <RegistrationCard
          id={eventData?.id}
          duration={calculateDuration(eventData?.startTime, eventData?.endTime)}
          minAge={eventData?.minAge || ""}
          registrationDeadline={eventData?.registrationDeadline || ""}
          registrationStatus={eventData?.status || ""}
          durationCancel={eventData?.durationCancel || ""}
          registedVolunteer={eventData?.participantCount || 0}
          totalSpots={eventData?.capacity || 10}
          userRegistrationStatus={userRegistrationStatus}
          isCheckingStatus={isCheckingStatus}
          onAction={() => {}}
        />
        <OrganizationCard data={eventData?.owner} />
        {/*<ContactCard />
        <RelatedEventsCard />*/}
      </aside>

      {/* Profile Required Modal */}
      <ProfileRequiredModal
        isOpen={showModal}
        onClose={closeModal}
        missingFields={missingFields}
        redirectTo={`/opportunities/overview/${id}`}
      />
    </div>
  );
}
