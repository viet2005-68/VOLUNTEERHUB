// src/menuConfig.js
import { ROLES } from "./role";
export const MENU_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: [ROLES.ADMIN, ROLES.USER, ROLES.ORG],
  },
  {
    label: "User Management",
    path: "/admin",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "System Settings",
    path: "/settings",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "My Profile",
    path: "/profile",
    allowedRoles: [ROLES.USER],
  },
  {
    label: "Members",
    path: "/organization",
    allowedRoles: [ROLES.ORG],
  },
  {
    label: "Reports",
    path: "/reports",
    allowedRoles: [ROLES.ORG],
  },
];
