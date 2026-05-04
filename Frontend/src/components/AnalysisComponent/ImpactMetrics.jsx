import React from "react";
import { Users, Calendar, Clock } from "lucide-react";

const metrics = [
  {
    label: "Total Volunteer Hours",
    value: "1,247",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    label: "Unique Volunteers",
    value: "89",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    label: "Events This Year",
    value: "12",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
];

function ImpactMetrics() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Metrics</h3>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              </div>
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>

              {/* Decorative line */}
              {index < metrics.length - 1 && (
                <div className="w-full h-px bg-gray-200 mt-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">Average per Event</p>
            <p className="text-lg font-bold text-gray-900">104 hours</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Avg. Volunteers</p>
            <p className="text-lg font-bold text-gray-900">7.4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactMetrics;
