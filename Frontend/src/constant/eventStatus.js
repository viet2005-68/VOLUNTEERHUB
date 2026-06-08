export const EVENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  CANCELLED: "REJECTED",
  REJECTED: "REJECTED",
};

export const STATUS_CONFIG = {
  [EVENT_STATUS.PENDING]: {
    label: "Pending",
    color: "border border-foudre-pink/20 bg-ash-whisper text-foudre-pink",
    description: "Waiting for approval",
  },
  [EVENT_STATUS.APPROVED]: {
    label: "Approved",
    color: "border border-deep-forest/15 bg-deep-forest/10 text-deep-forest",
    description: "Event is active",
  },
  [EVENT_STATUS.REJECTED]: {
    label: "Rejected",
    color: "border border-foudre-pink/20 bg-foudre-pink/10 text-foudre-pink",
    description: "Event rejected",
  },
};

export const getStatusColor = (status) => {
  return STATUS_CONFIG[status]?.color || "border border-deep-forest/10 bg-ash-whisper text-deep-forest";
};

export const canCancelEvent = (status) => {
  return status === EVENT_STATUS.APPROVED;
};
