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

const COLORS = ["#00522d", "#db3c8a", "#f29ebd", "#79b69c", "#d1cfe4"];

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
      <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
        <h3 className="font-beni text-[42px] font-black uppercase leading-[0.75] text-deep-forest mb-5">
          Event Performance
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-deep-forest/60">Loading events...</div>
        </div>
      </div>
    );
  }

  if (isError || chartData.length === 0) {
    return (
      <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
        <h3 className="font-beni text-[42px] font-black uppercase leading-[0.75] text-deep-forest mb-5">
          Event Performance
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-deep-forest/60">
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
        <div className="rounded-[10px] border border-ash-whisper bg-pale-canvas p-3 shadow-lg">
          <p className="font-bold text-deep-forest">{data.name}</p>
          <p className="text-sm text-deep-forest/70">{data.category}</p>
          <p className="text-sm text-deep-forest/70">
            Participants: {data.participants}
          </p>
          <p className="text-sm font-bold text-foudre-pink">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-6 shadow-sm">
      <h3 className="font-beni text-[42px] font-black uppercase leading-[0.75] text-deep-forest mb-5">
        Event Performance
      </h3>

      <div className="space-y-4">
        {chartData.map((event, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-deep-forest text-sm">
                  {event.name}
                </p>
                <p className="text-xs text-deep-forest/60">{event.category}</p>
              </div>
              <div className="text-right">
                <p
                  className="font-bold text-lg"
                  style={{ color: COLORS[index] }}
                >
                  {event.value}%
                </p>
                <p className="text-xs text-deep-forest/60">{event.participants}</p>
              </div>
            </div>
            <div className="w-full rounded-full bg-ash-whisper h-2">
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
      <div className="mt-7 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              fill="#00522d"
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
