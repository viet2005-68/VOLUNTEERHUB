import React, { useMemo } from "react";
import { CheckCircle, ClipboardList, Clock, Users } from "lucide-react";
import { useDashboardAnalytics } from "../../hook/useAnalysis";

const formatPercent = (value) => `${Math.round(Number(value || 0))}%`;
const titleClass =
  "mb-6 font-clash-grotesk text-2xl font-bold leading-[1.05] text-deep-forest";

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
      <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
        <h3 className={titleClass}>
          Volunteer Engagement
        </h3>
        <div className="flex items-center justify-center h-64 text-deep-forest/60">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
      <h3 className={titleClass}>
        Volunteer Engagement
      </h3>

      <div className="space-y-5">
        {items.map((item) => {
          const Icon = item.icon;
          const percent = item.value.endsWith("%") ? Number(item.value.replace("%", "")) : null;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-deep-forest/70">
                  <Icon className="h-4 w-4 text-deep-forest" />
                  {item.label}
                </div>
                <span className="text-xl font-bold text-deep-forest">{item.value}</span>
              </div>
              {percent !== null && (
                <div className="h-2 rounded-full bg-ash-whisper">
                  <div
                    className="h-2 rounded-full bg-deep-forest transition-all duration-300"
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
