import { Search, Download, MessageSquare, User, Plus, FileText, Users, BarChart3, Settings, Calendar } from "lucide-react";
import { ROLES } from "./role";

export const quickActionsConfig = {
  [ROLES.USER]: [
    {
      id: "find-events",
      label: "Find Events",
      icon: Search,
      navigate: "/opportunities",
      active: true,
    },
    {
      id: "my-events",
      label: "My Events",
      icon: Calendar,
      navigate: "/dashboard/activity",
      active: false,
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      navigate: "/dashboard/notifications",
      active: false,
    },
    {
      id: "edit-profile",
      label: "Edit Profile",
      icon: User,
      navigate: "/setting",
      active: false,
    },
  ],
  [ROLES.MANAGER]: [
    {
      id: "create-event",
      label: "Create Event",
      icon: Plus,
      navigate: "/dashboard/eventmanager",
      active: true,
    },
    {
      id: "manage-events",
      label: "Manage Events",
      icon: Calendar,
      navigate: "/dashboard/eventmanager",
      active: false,
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: Users,
      navigate: "/dashboard/approve-registration",
      active: false,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      navigate: "/dashboard/manager-analytics",
      active: false,
    },
  ],
  [ROLES.ADMIN]: [
    {
      id: "manage-events",
      label: "Manage Events",
      icon: Calendar,
      navigate: "/dashboard/eventAdminManager",
      active: true,
    },
    {
      id: "manage-users",
      label: "Manage Users",
      icon: Users,
      navigate: "/dashboard/userAdminManager",
      active: false,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      navigate: "/dashboard/exportData",
      active: false,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      navigate: "/dashboard/admin-analytics",
      active: false,
    },
  ],
};

