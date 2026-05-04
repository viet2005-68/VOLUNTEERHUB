import React from "react";
import { Users, Building2, TrendingUp, UserCheck, Loader2 } from "lucide-react";
import { useTotalUsers, useTotalManagers } from "../../../hook/useAnalysis";

function UserGrowth() {
  const { data: totalUsers, isLoading: isLoadingUsers } = useTotalUsers();
  const { data: totalManagers, isLoading: isLoadingManagers } =
    useTotalManagers();

  // Format number with comma separator
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const stats = [
    {
      label: "Volunteers",
      value: formatNumber(totalUsers),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      isLoading: isLoadingUsers,
    },
    {
      label: "Managers",
      value: formatNumber(totalManagers),
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      isLoading: isLoadingManagers,
    },
    {
      label: "Monthly Growth",
      value: "+12.5%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isGrowth: true,
      isLoading: false, // Hardcoded
    },
    {
      label: "Retention Rate",
      value: "87.3%",
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      isLoading: false, // Hardcoded
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h4>

      <div className="space-y-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              {stat.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <span
                  className={`text-lg font-bold ${
                    stat.isGrowth ? stat.color : "text-gray-900"
                  }`}
                >
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
