export const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  BAN: "ban",
  BANNED: "banned",
};

export const STATUS_CONFIG = {
  [USER_STATUS.PENDING]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    description: "Waiting for approval",
  },
  [USER_STATUS.ACTIVE]: {
    label: "Active",
    color: "bg-green-100 text-green-700",
    description: "User is active",
  },
  [USER_STATUS.BAN]: {
    label: "Banned",
    color: "bg-red-100 text-red-700",
    description: "User is banned",
  },
  [USER_STATUS.BANNED]: {
    label: "Banned",
    color: "bg-red-100 text-red-700",
    description: "User is banned",
  },
};

export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return STATUS_CONFIG[normalizedStatus]?.color || "bg-gray-100 text-gray-700";
};

export const canBan = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return normalizedStatus === USER_STATUS.ACTIVE;
};
