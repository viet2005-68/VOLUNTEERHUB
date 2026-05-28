import React from "react";
import { Building2, CheckCircle, ClipboardList, Loader2, Users } from "lucide-react";
import { useDashboardAnalytics } from "../../../hook/useAnalysis";

const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num || 0);

function UserGrowth() {
  const { data, isLoading } = useDashboardAnalytics();

  const stats = [
    {
      label: "Volunteers",
      value: formatNumber(data?.totalUsers),
      icon: Users,
      color: "text-deep-forest",
      bgColor: "bg-ash-whisper",
    },
    {
      label: "Managers",
      value: formatNumber(data?.totalManagers),
      icon: Building2,
      color: "text-foudre-pink",
      bgColor: "bg-foudre-pink/10",
    },
    {
      label: "Applications",
      value: formatNumber(data?.totalApplications),
      icon: ClipboardList,
      color: "text-deep-forest",
      bgColor: "bg-deep-forest/10",
    },
    {
      label: "Approved",
      value: formatNumber((data?.approvedApplications || 0) + (data?.completedApplications || 0)),
      icon: CheckCircle,
      color: "text-foudre-pink",
      bgColor: "bg-bubblegum-blush/25",
    },
  ];

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-6 text-deep-forest shadow-sm">
      <h4 className="mb-6 text-xl font-bold leading-[1.05] text-deep-forest">
        User Growth
      </h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${stat.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
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

export default UserGrowth;
