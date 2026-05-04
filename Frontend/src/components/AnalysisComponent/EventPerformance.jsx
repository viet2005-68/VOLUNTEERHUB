import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useOwnedEventsPagination } from "../../hook/useEvent";

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"];

function EventPerformance() {
  // Fetch owned events with large page size to get all events
  const {
    data: eventsData,
    isLoading,
    isError,
  } = useOwnedEventsPagination({
    pageNum: 0,
    pageSize: 100,
    sortedBy: "startTime",
    order: "desc",
  });

  // Process and filter events
  const chartData = useMemo(() => {
    if (!eventsData?.data) return [];

    // Filter events that have capacity and sort by participantCount
    const filteredEvents = eventsData.data
      .filter((event) => event.capacity > 0)
      .sort((a, b) => b.participantCount - a.participantCount)
      .slice(0, 5); // Get top 5

    // Transform to chart data format
    return filteredEvents.map((event) => {
      const percentage =
        event.capacity > 0
          ? Math.round((event.registrationCount / event.capacity) * 100)
          : 0;

      return {
        name: event.name,
        value: percentage,
        category: event.category?.name || "Other",
        participants: `${event.registrationCount}/${event.capacity}`,
        registrationCount: event.registrationCount,
        capacity: event.capacity,
      };
    });
  }, [eventsData]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Performance
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </div>
    );
  }

  if (isError || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Performance
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isError ? "Failed to load events" : "No events found"}
          </div>
        </div>
      </div>
    );
  }
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.category}</p>
          <p className="text-sm text-gray-600">
            Participants: {data.participants}
          </p>
          <p className="text-sm font-semibold text-blue-600">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Event Performance
      </h3>

      <div className="space-y-4">
        {chartData.map((event, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {event.name}
                </p>
                <p className="text-xs text-gray-500">{event.category}</p>
              </div>
              <div className="text-right">
                <p
                  className="font-bold text-lg"
                  style={{ color: COLORS[index] }}
                >
                  {event.value}%
                </p>
                <p className="text-xs text-gray-500">{event.participants}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${event.value}%`,
                  backgroundColor: COLORS[index],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mini Pie Chart */}
      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EventPerformance;
