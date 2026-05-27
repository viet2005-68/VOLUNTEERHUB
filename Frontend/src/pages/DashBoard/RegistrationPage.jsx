import { useState, useEffect, useRef } from "react";
import Pagination from "@mui/material/Pagination";
import RegistrationFilters from "../../components/Registration/RegistrationFilters";
import RegistrationTable from "../../components/Registration/RegistrationTable";
import RegistrationDetailModal from "../../components/Registration/RegistrationDetailModal";
import RegistrationStatusBadge from "../../components/Registration/RegistrationStatusBadge";
import { useAllRegistrationForManager } from "../../hook/useRegistration";

const PAGE_SIZE = 6;

export default function RegistrationPage() {
  const [filters, setFilters] = useState({
    event: "",
    status: "",
    search: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState(null);
  const isFirstLoad = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.event]);

  const { data, isLoading, isFetching } = useAllRegistrationForManager({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: filters.status,
    event: filters.event,
  });

  // Track first successful load
  useEffect(() => {
    if (data && isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [data]);

  const showFullLoading = isLoading && isFirstLoad.current;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  if (showFullLoading) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm font-bold leading-[1.2] text-deep-forest/70">Loading registrations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      <div className={`${selectedReg ? "blur" : ""} flex flex-col gap-6 sm:gap-8`}>
        <div className="flex flex-col gap-3 pl-1">
          <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
            Register Manager
          </h2>
          <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
            Manage all your volunteer registration
          </p>
        </div>

        <div className="">
          <RegistrationFilters
            filters={filters}
            setFilters={setFilters}
            eventOptions={data?.eventOptions || []}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <RegistrationTable
            data={data?.items || []}
            isFetching={isFetching}
            onSelect={(reg) => setSelectedReg(reg)}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {data?.items && data.items.length > 0 ? (
            data.items.map((reg) => {
              return (
                <div
                  key={reg.registrationId}
                  className="overflow-hidden rounded-[20px] border border-deep-forest/10 bg-pale-canvas shadow-lg shadow-deep-forest/10"
                >
                  {/* Header: Avatar, Name and Status */}
                  <div className="flex items-start gap-3 p-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {reg.avatarUrl ? (
                        <img
                          src={reg.avatarUrl}
                          alt={reg.fullName || "Volunteer"}
                          className="h-12 w-12 rounded-full object-cover border-2 border-bubblegum-blush"
                        />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                            reg.fullName || "volunteer"
                          }`}
                          alt="avatar"
                          className="h-12 w-12 rounded-full object-cover border-2 border-bubblegum-blush"
                        />
                      )}
                    </div>

                    {/* Name and Event */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-deep-forest text-base truncate">
                        {reg.fullName || "Unknown"}
                      </h4>
                      <p className="text-sm text-deep-forest/65 truncate mt-0.5">
                        {reg.eventName || "No event"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <RegistrationStatusBadge
                        status={reg.registrationStatus || reg.status}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-2 border-t border-deep-forest/10 px-4 py-3">
                    {/* Registration Date */}
                    <div className="flex items-center gap-2 text-sm text-deep-forest/65">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
                      <span className="truncate">
                        {formatDateTime(reg.registeredAt)}
                      </span>
                    </div>

                    {/* Phone Number */}
                    {reg.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-deep-forest/65">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="truncate">{reg.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedReg(reg)}
                    className="mx-4 mb-4 w-[calc(100%-2rem)] rounded-[10px] bg-deep-forest px-4 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink"
                  >
                    View details
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[20px] border border-deep-forest/10 bg-pale-canvas/70 px-6 py-12 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
              No registrations found
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.items && data.items.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-deep-forest/10 pt-5 sm:flex-row">
            <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
              Showing {data.items.length} of {data.totalItems} registrations
            </p>
            {data.totalPages > 0 && (
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#00522d",
                    fontFamily: "Clash Grotesk, sans-serif",
                    "&.Mui-selected": {
                      backgroundColor: "#00522d",
                      color: "#fff8f6",
                      "&:hover": {
                        backgroundColor: "#00522d",
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        )}
      </div>

      {selectedReg && (
        <RegistrationDetailModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
        />
      )}
    </div>
  );
}
