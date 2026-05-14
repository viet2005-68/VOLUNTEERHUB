export const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  BAN: "ban",
  BANNED: "banned",
};

export const STATUS_CONFIG = {
  [USER_STATUS.PENDING]: {
    label: "Pending",
    color: "bg-ash-whisper text-foudre-pink",
    description: "Waiting for approval",
  },
  [USER_STATUS.ACTIVE]: {
    label: "Active",
    color: "bg-bubblegum-blush text-deep-forest",
    description: "User is active",
  },
  [USER_STATUS.BAN]: {
    label: "Banned",
    color: "bg-foudre-pink text-pale-canvas",
    description: "User is banned",
  },
  [USER_STATUS.BANNED]: {
    label: "Banned",
    color: "bg-foudre-pink text-pale-canvas",
    description: "User is banned",
  },
};

export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return STATUS_CONFIG[normalizedStatus]?.color || "bg-ash-whisper text-deep-forest";
};

export const canBan = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return normalizedStatus === USER_STATUS.ACTIVE;
};
