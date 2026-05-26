import React, { useState } from "react";
import {
  Ban,
  CircleCheckBig,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
} from "lucide-react";
import {
  getStatusColor,
  STATUS_CONFIG,
  USER_STATUS,
  canBan,
} from "../../constant/userStatus";
import { Mail, User } from "lucide-react";
import { showConfirmDialog, showError } from "../../utils/confirmDialog";

function UserCard({ data, onBanUser, onUnbanUser, onEdit, onView }) {
  const {
    id,
    fullName,
    email,
    avatarUrl,
    role,
    status,
    phoneNumber,
    dateOfBirth,
  } = data;

  // Map API data to component props
  const name = fullName;
  const avatar =
    avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
  const type = role?.toLowerCase() || "user";

  // Use status directly from props (optimistic updates handled by parent)
  const currentStatus = status?.toLowerCase() || "active";
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    return phone;
  };

  const BanUser = async () => {
    if (!canBan(currentStatus)) {
      await showError("Cannot Ban User", "Only active users can be banned");
      return;
    }

    const confirmed = await showConfirmDialog({
      title: "Ban User",
      text: `Are you sure you want to ban "${name}"? This user will no longer be able to access the platform.`,
      icon: "warning",
      confirmButtonText: "Yes, ban user",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!confirmed) return;

    await onBanUser?.(id);
  };

  const UnbanUser = async () => {
    const confirmed = await showConfirmDialog({
      title: "Unban User",
      text: `Are you sure you want to unban "${name}"? This user will be able to access the platform again.`,
      icon: "question",
      confirmButtonText: "Yes, unban user",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#22c55e",
    });

    if (!confirmed) return;

    await onUnbanUser?.(id);
  };

  return (
    <>
      {/* Desktop View - Table Row */}
      <tr className="hidden border-b-2 border-ash-whisper transition-colors hover:bg-ash-whisper/35 lg:table-row">
        <td className="px-6 py-4">
          <span className="font-mono text-xs font-bold text-deep-forest/55" title={id}>
            {id?.slice(0, 8)}...
          </span>
        </td>
        <td className="px-6 py-4">
          <img
            src={avatar}
            alt={name}
            className="h-11 w-11 rounded-full border-2 border-ash-whisper object-cover"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-bold text-deep-forest">{name}</span>
            <span className="text-sm font-medium text-deep-forest/55">{email}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="rounded-[10px] bg-ash-whisper px-3 py-1.5 text-sm font-bold capitalize text-deep-forest">
            {type}
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-block min-w-[90px] rounded-[10px] px-3 py-1.5 text-center text-sm font-bold capitalize ${getStatusColor(
              currentStatus
            )}`}
            title={STATUS_CONFIG[currentStatus]?.description}
          >
            {STATUS_CONFIG[currentStatus]?.label || currentStatus}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-deep-forest/70">
            <span>{formatPhoneNumber(phoneNumber)}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-deep-forest/70">
            <Calendar className="h-4 w-4 text-deep-forest/40" />
            <span>{formatDate(dateOfBirth)}</span>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {currentStatus === USER_STATUS.ACTIVE && (
              <button
                onClick={BanUser}
                className="rounded-[10px] bg-deep-forest p-2 text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                title="Ban user"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
            {(currentStatus === USER_STATUS.BAN ||
              currentStatus === USER_STATUS.BANNED) && (
              <button
                onClick={UnbanUser}
                className="rounded-[10px] bg-deep-forest p-2 text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                title="Unban user"
              >
                <CircleCheckBig className="w-4 h-4" />
              </button>
            )}
            {currentStatus === USER_STATUS.PENDING && (
              <button
                onClick={() => onEdit?.(id)}
                className="rounded-[10px] bg-deep-forest p-2 text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                title="Approve User"
              >
                <CircleCheckBig className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onView?.(id)}
              className="rounded-[10px] border-2 border-deep-forest bg-transparent p-2 text-deep-forest transition-all hover:-translate-y-0.5 hover:bg-deep-forest hover:text-pale-canvas"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile View - Expandable Card */}
      <tr className="lg:hidden">
        <td colSpan="8" className="p-0">
          <div className="mb-5 rounded-[20px] border-2 border-ash-whisper bg-white text-deep-forest">
            {/* Compact Header - Always Visible */}
            <div
              className="cursor-pointer p-4 transition-colors active:bg-ash-whisper/50"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="mb-1 text-base font-bold leading-tight text-deep-forest">
                    {name}
                  </p>

                  {/* Type & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-[10px] bg-ash-whisper px-2.5 py-1 text-xs font-bold capitalize text-deep-forest">
                      {type}
                    </span>
                    <span
                      className={`rounded-[10px] px-2.5 py-1 text-xs font-bold capitalize ${getStatusColor(
                        currentStatus
                      )}`}
                    >
                      {STATUS_CONFIG[currentStatus]?.label || currentStatus}
                    </span>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  className="flex-shrink-0 rounded-full p-1 text-deep-forest transition-colors hover:bg-ash-whisper"
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
                <div className="mt-3 flex items-center gap-3 text-xs font-medium text-deep-forest/60">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{formatPhoneNumber(phoneNumber)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(dateOfBirth)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-3 rounded-[20px] border-t-2 border-ash-whisper px-4 pb-4 text-deep-forest">
                {/* Email & Type */}
                <div className="flex items-start gap-2 text-sm pt-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-deep-forest/45" />
                  <span className="break-words font-medium text-deep-forest/75">{email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-deep-forest/45" />
                  <span className="break-words font-medium capitalize text-deep-forest/75">
                    {type}
                  </span>
                </div>

                {/* Phone & Date of Birth */}
                <div className="rounded-[20px] bg-ash-whisper/55 p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-deep-forest/60" />
                      <span className="font-bold text-deep-forest">
                        Contact Info
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-deep-forest/45" />
                      <span className="font-medium text-deep-forest/75">
                        {formatPhoneNumber(phoneNumber)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-deep-forest/45" />
                      <span className="font-medium text-deep-forest/75">
                        {formatDate(dateOfBirth)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {currentStatus === USER_STATUS.ACTIVE && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        BanUser();
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest py-3 font-bold text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      <Ban className="h-4 w-4" />
                      <span className="text-sm font-bold">Ban User</span>
                    </button>
                  )}
                  {(currentStatus === USER_STATUS.BAN ||
                    currentStatus === USER_STATUS.BANNED) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        UnbanUser();
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest py-3 font-bold text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      <CircleCheckBig className="h-4 w-4" />
                      <span className="text-sm font-bold">Unban User</span>
                    </button>
                  )}
                  {currentStatus === USER_STATUS.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(id);
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest py-3 font-bold text-pale-canvas transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      <CircleCheckBig className="h-4 w-4" />
                      <span className="text-sm font-bold">Approve User</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(id);
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] border-2 border-deep-forest bg-transparent py-3 font-bold text-deep-forest transition-all hover:-translate-y-0.5 hover:bg-deep-forest hover:text-pale-canvas"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-bold">View</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

export default UserCard;
