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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-500 mt-1">
            Manage users, monitor platform activity, and ensure compliance
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <BarChart2 className="w-5 h-5" />
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
