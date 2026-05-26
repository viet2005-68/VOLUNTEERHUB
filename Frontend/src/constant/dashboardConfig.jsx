import {
  FiClock,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";

export const dashboardConfig = {
  USER: [
    {
      label: "Total Hours",
      value: "0",
      icon: <FiClock className="text-blue-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalServiceHours",
      unit: "h",
    },
    {
      label: "Events Completed",
      value: "0",
      icon: <FiCheckCircle className="text-green-500" />,
      useAnalytics: "dashboard",
      dataKey: "completedApplications",
    },
    {
      label: "Approved",
      value: "0",
      icon: <FiAward className="text-purple-500" />,
      useAnalytics: "dashboard",
      dataKey: "approvedApplications",
    },
    {
      label: "Pending",
      value: "0",
      icon: <FiClock className="text-orange-500" />,
      useAnalytics: "dashboard",
      dataKey: "pendingApplications",
    },
  ],

  MANAGER: [
    {
      label: "Total Events",
      value: "0",
      icon: <FiCalendar className="text-blue-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalEvents",
    },
    {
      label: "Active Events",
      value: "0",
      icon: <FiCheckCircle className="text-green-500" />,
      useAnalytics: "dashboard",
      dataKey: "activeEvents",
    },
    {
      label: "Applications",
      value: "0",
      icon: <FiClock className="text-orange-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalApplications",
    },
    {
      label: "Service Hours",
      value: "0",
      icon: <FiUsers className="text-purple-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalServiceHours",
      unit: "h",
    },
  ],

  ADMIN: [
    {
      label: "Total Users",
      value: "0",
      icon: <FiUsers className="text-blue-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalUsers",
    },
    {
      label: "Total Managers",
      value: "0",
      icon: <FiAward className="text-green-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalManagers",
    },
    {
      label: "Total Events",
      value: "0",
      icon: <FiCalendar className="text-purple-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalEvents",
    },
    {
      label: "Service Hours",
      value: "0",
      icon: <FiTrendingUp className="text-orange-500" />,
      useAnalytics: "dashboard",
      dataKey: "totalServiceHours",
      unit: "h",
    },
  ],
};
