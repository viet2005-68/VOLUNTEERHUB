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
    <header className="mb-10">
      <div className="my-8 rounded-[25px] bg-deep-forest px-6 pb-10 pt-14 text-pale-canvas md:px-10 md:pb-12 md:pt-16">
        <p className="font-beni text-[76px] font-black uppercase leading-[0.75] text-pale-canvas md:text-[130px]">
          Welcome back
        </p>
        <p className="mt-1 text-2xl font-bold leading-[0.85] text-bubblegum-blush md:text-3xl">
          {user?.name}
        </p>

        <p className="mt-6 max-w-2xl text-base font-medium leading-[1.2] text-pale-canvas/90">
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
