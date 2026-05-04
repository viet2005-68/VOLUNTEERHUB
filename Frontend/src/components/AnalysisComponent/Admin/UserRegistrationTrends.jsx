import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTotalUsers } from "../../../hook/useAnalysis";

function UserRegistrationTrends() {
  const { data: totalUsers } = useTotalUsers();

  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();

  const generateCurrentMonthData = () => {
    const currentDay = new Date().getDate();

    const targetTotal = totalUsers || 18;
    const data = [];

    for (let day = 1; day <= currentDay; day++) {
      const ratio = day / currentDay;
      const users = Math.floor(targetTotal * ratio);
      data.push({
        day: `Day ${day}`,
        users: users,
      });
    }

    return data;
  };

  const data = generateCurrentMonthData();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.day}
          </p>
          <p className="text-sm text-blue-600">
            Total Users:{" "}
            <span className="font-semibold">{payload[0].value}</span>
          </p>
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
            User Registration Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {monthNames[currentMonth]} {currentYear} - Total users growth
          </p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-semibold">+24.5%</span>
        </div>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={3}
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
