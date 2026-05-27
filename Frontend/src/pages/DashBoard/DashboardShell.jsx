import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function DashboardShell() {
  const location = useLocation();
  const isMessagesPage = location.pathname === "/dashboard/messages";

  return (
    <div
      className={`flex min-h-screen flex-col bg-pale-canvas text-deep-forest ${
        isMessagesPage ? "gap-0 md:gap-10" : "gap-10"
      }`}
    >
      <div className={isMessagesPage ? "hidden md:block" : ""}>
        <DashboardLayout />
      </div>
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
