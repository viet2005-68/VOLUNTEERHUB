// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import { ROLES } from "../constant/role";
import MainLayout from "../Layout/MainLayout";
import DashboardShell from "../pages/DashBoard/DashboardShell";
import Overview from "../pages/DashBoard/Overview";
import OpportunitiesTab from "../pages/DashBoard/Opportunities";
import Activity from "../pages/DashBoard/Activity";
import Badges from "../pages/DashBoard/Badges";

import Unauthorized from "../pages/DemoPages/Unauthorized";
import OpportunitiesEvent from "../pages/Opportunities/Opportunities";
import OpportunitiePageDetail from "../pages/EventPage/EventLayout";
import EventLayout from "../pages/EventPage/EventLayout";

import ManagerEventForManager from "../pages/ManageEventForManager/ManagerEventForManager";
import EventManagerMarkComplete from "../components/ManageEventDb/EventManagerMarkComplete";
import OverviewEventManager from "../components/ManageEventDb/OverviewEventManager";
import VolunteerList from "../components/ManageEventDb/VolunteerList";
import EventVolunteerRegister from "../components/ManageEventDb/EventVolunteerRegister";
import RegistrationPage from "../pages/DashBoard/RegistrationPage";
import LandingPage from "../pages/Landing";
import SignUpForm from "../pages/Home/SignUp";
import OAuth2Callback from "../pages/Auth/OAuth2Callback";
import BanUser from "../pages/Auth/BanUser";

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
      <Route path="/" element={<LandingPage />} />
      {/* Protected routes */}
      <Route element={<MainLayout />}>
        {/* Shared protected area */}
        <Route>
          {/* Dashboard (with nested tabs) */}
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="opportunities" element={<OpportunitiesTab />} />
            <Route path="activity" element={<Activity />} />
            <Route path="badges" element={<Badges />} />
            </Route>

          {/* opportunities */}
          <Route path="/opportunities" element={<OpportunitiesEvent />} />
          <Route path="/opportunities/:tab/:id" element={<EventLayout />} />
      </Route>

        {/* Admin-only route */}
        <Route >
         <Route path="/dashboard" element={<DashboardShell />}>
           </Route>
        </Route>

        {/* User-only route */}
        <Route>
        </Route>

        <Route>
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="approve-registration" element={<RegistrationPage />} />
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
