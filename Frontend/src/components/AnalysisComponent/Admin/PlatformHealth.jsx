import React from "react";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useDashboardAnalytics } from "../../../hook/useAnalysis";

const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat("en-US", options).format(Number(value || 0));

function PlatformHealth() {
  const { data, isLoading } = useDashboardAnalytics();

  const stats = [
    {
      label: "Service Hours",
      value: `${formatNumber(data?.totalServiceHours, { maximumFractionDigits: 1 })}h`,
      icon: Clock,
      color: "text-deep-forest",
      bgColor: "bg-ash-whisper",
    },
    {
      label: "Pending Applications",
      value: formatNumber(data?.pendingApplications),
      icon: AlertCircle,
      color: "text-foudre-pink",
      bgColor: "bg-foudre-pink/10",
    },
    {
      label: "Approval Rate",
      value: `${Math.round(data?.approvalRate || 0)}%`,
      icon: CheckCircle,
      color: "text-bubblegum-blush",
      bgColor: "bg-bubblegum-blush/25",
    },
    {
      label: "Completed",
      value: formatNumber(data?.completedApplications),
      icon: Activity,
      color: "text-deep-forest",
      bgColor: "bg-deep-forest/10",
    },
  ];

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-6 text-deep-forest shadow-sm">
      <h4 className="mb-6 text-xl font-bold leading-[1.05] text-deep-forest">
        Platform Activity
      </h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </span>
                <span className="text-sm font-medium leading-[1.2] text-deep-forest/70">
                  {stat.label}
                </span>
              </span>
              <span className={`text-lg font-bold leading-[1] ${stat.color}`}>
                {isLoading ? "..." : stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlatformHealth;
