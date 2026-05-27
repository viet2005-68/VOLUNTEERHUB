import React, { useMemo, useState } from "react";
import { Search, CheckCircle, Send, Download } from "lucide-react";
import DropdownSelect from "../Dropdown/DropdownSelect";
import MarkCompletionCard from "../MarkCompletion/MarkCompletionCard";
import { useOutletContext } from "react-router-dom";
import {
  useListUserOfAnEvent,
  useReviewRegistration,
} from "../../hook/useRegistration";
import CompletionQrPanel from "./CompletionQrPanel";

function EventManagerMarkComplete() {
  const { eventId, eventData } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("attended"); // Default: Approved users
  const [itemsToShow, setItemsToShow] = useState(10);
  const [pageNum, setPageNum] = useState(0);

  const mappedStatus = useMemo(() => {
    switch (filter) {
      case "attended":
        return "APPROVED";
      case "completed":
        return "COMPLETED";
      case "absent":
        return "REJECTED";
      case "all":
        return undefined; // no status filter
      default:
        return "APPROVED";
    }
  }, [filter]);

  const queryParams = useMemo(() => {
    const base = { pageNum, pageSize: itemsToShow };
    return mappedStatus ? { ...base, status: mappedStatus } : base;
  }, [pageNum, itemsToShow, mappedStatus]);

  const { data, isLoading, isError, refetch } = useListUserOfAnEvent(
    eventId,
    queryParams
  );
  const registrations = data?.data || [];

  // Local overrides to instantly reflect COMPLETED + note edits before refetch returns
  const [statusOverrides, setStatusOverrides] = useState({}); // { [userId]: { status: "COMPLETED", note: string|null } }

  const getEffectiveRegistrationStatus = (reg) => {
    const override = statusOverrides[reg.userId];
    return override?.status || reg.registrationStatus || reg.status;
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const searchLower = searchQuery.toLowerCase();
    const user = registration.user || {};
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower) ||
      user.address?.toLowerCase().includes(searchLower)
    );
  });

  const volunteers = filteredRegistrations.map((reg) => {
    const user = reg.user || {};
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
      id: reg.userId,
      name: user.fullName || user.name || user.username || "Unknown",
      email: user.email || "",
      status: cardStatus,
      hoursLogged: Math.floor(Math.random() * 4) + 1, // Random 1-4 hours
      feedback: statusOverrides[reg.userId]?.note ?? reg.note ?? undefined,
      avatar: user.avatarUrl || null,
    };
  });

  const regMap = useMemo(() => {
    const m = new Map();
    registrations.forEach((reg) => m.set(reg.userId, reg));
    return m;
  }, [registrations]);

  // Modal state for marking completion / editing note
  const [selectedReg, setSelectedReg] = useState(null);
  const [note, setNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false); // Track if editing existing completion
  const reviewMutation = useReviewRegistration();

  const openNoteModalForVolunteer = (vol, isEditing = false) => {
    const reg = regMap.get(vol.id);
    if (!reg) return;
    setSelectedReg(reg);
    setNote(statusOverrides[reg.userId]?.note ?? reg.note ?? "");
    setIsEditingNote(isEditing);
  };

  const handleComplete = () => {
    if (!selectedReg) return;

    // If editing note only, don't send status
    const payload = {
      eventId: selectedReg.eventId || eventId,
      participantId: selectedReg.userId,
      note: note.trim(),
    };

    // Only add status when marking as completed for the first time
    if (!isEditingNote) {
      payload.status = "COMPLETED";
    }

    reviewMutation.mutate(payload, {
      onSuccess: () => {
        setStatusOverrides((prev) => ({
          ...prev,
          [selectedReg.userId]: {
            status: isEditingNote
              ? prev[selectedReg.userId]?.status || "COMPLETED"
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
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 p-5 text-deep-forest sm:gap-8 sm:border-2 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-beni text-[56px] font-black uppercase leading-[0.7] text-deep-forest md:text-[80px]">
          Volunteer Completion Management
        </h2>
        <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
          Đánh dấu hoàn thành và chỉnh sửa ghi chú cho tình nguyện viên
        </p>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative w-full lg:min-w-[300px] lg:flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Tìm kiếm tình nguyện viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(next) => setFilter(next)}
            />
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="rounded-[20px] border border-deep-forest/20 bg-ash-whisper/60 p-4">
        <p className="text-sm font-medium leading-[1.2] text-deep-forest/75">
          <span className="font-semibold">Mẹo:</span> Lọc theo "Attended" để xem
          danh sách đã duyệt, sau đó đánh dấu "Completed" và thêm ghi chú để cấp
          chứng nhận.
        </p>
      </div>

      <CompletionQrPanel eventId={eventId} eventStatus={eventData?.status} />

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
            Không tìm thấy tình nguyện viên phù hợp "{searchQuery}"
          </div>
        )}
      </div>

      {/* Completion Note Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-forest/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] rounded-[20px] border border-deep-forest/25 bg-pale-canvas p-6 text-deep-forest">
            <h3 className="font-beni text-[46px] font-black uppercase leading-[0.7] text-deep-forest">
              {isEditingNote ? "Chỉnh sửa ghi chú" : "Đánh dấu hoàn thành"}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold leading-[1.2] text-deep-forest">
                  Ghi chú (tùy chọn):
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú cho việc hoàn thành..."
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
                    ? "Đang xử lý..."
                    : isEditingNote
                    ? "Lưu ghi chú"
                    : "Xác nhận hoàn thành"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManagerMarkComplete;
