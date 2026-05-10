export const EVENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  CANCELLED: "REJECTED",
  REJECTED: "REJECTED",
};

export const STATUS_CONFIG = {
  [EVENT_STATUS.PENDING]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    description: "Waiting for approval",
  },
  [EVENT_STATUS.APPROVED]: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    description: "Event is active",
  },
  [EVENT_STATUS.REJECTED]: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    description: "Event rejected",
  },
};

export const getStatusColor = (status) => {
  return STATUS_CONFIG[status]?.color || "bg-gray-100 text-gray-700";
};

export const canCancelEvent = (status) => {
  return status === EVENT_STATUS.APPROVED;
};
