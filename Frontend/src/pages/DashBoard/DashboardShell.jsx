import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col gap-10">
      <DashboardLayout />
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
