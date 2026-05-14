import React from "react";
import { Activity, Clock, Users as UsersIcon, AlertCircle } from "lucide-react";

const stats = [
  {
    label: "System Uptime",
    value: "99.8%",
    icon: Activity,
    color: "text-deep-forest",
  },
  {
    label: "Response Time",
    value: "1.2s",
    icon: Clock,
    color: "text-foudre-pink",
  },
  {
    label: "Active Sessions",
    value: "247",
    icon: UsersIcon,
    color: "text-bubblegum-blush",
  },
  {
    label: "Error Rate",
    value: "0.03%",
    icon: AlertCircle,
    color: "text-deep-forest",
  },
];

function PlatformHealth() {
  return (
    <div className="rounded-2xl border border-deep-forest/15 bg-pale-canvas p-6 text-deep-forest">
      <h4 className="text-lg font-bold text-deep-forest mb-6">
        Platform Health
      </h4>

      <div className="space-y-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-deep-forest/65">{stat.label}</span>
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
