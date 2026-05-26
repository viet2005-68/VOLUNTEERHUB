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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.status}
          </p>
          <p className="text-sm text-blue-600">
            Events: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Event Status Distribution
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Current moderation and active-event mix
        </p>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="status" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="events" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EventCategoriesDistribution;
