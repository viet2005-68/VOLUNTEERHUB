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
        <div className="rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-3 text-deep-forest shadow-lg">
          <p className="font-bold leading-[1.2] text-deep-forest">{label}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm font-medium leading-[1.2]" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-6 text-deep-forest shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-beni text-[42px] font-black uppercase leading-[0.75] text-deep-forest sm:text-[48px]">
            Registration Trends
          </h3>
          <p className="mt-2 text-sm font-medium leading-[1.2] text-deep-forest/65">
            Applications and approvals over the last 6 months
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-[10px] bg-deep-forest/10 px-3 py-2 text-deep-forest">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-bold leading-[1]">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#fce5df" />
            <XAxis dataKey="month" stroke="#00522d" tick={{ fontSize: 12, fill: "#00522d" }} />
            <YAxis stroke="#00522d" tick={{ fontSize: 12, fill: "#00522d" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#db3c8a"
              strokeWidth={3}
              name="Applications"
              dot={false}
              activeDot={{ r: 6, fill: "#db3c8a", stroke: "#fff8f6", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="approved"
              stroke="#00522d"
              strokeWidth={3}
              name="Approved"
              dot={false}
              activeDot={{ r: 6, fill: "#00522d", stroke: "#fff8f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserRegistrationTrends;
