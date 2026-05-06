import { useState, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import RegistrationFilters from "../Registration/RegistrationFilters";
import RegistrationTableForAd from "./RegistrationTableForAd";
import RegistrationDetailModal from "../Registration/RegistrationDetailModal";
import EventVolunteerRegisterFilter from "./EventVolunteerRegisterFilter";
import { useOutletContext } from "react-router-dom";
import { useListUserOfAnEvent } from "../../hook/useRegistration";

export default function EventVolunteerRegister() {
  const { eventId } = useOutletContext();
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm ">
      <div className={`${selectedReg ? "blur" : ""} flex flex-col gap-5`}>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-gray-900">
            Register manager
          </h3>
          <p className="text-gray-500">
            Manage all your volunteer registration
          </p>
        </div>

        <div className="">
          <EventVolunteerRegisterFilter
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading registrations...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading registrations
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <RegistrationTableForAd
                registrations={pagedRegistrations}
                filters={filters}
                onSelect={(reg) => setSelectedReg(reg)}
              />
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-4">
                <p className="text-sm text-gray-500">
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
                        backgroundColor: "#3b82f6",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#2563eb",
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
