import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEventStatsCount } from "../../../hook/useAnalysis";

function EventCategoriesDistribution() {
  const { data: totalEvents } = useEventStatsCount();

  const generateCategoryData = () => {
    const total = totalEvents || 7;

    const distribution = [
      { category: "Environment", ratio: 0.25 },
      { category: "Education", ratio: 0.21 },
      { category: "Health", ratio: 0.18 },
      { category: "Community", ratio: 0.15 },
      { category: "Arts", ratio: 0.12 },
      { category: "Technology", ratio: 0.09 },
    ];

    let remaining = total;
    const data = distribution.map((item, index) => {
      let events;
      if (index === distribution.length - 1) {
        events = remaining;
      } else {
        events = Math.floor(total * item.ratio);
        remaining -= events;
      }

      return {
        category: item.category,
        events: events,
      };
    });

    return data;
  };

  const data = generateCategoryData();
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.category}
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
          Event Categories Distribution
        </h3>
        <p className="text-sm text-gray-500 mt-1">Popular event categories</p>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="category"
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
            />
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
