import React from "react";
import { Activity, Clock, Users as UsersIcon, AlertCircle } from "lucide-react";

const stats = [
  {
    label: "System Uptime",
    value: "99.8%",
    icon: Activity,
    color: "text-green-600",
  },
  {
    label: "Response Time",
    value: "1.2s",
    icon: Clock,
    color: "text-blue-600",
  },
  {
    label: "Active Sessions",
    value: "247",
    icon: UsersIcon,
    color: "text-purple-600",
  },
  {
    label: "Error Rate",
    value: "0.03%",
    icon: AlertCircle,
    color: "text-green-600",
  },
];

function PlatformHealth() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">
        Platform Health
      </h4>

      <div className="space-y-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlatformHealth;
