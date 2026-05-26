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
    },
    {
      label: "Pending Applications",
      value: formatNumber(data?.pendingApplications),
      icon: AlertCircle,
      color: "text-foudre-pink",
    },
    {
      label: "Approval Rate",
      value: `${Math.round(data?.approvalRate || 0)}%`,
      icon: CheckCircle,
      color: "text-bubblegum-blush",
    },
    {
      label: "Completed",
      value: formatNumber(data?.completedApplications),
      icon: Activity,
      color: "text-deep-forest",
    },
  ];

  return (
    <div className="rounded-2xl border border-deep-forest/15 bg-pale-canvas p-6 text-deep-forest">
      <h4 className="text-lg font-bold text-deep-forest mb-6">
        Platform Activity
      </h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-deep-forest/65">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                {stat.label}
              </span>
              <span className={`text-lg font-bold ${stat.color}`}>
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
