import React from "react";
import { BarChart2 } from "lucide-react";
import EventPerformance from "../../components/AnalysisComponent/EventPerformance";
import VolunteerEngagement from "../../components/AnalysisComponent/VolunteerEngagement";
import ImpactMetrics from "../../components/AnalysisComponent/ImpactMetrics";
import VolunteerParticipationTrends from "../../components/AnalysisComponent/VolunteerParticipationTrends";

function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            Analytics & Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Track performance and insights across your volunteer programs
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <BarChart2 className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EventPerformance />
        <VolunteerEngagement />
        <ImpactMetrics />
      </div>

      {/* Bottom Row - Full Width Chart */}
      <VolunteerParticipationTrends />
    </div>
  );
}

export default Analytics;
