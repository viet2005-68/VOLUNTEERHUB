import React, { useMemo } from "react";
import { CheckCircle, ClipboardList, Clock, Users } from "lucide-react";
import { useDashboardAnalytics } from "../../hook/useAnalysis";

const formatPercent = (value) => `${Math.round(Number(value || 0))}%`;

function VolunteerEngagement() {
  const { data, isLoading } = useDashboardAnalytics();

  const items = useMemo(
    () => [
      {
        label: "Application Rate",
        value: formatPercent(data?.applicationRate),
        icon: ClipboardList,
      },
      {
        label: "Approval Rate",
        value: formatPercent(data?.approvalRate),
        icon: CheckCircle,
      },
      {
        label: "Completion Rate",
        value: formatPercent(data?.completionRate),
        icon: Clock,
      },
      {
        label: "Unique Volunteers",
        value: new Intl.NumberFormat("en-US").format(data?.uniqueVolunteers || 0),
        icon: Users,
      },
    ],
    [data]
  );

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Volunteer Engagement
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Volunteer Engagement
      </h3>

      <div className="space-y-5">
        {items.map((item) => {
          const Icon = item.icon;
          const percent = item.value.endsWith("%") ? Number(item.value.replace("%", "")) : null;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon className="h-4 w-4 text-blue-600" />
                  {item.label}
                </div>
                <span className="text-xl font-bold text-gray-900">{item.value}</span>
              </div>
              {percent !== null && (
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VolunteerEngagement;
