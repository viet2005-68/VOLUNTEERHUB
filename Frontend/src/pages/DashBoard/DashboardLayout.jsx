// DashboardLayout.jsx
import Tabs from "../../components/Tabs.jsx/Tabs";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";

// Base header items for all roles
const baseHeaderItems = [
  { key: "overview", label: "Overview", to: "/dashboard" },
];

// Role-specific additional items
const roleSpecificItems = {
  [ROLES.ADMIN]: [
    // Admin có thể có thêm tab quản lý hệ thống
    // { key: "admin-tools", label: "Admin Tools", to: "/dashboard/admin-tools" },
    {
      key: "Events",
      label: "Events",
      to: "/dashboard/eventAdminManager",
    },
    {
      key: "Users",
      label: "Users",
      to: "/dashboard/userAdminManager",
    },
    {
      key: "Export Data",
      label: "Export Data",
      to: "/dashboard/exportData",
    },
    {
      key: "analytics",
      label: "Analytics",
      to: "/dashboard/admin-analytics",
    },
  ],
  [ROLES.MANAGER]: [
    // Organization có thể có thêm tab quản lý sự kiện
    // { key: "manage-events", label: "Manage Events", to: "/dashboard/manage-events" },
    {
      key: "manage_events",
      label: "Event Management",
      shortLabel: "Events",
      to: "/dashboard/eventmanager",
    },
    {
      key: "approve_registration",
      label: "Approve Registration",
      shortLabel: "Approve",
      to: "/dashboard/approve-registration",
    },
    {
      key: "mark_completion",
      label: "Mark Completion",
      shortLabel: "Complete",
      to: "/dashboard/markcompletion",
    },
    {
      key: "analytics",
      label: "Analytics",
      to: "/dashboard/manager-analytics",
    },
  ],
  [ROLES.USER]: [
    // User có thể có thêm tab cá nhân
    // { key: "my-profile", label: "My Profile", to: "/dashboard/profile" },
    { key: "opps", label: "Opportunities", to: "/dashboard/opportunities" },

    { key: "badges", label: "Badges", to: "/dashboard/badges" },
  ],
};

const getHeaderItems = (userRole) => {
  const baseItems = [...baseHeaderItems];
  const specificItems = roleSpecificItems[userRole] || [];
  return [
    ...baseItems,
    ...specificItems,
    {
      key: "notifications",
      label: "Notifications",
      to: "/dashboard/notifications",
    },
  ];
};

export default function DashboardLayout() {
  const { user } = useAuth();
  console.log(user);

  // Get header items based on user role
  const headerItems = getHeaderItems(user?.role);

  return (
    <header className="mb-6">
      <div className="flex flex-col gap-2 my-8">
        <p className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%] ">
            Welcome back
          </span>
          , {user?.name}
        </p>

        <p className="text-gray-500">
          Track your volunteer activities and discover new opportunities.
        </p>
      </div>

      {/* asLink=true => NavLink used, URL changes */}
      <div className="mt-6">
        <Tabs items={headerItems} asLink variant="header" />
      </div>
    </header>
  );
}
