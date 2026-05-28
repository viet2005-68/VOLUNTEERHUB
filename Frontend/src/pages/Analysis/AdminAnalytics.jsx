import React from "react";
import { Download } from "lucide-react";
import UserGrowth from "../../components/AnalysisComponent/Admin/UserGrowth";
import EventAnalytics from "../../components/AnalysisComponent/Admin/EventAnalytics";
import PlatformHealth from "../../components/AnalysisComponent/Admin/PlatformHealth";
import UserRegistrationTrends from "../../components/AnalysisComponent/Admin/UserRegistrationTrends";
import EventCategoriesDistribution from "../../components/AnalysisComponent/Admin/EventCategoriesDistribution";

function AdminAnalytics() {
  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
            Platform Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-base font-medium leading-[1.2] text-deep-forest/70">
            Manage users, monitor platform activity, and ensure compliance
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <UserGrowth />
        <EventAnalytics />
        <PlatformHealth />
      </div>

      {/* Bottom Row - 2 Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <UserRegistrationTrends />
        <EventCategoriesDistribution />
      </div>
    </div>
  );
}

export default AdminAnalytics;
