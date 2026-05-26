import React from "react";
import { CheckCircle, Clock, Users } from "lucide-react";
import { useDashboardAnalytics } from "../../hook/useAnalysis";

const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat("en-US", options).format(Number(value || 0));

function ImpactMetrics() {
  const { data, isLoading } = useDashboardAnalytics();

  const metrics = [
    {
      label: "Total Service Hours",
      value: formatNumber(data?.totalServiceHours, { maximumFractionDigits: 1 }),
      suffix: "h",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Unique Volunteers",
      value: formatNumber(data?.uniqueVolunteers),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Completed Registrations",
      value: formatNumber(data?.completedApplications),
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  const avgHours =
    Number(data?.completedApplications || 0) > 0
      ? Number(data?.totalServiceHours || 0) / Number(data.completedApplications)
      : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Metrics</h3>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-gray-500">
          Loading impact...
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                    {metric.suffix && (
                      <span className="ml-1 text-base font-semibold">{metric.suffix}</span>
                    )}
                  </p>
                  {index < metrics.length - 1 && (
                    <div className="w-full h-px bg-gray-200 mt-4" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">This Month</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data?.thisMonthServiceHours, { maximumFractionDigits: 1 })}h
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Avg. per Completion</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(avgHours, { maximumFractionDigits: 1 })}h
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ImpactMetrics;
