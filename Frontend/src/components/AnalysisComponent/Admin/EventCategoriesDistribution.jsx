import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardAnalytics } from "../../../hook/useAnalysis";

const LABELS = {
  approved: "Active",
  pending: "Pending",
  rejected: "Rejected",
};

function EventCategoriesDistribution() {
  const { data } = useDashboardAnalytics();
  const chartData = useMemo(
    () =>
      Object.entries(data?.eventStatusBreakdown || {}).map(([status, events]) => ({
        status: LABELS[status] || status,
        events,
      })),
    [data]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-3 text-deep-forest shadow-lg">
          <p className="font-bold leading-[1.2] text-deep-forest">
            {payload[0].payload.status}
          </p>
          <p className="text-sm font-medium leading-[1.2] text-foudre-pink">
            Events: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-6 text-deep-forest shadow-sm">
      <div className="mb-5">
        <h3 className="font-beni text-[42px] font-black uppercase leading-[0.75] text-deep-forest sm:text-[48px]">
          Event Status Distribution
        </h3>
        <p className="mt-2 text-sm font-medium leading-[1.2] text-deep-forest/65">
          Current moderation and active-event mix
        </p>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#fce5df" />
            <XAxis dataKey="status" stroke="#00522d" tick={{ fontSize: 12, fill: "#00522d" }} />
            <YAxis stroke="#00522d" tick={{ fontSize: 12, fill: "#00522d" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="events" fill="#00522d" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EventCategoriesDistribution;
