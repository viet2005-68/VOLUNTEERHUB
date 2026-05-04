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
    return Math.round((registered / capacity) * 100);
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
      <tr className="hidden lg:table-row border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{title}</span>
            <span className="text-sm text-gray-500">{category}</span>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col text-sm">
            <div className="flex items-center gap-1 text-gray-700">
              <i className="ri-calendar-line"></i>
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <i className="ri-time-line"></i>
              <span>{formatTime(date)}</span>
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <i className="ri-map-pin-fill text-gray-400"></i>
            <span className="max-w-[150px] truncate">{location}</span>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                {registered}/{capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  registered === capacity
                    ? "bg-red-500"
                    : registered >= capacity * 0.8
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize min-w-[90px] inline-block text-center ${
              isDeleting
                ? "bg-red-100 text-red-700 animate-pulse"
                : isUpdating
                ? "bg-yellow-100 text-yellow-700 animate-pulse"
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

        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Approve button - only for PENDING */}
            {currentStatus === EVENT_STATUS.PENDING && (
              <button
                onClick={handleApproveEvent}
                disabled={
                  approveEventMutation.isPending || isUpdating || isDeleting
                }
                className="p-2 bg-green-500/90 text-white hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Approve Event"
              >
                <CircleCheckBig className="w-4 h-4" />
              </button>
            )}

            {/* View button - always visible */}
            <button
              onClick={() => navigate(`/dashboard/eventmanager/${id}`)}
              disabled={isUpdating || isDeleting}
              className="p-2 border-gray-500/20 border hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>

            {/* Export button - only for APPROVED */}
            {currentStatus === EVENT_STATUS.APPROVED && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting || isUpdating || isDeleting}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export Participants"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && !isExporting && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-t-lg text-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-b-lg text-xs"
                    >
                      <Download className="w-3 h-3" />
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
                className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reject Event"
              >
                <Ban className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Delete button - only for APPROVED */}
            {currentStatus === EVENT_STATUS.APPROVED && (
              <button
                onClick={handleDeleteEvent}
                disabled={
                  deleteEventMutation.isPending || isUpdating || isDeleting
                }
                className="p-2 bg-red-400 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Mobile View - Expandable Card */}
      <tr className="lg:hidden">
        <td colSpan="6" className="p-0">
          <div className="bg-white border-1 border-gray-200 rounded-2xl mb-5 shadow-md">
            {/* Compact Header - Always Visible */}
            <div
              className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="font-semibold text-gray-900 text-base leading-tight mb-1">
                    {title}
                  </p>

                  {/* Category & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">{category}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        isDeleting
                          ? "bg-red-100 text-red-700 animate-pulse"
                          : isUpdating
                          ? "bg-yellow-100 text-yellow-700 animate-pulse"
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
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Quick Info Preview (when collapsed) */}
              {!isExpanded && (
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
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
                <div className="flex items-center gap-2 text-sm pt-3">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{formatDate(date)}</span>
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  <span className="text-gray-600">{formatTime(date)}</span>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">{location}</span>
                </div>

                {/* Volunteers Progress */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 font-medium">
                        Volunteers
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {registered}/{capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        registered === capacity
                          ? "bg-red-500"
                          : registered >= capacity * 0.8
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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
                      className="col-span-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CircleCheckBig className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">
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
                      navigate(`/dashboard/eventmanager/${id}`);
                    }}
                    disabled={isUpdating || isDeleting}
                    className={`${
                      currentStatus === EVENT_STATUS.APPROVED
                        ? "col-span-2"
                        : "col-span-2"
                    } py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">View</span>
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
                        className="w-full py-2.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>

                      {/* Export Dropdown Menu */}
                      {showExportMenu && !isExporting && (
                        <div className="absolute right-0 bottom-full mb-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport("csv");
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-t-lg text-xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport("json");
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-b-lg text-xs"
                          >
                            <Download className="w-3 h-3" />
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
                      className="col-span-2 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Ban className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">
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
                      className="col-span-1 py-2.5 bg-red-400 hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
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
