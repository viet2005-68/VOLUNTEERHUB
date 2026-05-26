import React from "react";
import { Calendar, CheckCircle, Clock, Loader2, Play } from "lucide-react";
import { useDashboardAnalytics } from "../../../hook/useAnalysis";

function EventAnalytics() {
  const { data, isLoading } = useDashboardAnalytics();

  const stats = [
    {
      label: "Total Events",
      value: data?.totalEvents || 0,
      icon: Calendar,
    },
    {
      label: "Active Events",
      value: data?.activeEvents || 0,
      icon: Play,
    },
    {
      label: "Pending Review",
      value: data?.pendingEvents || 0,
      icon: Clock,
    },
    {
      label: "Completion Rate",
      value: `${Math.round(data?.completionRate || 0)}%`,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">
        Event Analytics
      </h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon className="h-4 w-4 text-blue-600" />
                {stat.label}
              </div>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {stat.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventAnalytics;
