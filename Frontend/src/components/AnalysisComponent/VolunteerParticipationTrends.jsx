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
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
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

  const commonProps = {
    data: monthlyData,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  const renderChart = () => {
    if (isLoading) {
      return <div className="flex h-full items-center justify-center text-gray-500">Loading trend...</div>;
    }

    if (monthlyData.length === 0) {
      return <div className="flex h-full items-center justify-center text-gray-500">No trend data yet</div>;
    }

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="applications" fill="#3b82f6" name="Applications" radius={[8, 8, 0, 0]} />
          <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} name="Applications" />
          <Line type="monotone" dataKey="serviceHours" stroke="#8b5cf6" strokeWidth={3} name="Service Hours" />
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="applications"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorApplications)"
          name="Applications"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorCompleted)"
          name="Completed"
        />
      </AreaChart>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Volunteer Participation Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Applications, completions, and service hours over the last 6 months
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
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
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Peak Month</p>
          <p className="text-lg font-bold text-gray-900">{totals.peak.month}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Applications</p>
          <p className="text-lg font-bold text-blue-600">{totals.applications}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-lg font-bold text-green-600">{totals.completed}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Service Hours</p>
          <p className="text-lg font-bold text-purple-600">
            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(totals.serviceHours)}h
          </p>
        </div>
      </div>
    </div>
  );
}

export default VolunteerParticipationTrends;
