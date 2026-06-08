import { useState, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import RegistrationFilters from "../Registration/RegistrationFilters";
import RegistrationTableForAd from "./RegistrationTableForAd";
import RegistrationDetailModal from "../Registration/RegistrationDetailModal";
import EventVolunteerRegisterFilter from "./EventVolunteerRegisterFilter";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useListUserOfAnEvent } from "../../hook/useRegistration";

export default function EventVolunteerRegister() {
  const { eventId } = useOutletContext();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    event: "all",
    status: "pending",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  // Fetch ALL registrations once, then filter client-side for view needs
  const { data, isLoading, isError, refetch } = useListUserOfAnEvent(eventId, {
    pageNum: 0, // fetch everything and paginate client-side
    pageSize: 1000,
  });

  const normalizeReg = (r) => ({
    registrationId: r.id,
    registrationStatus: r.status,
    eventId: r.eventId,
    userId: r.userId,
    note: r.note,
    registeredAt: r.createdAt,
    fullName: r.user?.fullName || "",
    email: r.user?.email || "",
    avatarUrl: r.user?.avatarUrl || null,
    phoneNumber: r.user?.phoneNumber || "",
    address: r.user?.address || "",
    bio: r.user?.bio || "",
    skills: Array.isArray(r.user?.skills) ? r.user.skills : [],
    eventName: r.event?.name || "",
  });

  // Client-side filter and pagination using normalized shape suitable for modal
  const {
    registrations: pagedRegistrations,
    totalPages,
    totalElements,
  } = useMemo(() => {
    const raw = data?.data || [];
    const all = raw.map(normalizeReg);

    const status = (filters.status || "").toLowerCase();

    let filtered = all;
    if (status === "approved") {
      filtered = all.filter(
        (r) =>
          r.registrationStatus === "APPROVED" ||
          r.registrationStatus === "COMPLETED"
      );
    } else if (status === "completed") {
      filtered = all.filter((r) => r.registrationStatus === "COMPLETED");
    } else if (status === "pending") {
      filtered = all.filter((r) => r.registrationStatus === "PENDING");
    } else if (status === "rejected") {
      filtered = all.filter((r) => r.registrationStatus === "REJECTED");
    }

    const term = (filters.search || "").trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((r) => {
        const name = r.fullName?.toLowerCase() || "";
        const email = r.email?.toLowerCase() || "";
        const username = r.username?.toLowerCase() || "";
        const eventName = r.eventName?.toLowerCase() || "";
        return (
          name.includes(term) ||
          email.includes(term) ||
          username.includes(term) ||
          eventName.includes(term) ||
          r.userId?.toLowerCase().includes(term) ||
          String(r.registrationId).includes(term)
        );
      });
    }

    const totalElements = filtered.length;
    const totalPages =
      totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
    const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const start = (safePage - 1) * pageSize;
    const registrations = filtered.slice(start, start + pageSize);

    return { registrations, totalPages, totalElements };
  }, [data?.data, filters.status, filters.search, page, pageSize]);

  const [selectedReg, setSelectedReg] = useState(null);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleMessage = (registration) => {
    if (!eventId || !registration?.userId) return;
    navigate(
      `/dashboard/messages?eventId=${encodeURIComponent(eventId)}&volunteerId=${encodeURIComponent(
        registration.userId
      )}`
    );
  };

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      <div className={`${selectedReg ? "blur" : ""} flex flex-col gap-6 sm:gap-8`}>
        <div className="flex flex-col gap-3 pl-1">
          <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
            Register manager
          </h2>
          <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
            Manage all your volunteer registration
          </p>
        </div>

        <EventVolunteerRegisterFilter filters={filters} setFilters={setFilters} />

        {isLoading ? (
          <div className="py-8 text-center text-sm font-bold leading-[1.2] text-deep-forest/70">
            Loading registrations...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-sm font-bold leading-[1.2] text-foudre-pink">
            Error loading registrations
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[20px] border-2 border-ash-whisper bg-white">
              <RegistrationTableForAd
                registrations={pagedRegistrations}
                filters={filters}
                onSelect={(reg) => setSelectedReg(reg)}
                onMessage={handleMessage}
              />
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-deep-forest/10 pt-5 sm:flex-row">
                <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
                  Showing {pagedRegistrations.length} of {totalElements}{" "}
                  {filters.status} registration(s)
                </p>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  sx={{
                    "& .MuiPaginationItem-root": {
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
              </div>
            )}
          </>
        )}
      </div>

      {selectedReg && (
        <RegistrationDetailModal
          registration={selectedReg}
          onClose={() => {
            setSelectedReg(null);
            refetch(); // Refresh data after closing modal
          }}
        />
      )}
    </div>
  );
}
