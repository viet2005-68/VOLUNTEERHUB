import React, { useMemo, useState, useEffect } from "react";
import { Search, CheckCircle, Send } from "lucide-react";
import DropdownSelect from "../Dropdown/DropdownSelect";
import MarkCompletionCard from "./MarkCompletionCard";
import {
  useAllRegistrationForManager,
  useReviewRegistration,
} from "../../hook/useRegistration";

function MarkCompletionList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("attended");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const mappedStatus = useMemo(() => {
    switch (filter) {
      case "attended":
        return "APPROVED";
      case "completed":
        return "COMPLETED";
      case "absent":
        return "REJECTED";
      case "all":
        return "all";
      default:
        return "APPROVED";
    }
  }, [filter]);

  const { data, rawData, isLoading, isError, refetch } =
    useAllRegistrationForManager({
      page,
      pageSize,
      search: searchQuery,
      status: mappedStatus,
      event: "all",
    });

  useEffect(() => {
    console.group("[MarkCompletionList] Aggregated Manager Data");
    console.log("Query params:", {
      page,
      pageSize,
      search: searchQuery,
      status: mappedStatus,
    });
    console.log("Raw API data (unfiltered):", rawData);
    if (Array.isArray(rawData) && rawData.length) {
      console.log("Sample raw item event fields:", {
        eventId: rawData[0]?.eventId,
        eventName: rawData[0]?.eventName,
        status: rawData[0]?.status,
      });
    }
    console.log("Processed data (paginated):", data);
    console.log("Items:", data?.items);
    console.log("Pagination:", {
      totalItems: data?.totalItems,
      totalPages: data?.totalPages,
      page: data?.page,
      pageSize: data?.pageSize,
    });
    console.groupEnd();
  }, [rawData, data, page, pageSize, searchQuery, mappedStatus]);

  const registrations = data?.items || [];

  // Local overrides for immediate UI after completion/note edit
  const [statusOverrides, setStatusOverrides] = useState({}); // { [regKey]: { status: "COMPLETED", note: string|null } }
  const getRegKey = (reg) =>
    reg.registrationId ?? `${reg.eventId}-${reg.userId}`;
  const getEffectiveRegistrationStatus = (reg) => {
    const override = statusOverrides[getRegKey(reg)];
    return override?.status || reg.registrationStatus || reg.status;
  };

  const displayedRegistrations =
    filter === "all"
      ? registrations.filter(
          (reg) =>
            (reg.registrationStatus ?? reg.status)?.toUpperCase() !== "PENDING"
        )
      : registrations;

  const volunteers = displayedRegistrations.map((reg) => {
    const regKey = reg.registrationId ?? `${reg.eventId}-${reg.userId}`;
    const regStatus = getEffectiveRegistrationStatus(reg);
    const cardStatus =
      regStatus === "APPROVED"
        ? "attended"
        : regStatus === "COMPLETED"
        ? "completed"
        : regStatus === "REJECTED"
        ? "absent"
        : "registered";

    return {
      id: regKey,
      name: reg.fullName || reg.username || "Unknown",
      email: reg.email || "",
      status: cardStatus,
      hoursLogged: Math.floor(Math.random() * 4) + 1, // Random 1-4 hours
      feedback: statusOverrides[regKey]?.note ?? reg.note ?? undefined,
      avatar: reg.avatarUrl || null,
      eventName: reg.eventName,
      eventId: reg.eventId,
    };
  });

  const regMap = useMemo(() => {
    const m = new Map();
    registrations.forEach((reg) => {
      const regKey = reg.registrationId ?? `${reg.eventId}-${reg.userId}`;
      m.set(regKey, reg);
    });
    return m;
  }, [registrations]);

  // Completion note modal state
  const [selectedReg, setSelectedReg] = useState(null);
  const [note, setNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false); // Track if editing existing completion
  const reviewMutation = useReviewRegistration();

  const openNoteModalForVolunteer = (vol, isEditing = false) => {
    const reg = regMap.get(vol.id);
    if (!reg) return;
    setSelectedReg(reg);
    const regKey = reg.registrationId ?? `${reg.eventId}-${reg.userId}`;
    setNote(statusOverrides[regKey]?.note ?? reg.note ?? "");
    setIsEditingNote(isEditing);
  };

  const handleComplete = () => {
    if (!selectedReg) return;

    // If editing note only, don't send status
    const payload = {
      eventId: selectedReg.eventId,
      participantId: selectedReg.userId,
      note: note.trim(),
    };

    // Only add status when marking as completed for the first time
    if (!isEditingNote) {
      payload.status = "COMPLETED";
    }

    reviewMutation.mutate(payload, {
      onSuccess: (resp) => {
        console.log("[MarkCompletionList] reviewRegistration response:", resp);
        const regKey =
          selectedReg.registrationId ??
          `${selectedReg.eventId}-${selectedReg.userId}`;
        setStatusOverrides((prev) => ({
          ...prev,
          [regKey]: {
            status: isEditingNote
              ? prev[regKey]?.status || "COMPLETED"
              : "COMPLETED",
            note: note.trim() || null,
          },
        }));
        setSelectedReg(null);
        setNote("");
        setIsEditingNote(false);
        refetch();
      },
    });
  };

  const handleEditCompletion = (vol) => openNoteModalForVolunteer(vol, true);
  const handleMarkCompleted = (vol) => openNoteModalForVolunteer(vol, false);

  // Unused actions for now
  const handleMarkAttended = () => {};
  const handleMarkAbsent = () => {};
  const handleUndo = () => {};

  if (isLoading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="text-center py-8 text-red-500">
          Failed to load volunteers
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm gap-4 sm:gap-6 flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
          Volunteer Completion Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Mark attendance and completion status for event volunteers
        </p>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-3">
        {/* Search Bar */}
        <div className="relative w-full lg:flex-1 lg:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm sm:text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pb-1 max-md:self-end relative">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap text-xs sm:text-sm"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="sm:hidden">Mark All</span>
            <span className="hidden sm:inline">
              Mark All Attended as Completed
            </span>
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap text-xs sm:text-sm"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden xs:inline">Send Certificates</span>
            <span className="xs:hidden">Send</span>
          </button>

          <div className="relative z-50 overflow-visible">
            <DropdownSelect
              options={[
                { label: "All", value: "all" },
                { label: "Attended", value: "attended" },
                { label: "Completed", value: "completed" },
                { label: "Absent", value: "absent" },
              ]}
              value={filter}
              onChange={(next) => {
                setFilter(next);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-700">
          <span className="font-semibold">Tip:</span> Filter by "Attended" to
          view the list of approved volunteers, then mark them as "Completed"
          and add a note to issue certificates.
        </p>
      </div>

      {/* Volunteer List */}
      <div className="space-y-3 sm:space-y-4">
        {volunteers.length > 0 ? (
          volunteers.map((volunteer) => (
            <MarkCompletionCard
              key={volunteer.id}
              volunteer={volunteer}
              onMarkAttended={handleMarkAttended}
              onMarkAbsent={handleMarkAbsent}
              onMarkCompleted={handleMarkCompleted}
              onEditCompletion={handleEditCompletion}
              onUndo={handleUndo}
            />
          ))
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
            No volunteers found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Completion Note Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-gray-900/60 bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[500px] p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-center">
              {isEditingNote ? "Edit Completion Note" : "Mark Completion"}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-3">
              Event: {selectedReg?.eventName ?? "—"} • ID:{" "}
              {selectedReg?.eventId ?? "—"}
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Completion Note (optional):
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter completion note (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={reviewMutation.isPending}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition"
                  onClick={() => {
                    setSelectedReg(null);
                    setNote("");
                    setIsEditingNote(false);
                  }}
                  disabled={reviewMutation.isPending}
                >
                  Hủy
                </button>
                <button
                  onClick={handleComplete}
                  disabled={reviewMutation.isPending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewMutation.isPending
                    ? "Processing..."
                    : isEditingNote
                    ? "Save Note"
                    : "Confirm Completion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkCompletionList;
