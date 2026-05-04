import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, BarChart2, Activity } from "lucide-react";

const monthlyData = [
  { month: "Jan", volunteers: 45, events: 2, hours: 180 },
  { month: "Feb", volunteers: 52, events: 3, hours: 210 },
  { month: "Mar", volunteers: 48, events: 2, hours: 195 },
  { month: "Apr", volunteers: 65, events: 4, hours: 280 },
  { month: "May", volunteers: 71, events: 3, hours: 310 },
  { month: "Jun", volunteers: 68, events: 3, hours: 295 },
  { month: "Jul", volunteers: 82, events: 5, hours: 380 },
  { month: "Aug", volunteers: 89, events: 4, hours: 420 },
  { month: "Sep", volunteers: 95, events: 6, hours: 465 },
  { month: "Oct", volunteers: 88, events: 4, hours: 410 },
  { month: "Nov", volunteers: 92, events: 5, hours: 445 },
  { month: "Dec", volunteers: 85, events: 4, hours: 395 },
];

function VolunteerParticipationTrends() {
  const [chartType, setChartType] = useState("area"); // area, bar, line

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: monthlyData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="volunteers" fill="#3b82f6" name="Volunteers" radius={[8, 8, 0, 0]} />
            <Bar dataKey="events" fill="#10b981" name="Events" radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="volunteers"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Volunteers"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Hours"
              dot={{ fill: "#8b5cf6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="volunteers"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVolunteers)"
              name="Volunteers"
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEvents)"
              name="Events"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Volunteer Participation Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Monthly volunteer engagement over time
          </p>
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setChartType("area")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === "area"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            Area
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === "bar"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === "line"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Line
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Peak Month</p>
          <p className="text-lg font-bold text-gray-900">September</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Avg. Volunteers</p>
          <p className="text-lg font-bold text-blue-600">73</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Events</p>
          <p className="text-lg font-bold text-green-600">45</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
          <p className="text-lg font-bold text-purple-600">+89%</p>
        </div>
      </div>
    </div>
  );
}

export default VolunteerParticipationTrends;
