import React from "react";
import ModalActivity from "../ModalActivity/ModalActivity";
import { useDashboardAnalytics } from "../../hook/useAnalysis";

const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat("en-US", options).format(Number(value || 0));

function GrowthMetric() {
  const { data, isLoading } = useDashboardAnalytics();

  const metrics = [
    ["Applications", formatNumber(data?.totalApplications)],
    ["Approval Rate", `${Math.round(data?.approvalRate || 0)}%`],
    ["Completions", formatNumber(data?.completedApplications)],
    ["Service Hours", `${formatNumber(data?.totalServiceHours, { maximumFractionDigits: 1 })}h`],
  ];

  return (
    <div>
      <ModalActivity title="Growth Metric" subtile="Growth Metric">
        <div className="grid grid-cols-2 gap-3 px-6 py-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-deep-forest/10 p-3">
              <p className="text-xs font-medium text-deep-forest/60">{label}</p>
              <p className="mt-1 text-xl font-bold text-deep-forest">
                {isLoading ? "..." : value}
              </p>
            </div>
          ))}
        </div>
      </ModalActivity>
    </div>
  );
}

export default GrowthMetric;
