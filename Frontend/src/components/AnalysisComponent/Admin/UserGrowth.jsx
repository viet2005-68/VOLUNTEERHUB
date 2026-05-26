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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Managers",
      value: formatNumber(data?.totalManagers),
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Applications",
      value: formatNumber(data?.totalApplications),
      icon: ClipboardList,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Approved",
      value: formatNumber((data?.approvedApplications || 0) + (data?.completedApplications || 0)),
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h4>

      <div className="space-y-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
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

export default UserGrowth;
