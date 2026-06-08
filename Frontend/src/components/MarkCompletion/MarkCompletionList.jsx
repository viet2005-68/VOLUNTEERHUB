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

  const getEventName = (reg) => reg.eventName || reg.event?.name || reg.event?.title || "";
  const getEventId = (reg) => reg.eventId ?? reg.event?.id ?? null;
  const getServiceHours = (reg) => {
    const directHours = reg.serviceHours ?? reg.hoursLogged ?? reg.volunteerHours;
    if (directHours !== undefined && directHours !== null && directHours !== "") {
      const parsed = Number(directHours);
      return Number.isFinite(parsed) ? parsed : null;
    }

    const start = reg.event?.startTime || reg.startTime;
    const end = reg.event?.endTime || reg.endTime;
    if (!start || !end) return null;

    const minutes = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    if (!Number.isFinite(minutes) || minutes <= 0) return null;

    return Math.round((minutes / 60) * 10) / 10;
  };

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
      hoursLogged: getServiceHours(reg),
      feedback: statusOverrides[regKey]?.note ?? reg.note ?? undefined,
      avatar: reg.avatarUrl || reg.user?.avatarUrl || null,
      eventName: getEventName(reg),
      eventId: getEventId(reg),
      registrationId: reg.registrationId,
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
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="text-center py-8 text-sm font-bold leading-[1.2] text-deep-forest/70">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="text-center py-8 text-sm font-bold leading-[1.2] text-deep-forest">
          Failed to load volunteers
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-3 pl-1">
        <h2 className="font-beni text-[48px] font-black uppercase leading-[0.7] text-deep-forest sm:text-[56px] md:text-[68px] lg:text-[72px]">
          Volunteer Completion Management
        </h2>
        <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
          Mark attendance and completion status for event volunteers
        </p>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative w-full lg:min-w-[300px] lg:flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas/80 px-4 py-4 pl-[48px] pr-4 text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-deep-forest focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="relative flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => {}}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-4 py-3 text-sm font-bold leading-[0.85] text-pale-canvas transition hover:bg-deep-forest/90 whitespace-nowrap"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="sm:hidden">Mark All</span>
            <span className="hidden sm:inline">
              Mark All Attended as Completed
            </span>
          </button>
          <button
            onClick={() => {}}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-sm font-bold leading-[0.85] text-deep-forest transition hover:border-deep-forest hover:bg-ash-whisper hover:text-deep-forest whitespace-nowrap"
          >
            <Send className="h-5 w-5 flex-shrink-0" />
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
      <div className="rounded-[20px] border border-deep-forest/20 bg-ash-whisper/60 p-4">
        <p className="text-sm font-medium leading-[1.2] text-deep-forest/75">
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
          <div className="rounded-[20px] border border-deep-forest/10 bg-pale-canvas/70 px-6 py-12 text-center text-sm font-medium leading-[1.2] text-deep-forest/65">
            No volunteers found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Completion Note Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-forest/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] rounded-[20px] border border-deep-forest/25 bg-pale-canvas p-6 text-deep-forest">
            <h3 className="font-beni text-[46px] font-black uppercase leading-[0.7] text-deep-forest">
              {isEditingNote ? "Edit Completion Note" : "Mark Completion"}
            </h3>
            <p className="mb-3 text-center text-sm font-medium leading-[1.2] text-deep-forest/70">
              Event: {selectedReg?.eventName || selectedReg?.event?.name || "Chưa có tên sự kiện"} • ID:{" "}
              {selectedReg?.eventId ?? selectedReg?.event?.id ?? "N/A"}
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold leading-[1.2] text-deep-forest">
                  Completion Note (optional):
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter completion note (optional)"
                  rows={3}
                  className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas px-4 py-3 text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/45 focus:border-deep-forest focus:outline-none"
                  disabled={reviewMutation.isPending}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="rounded-[10px] border border-deep-forest bg-transparent px-4 py-3 text-sm font-bold text-deep-forest transition hover:border-deep-forest hover:bg-ash-whisper hover:text-deep-forest"
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
                  className="rounded-[10px] bg-deep-forest px-4 py-3 text-sm font-bold text-pale-canvas transition hover:bg-deep-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
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
