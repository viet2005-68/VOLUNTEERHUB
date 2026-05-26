import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useDashboardAnalytics } from "../../../hook/useAnalysis";

const formatMonth = (month) => {
  if (!month) return "";
  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1).toLocaleString("en-US", {
    month: "short",
  });
};

function UserRegistrationTrends() {
  const { data } = useDashboardAnalytics();
  const trendData = useMemo(
    () =>
      (data?.monthlyTrends || []).map((item) => ({
        month: formatMonth(item.month),
        applications: item.applications || 0,
        approved: item.approved || 0,
      })),
    [data]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Registration Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Applications and approvals over the last 6 months
          </p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {Math.round(data?.approvalRate || 0)}%
          </span>
        </div>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Applications"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="approved"
              stroke="#10b981"
              strokeWidth={3}
              name="Approved"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserRegistrationTrends;
