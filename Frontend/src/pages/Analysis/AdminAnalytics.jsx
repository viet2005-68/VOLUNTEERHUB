import React from "react";
import { BarChart2 } from "lucide-react";
import UserGrowth from "../../components/AnalysisComponent/Admin/UserGrowth";
import EventAnalytics from "../../components/AnalysisComponent/Admin/EventAnalytics";
import PlatformHealth from "../../components/AnalysisComponent/Admin/PlatformHealth";
import UserRegistrationTrends from "../../components/AnalysisComponent/Admin/UserRegistrationTrends";
import EventCategoriesDistribution from "../../components/AnalysisComponent/Admin/EventCategoriesDistribution";

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-deep-forest">Platform Analytics</h1>
          <p className="mt-1 text-deep-forest/70">
            Manage users, monitor platform activity, and ensure compliance
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink">
          <BarChart2 className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserGrowth />
        <EventAnalytics />
        <PlatformHealth />
      </div>

      {/* Bottom Row - 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRegistrationTrends />
        <EventCategoriesDistribution />
      </div>
    </div>
  );
}

export default AdminAnalytics;
