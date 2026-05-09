import React from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "../../components/Tabs/Tabs";
import UpcomingCard from "../../components/Dashboard/UpcomingCard";
import AppliedCard from "../../components/Dashboard/AppliedCard";
import CompleteCard from "../../components/Dashboard/CompleteCard";
import { useAggregatedRegistrations } from "../../hook/useRegistration";
import Pagination from "@mui/material/Pagination";
import { formatDateTime } from "../../utils/date";

const PAGE_SIZE = 4;

const STATUS_MAP = {
  applied: "PENDING",
  upcoming: "APPROVED",
  completed: "COMPLETED",
};

const ComponentMap = {
  applied: AppliedCard,
  upcoming: UpcomingCard,
  completed: CompleteCard,
};

export default function Opportunities() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("applied");
  const [appliedPageNum, setAppliedPageNum] = React.useState(0);
  const [upcomingPageNum, setUpcomingPageNum] = React.useState(0);
  const [completedPageNum, setCompletedPageNum] = React.useState(0);

  // Separate hooks for each tab
  const appliedQuery = useAggregatedRegistrations({
    pageNum: appliedPageNum,
    pageSize: PAGE_SIZE,
    status: "PENDING",
  });

  const upcomingQuery = useAggregatedRegistrations({
    pageNum: upcomingPageNum,
    pageSize: PAGE_SIZE,
    status: "APPROVED",
  });

  const completedQuery = useAggregatedRegistrations({
    pageNum: completedPageNum,
    pageSize: PAGE_SIZE,
    status: "COMPLETED",
  });

  // Get current tab's query
  const queryMap = {
    applied: appliedQuery,
    upcoming: upcomingQuery,
    completed: completedQuery,
  };

  const pageNumMap = {
    applied: appliedPageNum,
    upcoming: upcomingPageNum,
    completed: completedPageNum,
  };

  const setPageNumMap = {
    applied: setAppliedPageNum,
    upcoming: setUpcomingPageNum,
    completed: setCompletedPageNum,
  };

  const { data, isLoading } = queryMap[activeTab];
  const CardComponent = ComponentMap[activeTab];

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePageChange = (event, value) => {
    setPageNumMap[activeTab](value - 1); // Convert to 0-based
  };

  const handleCardClick = (eventId) => {
    navigate(`/opportunities/overview/${eventId}`);
  };

  const formatCardData = (item) => {
    const event = item.event || {};
    const address = event.address || {};
    const category = event.category || {};

    // Format location
    const locationParts = [
      address.street,
      address.district,
      address.province,
    ].filter(Boolean);
    const location =
      locationParts.length > 0 ? locationParts.join(", ") : "Chưa có địa chỉ";

    // Format date - show full start and end datetime
    let dateDisplay = "Chưa xác định";
    if (event.startTime && event.endTime) {
      const start = formatDateTime(event.startTime, { withTime: true });
      const end = formatDateTime(event.endTime, { withTime: true });
      dateDisplay = `${start} - ${end}`;
    } else if (event.startTime) {
      dateDisplay = formatDateTime(event.startTime, { withTime: true });
    }

    // Calculate hours if both start and end time exist
    let hoursDisplay = "N/A";
    if (event.startTime && event.endTime) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const diffInHours = Math.abs(end - start) / (1000 * 60 * 60);
      hoursDisplay = `${diffInHours.toFixed(1)} giờ`;
    }

    return {
      id: item.id,
      title: event.name || "Tên sự kiện",
      organization: category.name || "Danh mục chưa có",
      date: dateDisplay,
      location: location,
      status: item.status,
      notes: item.note || event.description,
      thumbnail: event.imageUrl,
      hours: hoursDisplay,
      statusApply: item.status,
      // Pass full event data for cards that need it
      event: event,
      registration: item,
    };
  };

  console.log("Opportunities data:", data);

  // Get counts for each tab
  const appliedCount = appliedQuery.data?.meta?.totalElements ?? 0;
  const upcomingCount = upcomingQuery.data?.meta?.totalElements ?? 0;
  const completedCount = completedQuery.data?.meta?.totalElements ?? 0;

  // Calculate showing range
  const totalElements = data?.meta?.totalElements ?? 0;

  // Calculate actual items showing on current page
  const itemsOnCurrentPage = data?.data?.length ?? 0;
  const showingCount = totalElements > 0 ? itemsOnCurrentPage : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm gap-4 flex flex-col">
      <div>
        <h4 className="text-2xl font-semibold mb-1">Opportunities</h4>
        <p className="text-gray-500">
          Manage your event registrations and participation
        </p>
      </div>
      <div>
        <Tabs
          items={[
            { key: "applied", label: `Applied (${appliedCount})` },
            { key: "upcoming", label: `Upcoming (${upcomingCount})` },
            { key: "completed", label: `Completed (${completedCount})` },
          ]}
          activeKey={activeTab}
          onChange={handleTabChange}
        />
        <div className="mt-6 p-2 flex gap-5 flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div key={activeTab} className="flex gap-5 flex-col">
                {data.data.map((item) => {
                  const cardData = formatCardData(item);
                  return (
                    <div
                      key={`${activeTab}-${item.id}`}
                      onClick={(e) => {
                        // Only navigate if clicking on cursor-pointer elements
                        if (
                          e.target.classList?.contains("cursor-pointer") ||
                          e.target.closest(".cursor-pointer")
                        ) {
                          handleCardClick(cardData.event.id);
                        }
                      }}
                    >
                      <CardComponent {...cardData} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-500">
                  Showing {showingCount} of {totalElements} events
                </p>
                <Pagination
                  count={data?.meta?.totalPages ?? 1}
                  page={pageNumMap[activeTab] + 1}
                  onChange={handlePageChange}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      "&.Mui-selected": {
                        backgroundColor: "#000",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#888",
                        },
                      },
                    },
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm mt-1">
                You don't have any {activeTab} events yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
