import React from "react";
import { Calendar, Play, Users, CheckCircle, Loader2 } from "lucide-react";
import { useEventStatsCount } from "../../../hook/useAnalysis";

function EventAnalytics() {
  const { data: eventStatsCount, isLoading: isLoadingStats } =
    useEventStatsCount();

  const stats = [
    {
      label: "Total Events",
      value: eventStatsCount ?? 0,
      icon: Calendar,
      isLoading: isLoadingStats,
    },
    {
      label: "Active Events",
      value: eventStatsCount ?? 0,
      icon: Play,
      isLoading: isLoadingStats,
    },
    {
      label: "Avg. Participants",
      value: "5.7",
      icon: Users,
      isLoading: false, // Hardcoded
    },
    {
      label: "Completion Rate",
      value: "94.2%",
      icon: CheckCircle,
      isLoading: false, // Hardcoded
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">
        Event Analytics
      </h4>

      <div className="space-y-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className="flex items-center gap-2">
                {stat.isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {stat.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventAnalytics;
