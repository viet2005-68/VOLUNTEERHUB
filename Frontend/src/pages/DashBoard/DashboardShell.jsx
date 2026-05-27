import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function DashboardShell() {
  const location = useLocation();
  const isMessagesPage =
    location.pathname === "/dashboard/messages" ||
    location.pathname.startsWith("/dashboard/event-chat");

  return (
    <div
      className={`flex flex-col bg-pale-canvas text-deep-forest ${
        isMessagesPage ? "h-full min-h-0 gap-0" : "min-h-screen gap-8"
      }`}
    >
      <div className={isMessagesPage ? "hidden" : ""}>
        <DashboardLayout />
      </div>
      <div className={isMessagesPage ? "min-h-0 flex-1" : "w-full"}>
        <Outlet />
      </div>
    </div>
  );
}
