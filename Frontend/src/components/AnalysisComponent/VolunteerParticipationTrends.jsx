import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { useDashboardAnalytics } from "../../hook/useAnalysis";

const formatMonth = (month) => {
  if (!month) return "";
  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1).toLocaleString("en-US", {
    month: "short",
  });
};

function VolunteerParticipationTrends() {
  const [chartType, setChartType] = useState("area");
  const { data, isLoading } = useDashboardAnalytics();

  const monthlyData = useMemo(
    () =>
      (data?.monthlyTrends || []).map((item) => ({
        month: formatMonth(item.month),
        applications: item.applications || 0,
        approved: item.approved || 0,
        completed: item.completed || 0,
        serviceHours: item.serviceHours || 0,
      })),
    [data]
  );

  const totals = useMemo(
    () =>
      monthlyData.reduce(
        (acc, item) => ({
          applications: acc.applications + item.applications,
          completed: acc.completed + item.completed,
          serviceHours: acc.serviceHours + item.serviceHours,
          peak:
            item.applications > acc.peak.applications
              ? { month: item.month, applications: item.applications }
              : acc.peak,
        }),
        { applications: 0, completed: 0, serviceHours: 0, peak: { month: "—", applications: -1 } }
      ),
    [monthlyData]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[10px] border border-ash-whisper bg-pale-canvas p-4 shadow-lg">
          <p className="font-bold text-deep-forest mb-2">{label}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const commonProps = {
    data: monthlyData,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  const renderChart = () => {
    if (isLoading) {
      return <div className="flex h-full items-center justify-center text-deep-forest/60">Loading trend...</div>;
    }

    if (monthlyData.length === 0) {
      return <div className="flex h-full items-center justify-center text-deep-forest/60">No trend data yet</div>;
    }

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fce5df" />
          <XAxis dataKey="month" stroke="#00522d" />
          <YAxis stroke="#00522d" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="applications" fill="#00522d" name="Applications" radius={[8, 8, 0, 0]} />
          <Bar dataKey="completed" fill="#79b69c" name="Completed" radius={[8, 8, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fce5df" />
          <XAxis dataKey="month" stroke="#00522d" />
          <YAxis stroke="#00522d" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="applications" stroke="#00522d" strokeWidth={3} name="Applications" />
          <Line type="monotone" dataKey="serviceHours" stroke="#79b69c" strokeWidth={3} name="Service Hours" />
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00522d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00522d" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#79b69c" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#79b69c" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#fce5df" />
        <XAxis dataKey="month" stroke="#00522d" />
        <YAxis stroke="#00522d" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="applications"
          stroke="#00522d"
          strokeWidth={2}
          fill="url(#colorApplications)"
          name="Applications"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#79b69c"
          strokeWidth={2}
          fill="url(#colorCompleted)"
          name="Completed"
        />
      </AreaChart>
    );
  };

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-clash-grotesk text-2xl font-bold leading-[1.05] text-deep-forest">
            Volunteer Participation Trends
          </h3>
          <p className="mt-2 text-sm font-medium text-deep-forest/65">
            Applications, completions, and service hours from live analytics
          </p>
        </div>

        <div className="flex gap-2 rounded-[10px] bg-ash-whisper p-1">
          {[
            ["area", Activity],
            ["bar", BarChart2],
            ["line", TrendingUp],
          ].map(([type, Icon]) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === type
                  ? "bg-pale-canvas text-deep-forest shadow-sm"
                  : "text-deep-forest/65 hover:text-deep-forest"
              }`}
            >
              <Icon className="w-4 h-4" />
              {type[0].toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ash-whisper">
        <div className="text-center">
          <p className="text-sm font-medium text-deep-forest/65 mb-1">Peak Month</p>
          <p className="text-lg font-bold text-deep-forest">{totals.peak.month}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-deep-forest/65 mb-1">Applications</p>
          <p className="text-lg font-bold text-deep-forest">{totals.applications}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-deep-forest/65 mb-1">Completed</p>
          <p className="text-lg font-bold text-deep-forest">{totals.completed}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-deep-forest/65 mb-1">Service Hours</p>
          <p className="text-lg font-bold text-deep-forest">
            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(totals.serviceHours)}h
          </p>
        </div>
      </div>
    </div>
  );
}

export default VolunteerParticipationTrends;
