import React from "react";
import QuickActionButton from "./QuickActionButton";
import { useAuth } from "../../hook/useAuth";
import { quickActionsConfig } from "../../constant/quickActionsConfig";

export default function QuickActionsUser() {
  const { user } = useAuth();

  // Get actions based on user role
  const actions = quickActionsConfig[user?.role] || quickActionsConfig.USER;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h4 className="text-2xl font-semibold mb-1">Quick Actions</h4>
      <p className="text-gray-500 text-sm mb-4">Common tasks and shortcuts</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <QuickActionButton key={action.id} {...action} />
        ))}
      </div>
    </div>
  );
}
