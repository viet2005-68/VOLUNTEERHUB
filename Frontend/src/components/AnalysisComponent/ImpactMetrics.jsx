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
      color: "text-deep-forest",
      bgColor: "bg-ash-whisper",
    },
    {
      label: "Unique Volunteers",
      value: formatNumber(data?.uniqueVolunteers),
      icon: Users,
      color: "text-deep-forest",
      bgColor: "bg-deep-forest/10",
    },
    {
      label: "Completed Registrations",
      value: formatNumber(data?.completedApplications),
      icon: CheckCircle,
      color: "text-deep-forest",
      bgColor: "bg-ash-whisper",
    },
  ];

  const avgHours =
    Number(data?.completedApplications || 0) > 0
      ? Number(data?.totalServiceHours || 0) / Number(data.completedApplications)
      : 0;

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
      <h3 className="mb-6 font-clash-grotesk text-2xl font-bold leading-[1.05] text-deep-forest">Impact Metrics</h3>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-deep-forest/60">
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
                      className={`h-11 w-11 ${metric.bgColor} rounded-[10px] flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <p className="text-sm font-medium text-deep-forest/70">{metric.label}</p>
                  </div>
                  <p className={`text-[30px] font-bold ${metric.color}`}>
                    {metric.value}
                    {metric.suffix && (
                      <span className="ml-1 text-base font-semibold">{metric.suffix}</span>
                    )}
                  </p>
                  {index < metrics.length - 1 && (
                    <div className="w-full h-px bg-ash-whisper mt-4" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-[10px] bg-ash-whisper/45 p-4">
            <div>
              <p className="text-xs font-medium text-deep-forest/65 mb-1">This Month</p>
              <p className="text-lg font-bold text-deep-forest">
                {formatNumber(data?.thisMonthServiceHours, { maximumFractionDigits: 1 })}h
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-deep-forest/65 mb-1">Avg. per Completion</p>
              <p className="text-lg font-bold text-deep-forest">
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
