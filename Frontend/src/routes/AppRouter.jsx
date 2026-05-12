// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "../components/Protected/RequireRole";
import AdminPage from "../pages/DemoPages/AdminPage";
import UserPage from "../pages/DemoPages/UserPage";
import OrganizationPage from "../pages/DemoPages/OrganizationPage";

import Unauthorized from "../pages/DemoPages/Unauthorized";
import { ROLES } from "../constant/role";
import MainLayout from "../Layout/MainLayout";
import DashboardShell from "../pages/DashBoard/DashboardShell";
import Overview from "../pages/DashBoard/Overview";
import OpportunitiesTab from "../pages/DashBoard/Opportunities";
import Activity from "../pages/DashBoard/Activity";
import Badges from "../pages/DashBoard/Badges";

import OpportunitiesEvent from "../pages/Opportunities/Opportunities";
import OpportunitiePageDetail from "../pages/EventPage/EventLayout";
import EventLayout from "../pages/EventPage/EventLayout";
import TrendingPage from "../pages/TrendingPages/TrendingPage";
import EventManager from "../pages/EventManager/EventManager";
import MarkCompletionList from "../components/MarkCompletion/MarkCompletionList";
import ManagerEventForManager from "../pages/ManageEventForManager/ManagerEventForManager";
import EventManagerMarkComplete from "../components/ManageEventDb/EventManagerMarkComplete";
import OverviewEventManager from "../components/ManageEventDb/OverviewEventManager";
import VolunteerList from "../components/ManageEventDb/VolunteerList";
import EventVolunteerRegister from "../components/ManageEventDb/EventVolunteerRegister";
import RegistrationPage from "../pages/DashBoard/RegistrationPage";
import EventAdminManager from "../components/Admin/EventAdminManager";
import UserManager from "../components/Admin/UserManager";
import ExportData from "../components/Admin/ExportData";
import ReportAdmin from "../components/Report/ReportAdmin";
import Notifications from "../pages/Notification/Notifications";
import LandingPage from "../pages/Landing";
import SignUpForm from "../pages/Home/SignUp";
import OAuth2Callback from "../pages/Auth/OAuth2Callback";
import Settingpage from "../pages/Setting/Settingpage";
import BanUser from "../pages/Auth/BanUser";
import Analytics from "../pages/Analysis/Analytics";
import AdminAnalytics from "../pages/Analysis/AdminAnalytics";
import CompleteProfile from "../pages/Profile/CompleteProfile";

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login/oauth2/code/volunteerhub"
        element={<OAuth2Callback />}
      />
      <Route path="/login/oauth2/code/google" element={<OAuth2Callback />} />
      {/* <Route path="/login/*" element={<LoginPage />} /> */}
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/banned" element={<BanUser />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/setting" element={<Settingpage />} />
      {/* Protected routes */}
      <Route element={<MainLayout />}>
        {/* Shared protected area */}
        <Route
          element={
            <RequireRole
              allowedRoles={[ROLES.ADMIN, ROLES.USER, ROLES.MANAGER]}
            />
          }
        >
          {/* Dashboard (with nested tabs) */}
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="opportunities" element={<OpportunitiesTab />} />
            <Route path="activity" element={<Activity />} />
            <Route path="badges" element={<Badges />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="eventmanager" element={<EventManager />} />
          </Route>

          {/* opportunities */}
          <Route path="/opportunities" element={<OpportunitiesEvent />} />
          <Route path="/opportunities/:tab/:id" element={<EventLayout />} />

          {/* trending events */}
          <Route path="/trending" element={<TrendingPage />} />
        </Route>

        {/* Admin-only route */}
        <Route element={<RequireRole allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route path="eventAdminManager" element={<EventAdminManager />} />
            <Route path="userAdminManager" element={<UserManager />} />
            <Route path="exportData" element={<ReportAdmin />} />
            <Route path="admin-analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        {/* User-only route */}
        <Route element={<RequireRole allowedRoles={[ROLES.USER]} />}>
          <Route path="/user" element={<UserPage />} />
        </Route>

        <Route element={<RequireRole allowedRoles={[ROLES.MANAGER]} />}>
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="approve-registration" element={<RegistrationPage />} />
            <Route path="markcompletion" element={<MarkCompletionList />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="eventmanager" element={<EventManager />} />
            <Route path="manager-analytics" element={<Analytics />} />
          </Route>

          <Route
            path="/dashboard/eventmanager/:id"
            element={<ManagerEventForManager />}
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewEventManager />} />
            <Route path="manage-volunteers" element={<VolunteerList />} />
            <Route
              path="verify-registration"
              element={<EventVolunteerRegister />}
            />
            <Route
              path="mark-completion"
              element={<EventManagerMarkComplete />}
            />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Unauthorized />} />
    </Routes>
  );
}

export default AppRouter;
