import React, { useEffect, useState } from "react";
import {
  Ban,
  CircleCheckBig,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
} from "lucide-react";
import {
  getStatusColor,
  STATUS_CONFIG,
  EVENT_STATUS,
} from "../../constant/eventStatus";
import { useNavigate } from "react-router-dom";
import {
  useApproveEvent,
  useRejectEvent,
  useDeleteEvent,
} from "../../hook/useEvent";
import RejectReasonModal from "../Modal/RejectReasonModal";
import AnalysisService from "../../services/analysisService";
import { confirmApprove, confirmDelete } from "../../utils/confirmDialog";

function EventManagerCardAd({ data }) {
  const navigate = useNavigate();
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();
  const deleteEventMutation = useDeleteEvent();

  // Map API response to component props
  const id = data.id;
  const title = data.name;
  const category = data.category?.name || "Unknown";
  const date = data.startTime;
  const location = `${data.address?.street || ""}, ${
    data.address?.district || ""
  }, ${data.address?.province || ""}`.trim();
  const status = data.status;
  const registered = data.participantCount || 0;
  const capacity = data.capacity;
  const isUpdating = data._isUpdating || false; // Optimistic update flag
  const isDeleting = data._isDeleting || false; // Optimistic delete flag

  const [currentStatus, setCurrentStatus] = useState(status);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getProgressPercentage = () => {
    if (!capacity) return 0;
    return Math.min(Math.round((registered / capacity) * 100), 100);
  };

  const handleApproveEvent = async () => {
    const confirmed = await confirmApprove(title);
    if (!confirmed) return;

    try {
      await approveEventMutation.mutateAsync(id);
      setCurrentStatus(EVENT_STATUS.APPROVED);
    } catch (error) {
      console.error("Failed to approve event:", error);
    }
  };

  const handleRejectEvent = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (reason) => {
    try {
      await rejectEventMutation.mutateAsync({ eventId: id, reason });
      setCurrentStatus(EVENT_STATUS.REJECTED);
      setShowRejectModal(false);
    } catch (error) {
      console.error("Failed to reject event:", error);
      // Modal will stay open on error so user can try again
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = await confirmDelete(title);
    if (!confirmed) return;

    try {
      await deleteEventMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let response;
      let filename;
      let mimeType;

      if (format === "csv") {
        response = await AnalysisService.getEventParticipantsCsv(id);
        filename = `event_${id}_participants_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        response = await AnalysisService.getEventParticipantsJson(id);
        filename = `event_${id}_participants_${
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
      console.error(`Error exporting participants as ${format}:`, error);
      alert(
        `Failed to export participants: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Desktop View - Table Row */}
      <tr className="hidden border-b-2 border-ash-whisper text-sm transition-colors hover:bg-ash-whisper/30 last:border-b-0 lg:table-row">
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="text-base font-bold leading-[1.2] text-deep-forest">
              {title}
            </span>
            <span className="text-sm font-medium leading-[1.2] text-deep-forest/60">
              {category}
            </span>
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="flex flex-col gap-1 text-sm font-medium leading-[1.2]">
            <div className="flex items-center gap-1.5 text-deep-forest">
              <i className="ri-calendar-line"></i>
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-deep-forest/65">
              <i className="ri-time-line"></i>
              <span>{formatTime(date)}</span>
            </div>
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="flex items-center gap-2 text-sm font-medium leading-[1.2] text-deep-forest/75">
            <i className="ri-map-pin-fill text-foudre-pink"></i>
            <span className="max-w-[150px] truncate">{location}</span>
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold leading-[1.2] text-deep-forest">
                {registered}/{capacity}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-ash-whisper">
              <div
                className={`h-2 rounded-full transition-all ${
                  registered === capacity
                    ? "bg-foudre-pink"
                    : registered >= capacity * 0.8
                    ? "bg-bubblegum-blush"
                    : "bg-deep-forest"
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </td>

        <td className="px-6 py-5">
          <span
            className={`inline-block min-w-[90px] rounded-[10px] px-3 py-2 text-center text-sm font-bold capitalize leading-[0.85] ${
              isDeleting
                ? "border border-foudre-pink/20 bg-foudre-pink/10 text-foudre-pink animate-pulse"
                : isUpdating
                ? "border border-foudre-pink/20 bg-ash-whisper text-foudre-pink animate-pulse"
                : getStatusColor(currentStatus)
            }`}
            title={
              isDeleting
                ? "Deleting..."
                : isUpdating
                ? "Processing..."
                : STATUS_CONFIG[currentStatus]?.description
            }
          >
            {isDeleting
              ? "Deleting..."
              : isUpdating
              ? "Processing..."
              : STATUS_CONFIG[currentStatus]?.label || currentStatus}
          </span>
        </td>

        <td className="px-6 py-5">
          <div className="flex items-center gap-2">
            {/* Approve button - only for PENDING */}
            {currentStatus === EVENT_STATUS.PENDING && (
              <button
                onClick={handleApproveEvent}
                disabled={
                  approveEventMutation.isPending || isUpdating || isDeleting
                }
                className="rounded-[10px] p-2 text-deep-forest transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
                title="Approve Event"
              >
                <CircleCheckBig className="h-4 w-4" />
              </button>
            )}

            {/* View button - always visible */}
            <button
              onClick={() => navigate(`/dashboard/eventmanager/${id}`)}
              disabled={isUpdating || isDeleting}
              className="rounded-[10px] p-2 text-deep-forest transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-current" />
            </button>

            {/* Export button - only for APPROVED */}
            {currentStatus === EVENT_STATUS.APPROVED && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting || isUpdating || isDeleting}
                  className="rounded-[10px] p-2 text-deep-forest transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
                  title="Export Participants"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && !isExporting && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-[10px] border border-ash-whisper bg-pale-canvas shadow-lg">
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                    >
                      <Download className="h-3 w-3" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                    >
                      <Download className="h-3 w-3" />
                      <span>JSON</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reject button - only for PENDING */}
            {currentStatus === EVENT_STATUS.PENDING && (
              <button
                onClick={handleRejectEvent}
                disabled={
                  rejectEventMutation.isPending || isUpdating || isDeleting
                }
                className="rounded-[10px] p-2 text-foudre-pink transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
                title="Reject Event"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}

            {/* Delete button - only for APPROVED */}
            {currentStatus === EVENT_STATUS.APPROVED && (
              <button
                onClick={handleDeleteEvent}
                disabled={
                  deleteEventMutation.isPending || isUpdating || isDeleting
                }
                className="rounded-[10px] p-2 text-foudre-pink transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete Event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Mobile View - Expandable Card */}
      <tr className="lg:hidden">
        <td colSpan="6" className="p-0">
          <div className="mb-5 rounded-[20px] border border-ash-whisper bg-pale-canvas/80">
            {/* Compact Header - Always Visible */}
            <div
              className="cursor-pointer p-4 transition-colors active:bg-ash-whisper/50"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="mb-1 text-base font-bold leading-tight text-deep-forest">
                    {title}
                  </p>

                  {/* Category & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-deep-forest/60">
                      {category}
                    </span>
                    <span
                      className={`rounded-[10px] px-2 py-1 text-xs font-bold capitalize ${
                        isDeleting
                          ? "border border-foudre-pink/20 bg-foudre-pink/10 text-foudre-pink animate-pulse"
                          : isUpdating
                          ? "border border-foudre-pink/20 bg-ash-whisper text-foudre-pink animate-pulse"
                          : getStatusColor(currentStatus)
                      }`}
                    >
                      {isDeleting
                        ? "Deleting..."
                        : isUpdating
                        ? "Processing..."
                        : STATUS_CONFIG[currentStatus]?.label || currentStatus}
                    </span>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  className="flex-shrink-0 rounded-full p-1 text-deep-forest/45 transition-colors hover:bg-ash-whisper"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Quick Info Preview (when collapsed) */}
              {!isExpanded && (
                <div className="mt-2 flex items-center gap-3 text-xs font-medium text-deep-forest/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {registered}/{capacity}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 rounded-xl">
                {/* Date & Time */}
                <div className="flex items-center gap-2 pt-3 text-sm font-medium text-deep-forest">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDate(date)}</span>
                  <Clock className="ml-2 h-4 w-4 flex-shrink-0 text-deep-forest/60" />
                  <span className="text-deep-forest/65">{formatTime(date)}</span>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm font-medium text-deep-forest/75">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-foudre-pink" />
                  <span className="break-words">{location}</span>
                </div>

                {/* Volunteers Progress */}
                <div className="rounded-[10px] bg-ash-whisper/45 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-deep-forest/65" />
                      <span className="font-medium text-deep-forest/70">
                        Volunteers
                      </span>
                    </div>
                    <span className="font-bold text-deep-forest">
                      {registered}/{capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-pale-canvas">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        registered === capacity
                          ? "bg-foudre-pink"
                          : registered >= capacity * 0.8
                          ? "bg-bubblegum-blush"
                          : "bg-deep-forest"
                      }`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-deep-forest/60">
                    {getProgressPercentage()}% filled
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {/* Approve button - only for PENDING, full width */}
                  {currentStatus === EVENT_STATUS.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveEvent();
                      }}
                      disabled={
                        approveEventMutation.isPending ||
                        isUpdating ||
                        isDeleting
                      }
                      className="col-span-4 flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest py-2.5 text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CircleCheckBig className="h-4 w-4" />
                      <span className="text-sm font-bold">
                        {approveEventMutation.isPending
                          ? "Approving..."
                          : "Approve Event"}
                      </span>
                    </button>
                  )}

                  {/* View button - always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/opportunities/overview/${id}`);
                    }}
                    disabled={isUpdating || isDeleting}
                    className={`${
                      currentStatus === EVENT_STATUS.APPROVED
                        ? "col-span-2"
                        : "col-span-2"
                    } flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest py-2.5 text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-bold">View</span>
                  </button>

                  {/* Export dropdown - only for APPROVED */}
                  {currentStatus === EVENT_STATUS.APPROVED && (
                    <div className="col-span-1 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowExportMenu(!showExportMenu);
                        }}
                        disabled={isExporting || isUpdating || isDeleting}
                        className="flex w-full items-center justify-center rounded-[10px] bg-deep-forest py-2.5 text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      {/* Export Dropdown Menu */}
                      {showExportMenu && !isExporting && (
                        <div className="absolute bottom-full right-0 z-50 mb-1 w-28 overflow-hidden rounded-[10px] border border-ash-whisper bg-pale-canvas shadow-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport("csv");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                          >
                            <Download className="h-3 w-3" />
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport("json");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                          >
                            <Download className="h-3 w-3" />
                            <span>JSON</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reject button - only for PENDING */}
                  {currentStatus === EVENT_STATUS.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectEvent();
                      }}
                      disabled={
                        rejectEventMutation.isPending ||
                        isUpdating ||
                        isDeleting
                      }
                      className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] bg-foudre-pink py-2.5 text-pale-canvas transition-colors hover:bg-bubblegum-blush disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Ban className="h-4 w-4" />
                      <span className="text-sm font-bold">
                        {rejectEventMutation.isPending
                          ? "Rejecting..."
                          : "Reject"}
                      </span>
                    </button>
                  )}

                  {/* Delete button - only for APPROVED */}
                  {currentStatus === EVENT_STATUS.APPROVED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent();
                      }}
                      disabled={
                        deleteEventMutation.isPending ||
                        isUpdating ||
                        isDeleting
                      }
                      className="col-span-1 flex items-center justify-center rounded-[10px] bg-foudre-pink py-2.5 text-pale-canvas transition-colors hover:bg-bubblegum-blush disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        eventTitle={title}
        isLoading={rejectEventMutation.isPending}
      />
    </>
  );
}

export default EventManagerCardAd;
