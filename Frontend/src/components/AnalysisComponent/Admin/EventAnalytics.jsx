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
      color: "text-deep-forest",
      bgColor: "bg-ash-whisper",
    },
    {
      label: "Active Events",
      value: data?.activeEvents || 0,
      icon: Play,
      color: "text-foudre-pink",
      bgColor: "bg-foudre-pink/10",
    },
    {
      label: "Pending Review",
      value: data?.pendingEvents || 0,
      icon: Clock,
      color: "text-deep-forest",
      bgColor: "bg-deep-forest/10",
    },
    {
      label: "Completion Rate",
      value: `${Math.round(data?.completionRate || 0)}%`,
      icon: CheckCircle,
      color: "text-foudre-pink",
      bgColor: "bg-bubblegum-blush/25",
    },
  ];

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-6 text-deep-forest shadow-sm">
      <h4 className="mb-6 text-xl font-bold leading-[1.05] text-deep-forest">
        Event Analytics
      </h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </span>
                <span className="text-sm font-medium leading-[1.2] text-deep-forest/70">
                  {stat.label}
                </span>
              </div>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-foudre-pink" />
              ) : (
                <span className="text-lg font-bold leading-[1] text-deep-forest">
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
