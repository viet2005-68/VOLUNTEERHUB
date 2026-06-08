import React, { useState, useEffect } from "react";
import {
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  Trash,
  Download,
  MessageSquare,
} from "lucide-react";
import Pagination from "@mui/material/Pagination";
import {
  useListUserOfAnEventApproveAndCompleted,
  useRemoveParticipant,
} from "../../hook/useRegistration";
import { useNavigate, useOutletContext } from "react-router-dom";
import AnalysisService from "../../services/analysisService";
import { confirmDelete } from "../../utils/confirmDialog";

const PAGE_SIZE = 10; // giống cách đặt PAGE_SIZE trong EventManager

function VolunteerList() {
  const { eventId } = useOutletContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Reset page khi thay đổi search
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest(".export-dropdown")) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  let { data, isLoading, isError, refetch } =
    useListUserOfAnEventApproveAndCompleted(eventId, {
      pageNum: page,
      pageSize: PAGE_SIZE,
      status: "COMPLETED",
    });

  // Extract data từ response
  const registrations = data?.data || [];

  const { mutate: removeParticipant, isPending: isRemoving } =
    useRemoveParticipant();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      const { street, district, province } = address;
      return [street, district, province].filter(Boolean).join(", ");
    }
    return "";
  };

  const filteredVolunteers = registrations.filter((registration) => {
    const searchLower = searchQuery.toLowerCase();
    const user = registration.user || {};
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower) ||
      formatAddress(user.address)?.toLowerCase().includes(searchLower)
    );
  });

  const displayedVolunteers = filteredVolunteers;

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleView = (registration) => {
    console.log("View registration:", registration);
  };

  const handleMessage = (registration) => {
    const volunteerId = registration.userId || registration.user?.id;
    if (!eventId || !volunteerId) return;
    navigate(
      `/dashboard/messages?eventId=${encodeURIComponent(eventId)}&volunteerId=${encodeURIComponent(
        volunteerId
      )}`
    );
  };

  const handleDelete = async (registration) => {
    const confirmed = await confirmDelete(
      registration.user?.fullName || "this volunteer"
    );
    if (!confirmed) return;

    removeParticipant(
      { eventId, participantId: registration.userId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1); // từ 1-based (UI) sang 0-based (API)
  };

  const handleExport = async (format) => {
    if (!eventId) {
      alert("Event ID is missing");
      return;
    }

    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let response;
      let filename;
      let mimeType;

      if (format === "csv") {
        // Export CSV từ backend
        response = await AnalysisService.getEventParticipantsCsv(eventId);
        filename = `volunteers_event_${eventId}_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        // Export JSON từ backend
        response = await AnalysisService.getEventParticipantsJson(eventId);
        filename = `volunteers_event_${eventId}_${
          new Date().toISOString().split("T")[0]
        }.json`;
        mimeType = "application/json;charset=utf-8;";
        response = JSON.stringify(response, null, 2);
      }

      // Create blob and download
      const blob = new Blob([response], { type: mimeType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting data as ${format}:`, error);
      alert(`Failed to export data: ${error.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="py-8 text-center text-sm font-bold leading-[1.2] text-deep-forest/70">
          Loading...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="py-8 text-center text-sm font-bold leading-[1.2] text-foudre-pink">
          Failed to load volunteers
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-3 pl-1">
        <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
          Registered Volunteers
        </h2>
        <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
          Overview of volunteers for this event
        </p>
      </div>

      {/* Search Bar & Export Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas/80 px-4 py-4 pl-[48px] text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-foudre-pink focus:outline-none"
          />
        </div>

        {/* Export Dropdown */}
        <div className="relative export-dropdown">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting || !eventId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span className="max-sm:hidden">
              {isExporting ? "Exporting..." : "Export Volunteers"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showExportMenu && !isExporting && (
            <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-[10px] border-2 border-ash-whisper bg-pale-canvas text-sm font-bold leading-[1.2] text-deep-forest shadow-lg">
              <button
                onClick={() => handleExport("csv")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-ash-whisper"
              >
                <Download className="w-4 h-4" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport("json")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-ash-whisper"
              >
                <Download className="w-4 h-4" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-[20px] border-2 border-ash-whisper bg-white md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-ash-whisper/70">
              <th className="px-6 py-4 text-sm font-bold leading-[1.2] text-deep-forest">Volunteer</th>
              <th className="px-6 py-4 text-sm font-bold leading-[1.2] text-deep-forest">Email</th>
              <th className="px-6 py-4 text-sm font-bold leading-[1.2] text-deep-forest">Phone</th>
              <th className="px-6 py-4 text-sm font-bold leading-[1.2] text-deep-forest">Address</th>
              <th className="px-6 py-4 text-sm font-bold leading-[1.2] text-deep-forest">Joined At</th>
              <th className="px-6 py-4 text-center text-sm font-bold leading-[1.2] text-deep-forest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.length > 0 ? (
              filteredVolunteers.map((registration) => {
                const user = registration.user || {};
                return (
                  <tr
                    key={registration.id}
                    className="border-b-2 border-ash-whisper transition-colors last:border-b-0 hover:bg-ash-whisper/30"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-9 w-9 rounded-full flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ash-whisper text-sm font-bold text-deep-forest">
                            {getInitials(user.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold leading-[1.2] text-deep-forest">
                            {user.fullName || ""}
                          </p>
                          <p className="text-sm font-medium leading-[1.2] text-deep-forest/60">
                            {user.username || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium leading-[1.2] text-deep-forest/70">
                      {user.email || ""}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium leading-[1.2] text-deep-forest/70">
                      {user.phoneNumber || ""}
                    </td>
                    <td className="max-w-[220px] px-6 py-5 text-sm font-medium leading-[1.2] text-deep-forest/70">
                      {formatAddress(user.address)}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium leading-[1.2] text-deep-forest/70">
                      {formatDate(registration.reviewedAt)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(registration)}
                          className="inline-flex items-center gap-1 rounded-[10px] border border-deep-forest/15 px-3 py-2 text-xs font-bold leading-[0.85] text-deep-forest transition-colors hover:bg-ash-whisper"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleMessage(registration)}
                          className="inline-flex items-center gap-1 rounded-[10px] bg-deep-forest px-3 py-2 text-xs font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                        <button
                          onClick={() => handleDelete(registration)}
                          disabled={isRemoving}
                          className="inline-flex items-center gap-1 rounded-[10px] bg-foudre-pink px-3 py-2 text-xs font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-deep-forest disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
                  No volunteers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {displayedVolunteers.length > 0 ? (
          displayedVolunteers.map((registration) => {
            const user = registration.user || {};
            const isExpanded = expandedIds.has(registration.id);
            return (
              <div
                key={registration.id}
                className="rounded-[20px] border border-deep-forest/10 bg-pale-canvas/70 p-4"
              >
                {/* Summary Section */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold leading-[1.2] text-deep-forest">
                        {user.fullName || ""}
                      </p>
                      <p className="truncate text-xs font-medium leading-[1.2] text-deep-forest/65">
                        {user.email || ""}
                      </p>
                      <p className="text-xs font-medium leading-[1.2] text-deep-forest/45">
                        {user.username || ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(registration.id)}
                    className="flex-shrink-0 rounded-[10px] p-2 transition hover:bg-ash-whisper"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-deep-forest/55" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-deep-forest/55" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-deep-forest/10 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-deep-forest/55">Phone:</span>
                      <span className="font-bold text-deep-forest">
                        {user.phoneNumber || ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-deep-forest/55">Address:</span>
                      <span className="ml-2 flex-1 text-right font-bold text-deep-forest">
                        {formatAddress(user.address)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-deep-forest/55">Joined At:</span>
                      <span className="font-bold text-deep-forest">
                        {formatDate(registration.reviewedAt)}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleView(registration)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-[10px] border border-deep-forest/15 px-3 py-2 text-xs font-bold text-deep-forest transition hover:bg-ash-whisper"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleMessage(registration)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-deep-forest px-3 py-2 text-xs font-bold text-pale-canvas transition hover:bg-foudre-pink"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </button>
                      <button
                        onClick={() => handleDelete(registration)}
                        disabled={isRemoving}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-foudre-pink px-3 py-2 text-xs font-bold text-pale-canvas transition hover:bg-deep-forest disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-[20px] border border-deep-forest/10 bg-pale-canvas/70 px-6 py-12 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
            No volunteers found
          </div>
        )}
      </div>

      {/* Pagination & Stats Footer */}
      {data?.data && data.data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-deep-forest/10 pt-5 sm:flex-row">
          <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
            Showing {data.data.length} of {data.meta?.totalElements || 0}{" "}
            volunteers
          </p>
          <Pagination
            count={data.meta?.totalPages || 0}
            page={page + 1}
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
    </div>
  );
}

export default VolunteerList;
